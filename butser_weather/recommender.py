#!/usr/bin/env python3
"""Rank configured South of England free-flying sites from public forecast data.

This is a planning aid only. A site can receive GO only when its wind sector is
verified in sites.json. Current club status, local observations, NOTAMs, access
rules and a pilot's own limits always override this output.
"""
from __future__ import annotations

import json
import math
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Europe/London")
ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"
CONFIG = ROOT / "sites.json"
UA = "flycast-site-recommender/1.1 (+https://github.com/Simmo-code/flycast)"
OUTLOOK_HOURS = (11, 14, 18)

HOURLY = [
    "temperature_2m", "dew_point_2m", "precipitation", "cloud_cover",
    "cloud_cover_low", "shortwave_radiation", "wind_speed_10m",
    "wind_direction_10m", "wind_gusts_10m", "boundary_layer_height", "cape"
]


def fetch_json(url: str, params: dict[str, Any]) -> dict[str, Any]:
    req = Request(f"{url}?{urlencode(params)}", headers={"User-Agent": UA})
    with urlopen(req, timeout=30) as response:
        return json.load(response)


def compass(deg: float) -> str:
    names = ["north", "north-north-east", "north-east", "east-north-east",
             "east", "east-south-east", "south-east", "south-south-east",
             "south", "south-south-west", "south-west", "west-south-west",
             "west", "west-north-west", "north-west", "north-north-west"]
    return names[int((deg % 360) / 22.5 + 0.5) % 16]


def in_sector(direction: float, sector: list[float]) -> bool:
    start, end = sector
    if start <= end:
        return start <= direction <= end
    return direction >= start or direction <= end


def angular_distance_to_sector(direction: float, sectors: list[list[float]]) -> float:
    if any(in_sector(direction, s) for s in sectors):
        return 0.0
    edges = [v for s in sectors for v in s]
    return min(abs((direction - edge + 180) % 360 - 180) for edge in edges)


def haversine_km(a_lat: float, a_lon: float, b_lat: float, b_lon: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dp = math.radians(b_lat - a_lat)
    dl = math.radians(b_lon - a_lon)
    x = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(x))


def ft(m: float | int) -> int:
    return round(float(m) * 3.28084)


def thermal_strength(radiation: float, blh_m: float, cape: float, usable_depth_m: float) -> str:
    """Plain-English thermal estimate from surface heating and mixing depth.

    This is intentionally conservative and is not a direct forecast of climb rate.
    """
    score = 0
    if radiation >= 650:
        score += 3
    elif radiation >= 450:
        score += 2
    elif radiation >= 250:
        score += 1

    if usable_depth_m >= 1200:
        score += 3
    elif usable_depth_m >= 700:
        score += 2
    elif usable_depth_m >= 300:
        score += 1

    if cape >= 300:
        score += 2
    elif cape >= 100:
        score += 1

    if score >= 7:
        return "strong"
    if score >= 4:
        return "moderate"
    if score >= 2:
        return "weak"
    return "very weak"


def make_snapshot(site: dict[str, Any], hourly: dict[str, list[Any]], index: int, hour: int) -> dict[str, Any]:
    def value(name: str, default: float = 0.0) -> float:
        arr = hourly.get(name, [])
        raw = arr[index] if index < len(arr) else None
        return float(raw) if raw is not None else default

    wind = value("wind_speed_10m")
    gust = value("wind_gusts_10m")
    direction = value("wind_direction_10m") % 360
    rain = value("precipitation")
    low_cloud = value("cloud_cover_low")
    radiation = value("shortwave_radiation")
    cape = value("cape")
    blh_m = max(0.0, value("boundary_layer_height"))
    temp = value("temperature_2m")
    dew = value("dew_point_2m", temp)

    site_elevation_m = float(site["elevation_m"])
    lcl_agl_m = max(0, round(125 * (temp - dew)))
    lcl_asl_m = round(site_elevation_m + lcl_agl_m)
    blh_asl_m = round(site_elevation_m + blh_m)
    usable_depth_m = max(0, round(min(blh_m, float(lcl_agl_m))))
    reaches_launch = usable_depth_m >= 150
    strength = thermal_strength(radiation, blh_m, cape, usable_depth_m)

    verified = bool(site.get("verified")) and bool(site.get("wind_sectors"))
    angle_error = angular_distance_to_sector(direction, site["wind_sectors"]) if verified else 180.0
    direction_score = max(0.0, 30.0 - angle_error * 0.75) if verified else 0.0
    wind_score = 20.0 if 8 <= wind <= 22 else max(0.0, 20.0 - abs(wind - 15) * 1.8)
    thermal_score = min(20.0, radiation / 45.0 + usable_depth_m / 180.0 + min(cape, 400) / 120.0)
    weather_score = max(0.0, 10.0 - rain * 5.0 - max(0.0, low_cloud - 50) / 10.0)
    confidence_score = 8.0 if verified else 2.0
    total = round(direction_score + wind_score + thermal_score + weather_score + confidence_score, 1)

    reasons: list[str] = []
    hard_no = False
    if not verified:
        reasons.append(site.get("manual_review_reason", "Wind sector is not verified"))
        hard_no = True
    elif angle_error > 20:
        reasons.append(f"Wind is {round(angle_error)}° outside the configured site sector")
        hard_no = True
    if gust >= 35:
        reasons.append(f"Forecast gusts reach {round(gust)} km/h")
        hard_no = True
    if rain >= 1.0:
        reasons.append(f"About {rain:.1f} mm rain is forecast")
        hard_no = True
    if low_cloud > 80:
        reasons.append(f"Low cloud is {round(low_cloud)}%")
    if not reaches_launch:
        reasons.append("Forecast mixing depth is unlikely to produce useful thermals above launch")
    if not reasons:
        reasons.append("Direction, wind and dry-weather checks are favourable")

    if hard_no:
        verdict = "NO GO"
    elif total >= 70:
        verdict = "GO"
    elif total >= 50:
        verdict = "MARGINAL"
    else:
        verdict = "NO GO"

    return {
        "hour_local": hour,
        "verdict": verdict,
        "score": total,
        "wind_direction_deg": round(direction),
        "wind_direction": compass(direction),
        "wind_kmh": round(wind, 1),
        "gust_kmh": round(gust, 1),
        "rain_mm": round(rain, 1),
        "low_cloud_pct": round(low_cloud),
        "solar_wm2": round(radiation),
        "cape_jkg": round(cape),
        "boundary_layer": {"agl_m": round(blh_m), "agl_ft": ft(blh_m), "asl_m": blh_asl_m, "asl_ft": ft(blh_asl_m)},
        "cloud_base": {"agl_m": lcl_agl_m, "agl_ft": ft(lcl_agl_m), "asl_m": lcl_asl_m, "asl_ft": ft(lcl_asl_m)},
        "usable_thermal_depth": {"m": usable_depth_m, "ft": ft(usable_depth_m)},
        "thermal_strength": strength,
        "thermals_reach_launch": reaches_launch,
        "reasons": reasons,
    }


def collect_site(site: dict[str, Any], today: str) -> dict[str, Any]:
    data = fetch_json("https://api.open-meteo.com/v1/forecast", {
        "latitude": site["lat"], "longitude": site["lon"],
        "hourly": ",".join(HOURLY), "forecast_days": 1,
        "timezone": "Europe/London", "wind_speed_unit": "kmh"
    })
    hourly = data["hourly"]
    time_to_index = {t: i for i, t in enumerate(hourly["time"])}

    outlooks: dict[str, dict[str, Any]] = {}
    for hour in OUTLOOK_HOURS:
        key = f"{today}T{hour:02d}:00"
        if key not in time_to_index:
            raise RuntimeError(f"No {hour:02d}:00 forecast row returned")
        outlooks[f"{hour:02d}:00"] = make_snapshot(site, hourly, time_to_index[key], hour)

    best_period = max(outlooks.items(), key=lambda pair: pair[1]["score"])
    best_time, best = best_period
    verified = bool(site.get("verified")) and bool(site.get("wind_sectors"))

    return {
        "id": site["id"],
        "name": site["name"],
        "verdict": best["verdict"],
        "score": best["score"],
        "best_period": best_time,
        "verified_for_automatic_go": verified,
        "outlooks": outlooks,
        "site": {
            "elevation": {"m": site["elevation_m"], "ft": ft(site["elevation_m"])},
            "wind_sectors": site.get("wind_sectors", []),
            "club": site["club"],
            "access": site["access"],
            "pilot_level": site["pilot_level"],
            "guide_url": site["guide_url"],
        },
    }


def compact(snapshot: dict[str, Any]) -> str:
    cb = snapshot["cloud_base"]
    return (f"**{snapshot['verdict']}**; {snapshot['thermal_strength']}; "
            f"CB {cb['agl_m']} m/{cb['agl_ft']} ft AGL; "
            f"{snapshot['wind_direction']} {snapshot['wind_direction_deg']}° "
            f"{snapshot['wind_kmh']} km/h G{snapshot['gust_kmh']}")


def render(report: dict[str, Any]) -> str:
    lines = [
        f"# South of England flying-site recommendation — {report['generated_local']}", "",
        "> Planning aid only. Cloud base and thermal strength are estimates, not measured values. Check current club status, official site guide, NOTAMs, local observations and your own limits before travelling or launching.", ""
    ]
    best = report.get("best_automatic_choice")
    if best:
        lines += [
            f"## Best automatic choice: **{best['name']} — {best['verdict']} at {best['best_period']}**",
            f"Score: **{best['score']}/100**", ""
        ]
    else:
        lines += ["## Best automatic choice: **No verified GO/MARGINAL site found**", ""]

    lines += [
        "## Whole-day outlook", "",
        "| Rank | Site | 11:00 | 14:00 | 18:00 | Best |",
        "|---:|---|---|---|---|---|"
    ]
    for rank, item in enumerate(report["ranked_sites"], 1):
        o = item["outlooks"]
        lines.append(f"| {rank} | {item['name']} | {compact(o['11:00'])} | {compact(o['14:00'])} | {compact(o['18:00'])} | {item['best_period']} — **{item['verdict']}** ({item['score']}) |")

    lines += [""]
    for item in report["ranked_sites"]:
        lines += [f"## {item['name']} — best period {item['best_period']} ({item['verdict']})", ""]
        for label in ("11:00", "14:00", "18:00"):
            s = item["outlooks"][label]
            cb = s["cloud_base"]
            bl = s["boundary_layer"]
            depth = s["usable_thermal_depth"]
            reaches = "yes" if s["thermals_reach_launch"] else "no"
            lines += [
                f"### {label} — {s['verdict']} — {s['thermal_strength']} thermals",
                f"- Wind: **{s['wind_direction']} ({s['wind_direction_deg']}°)** at **{s['wind_kmh']} km/h**, gusting **{s['gust_kmh']} km/h**",
                f"- Estimated cloud base: **{cb['agl_m']} m / {cb['agl_ft']} ft AGL**; **{cb['asl_m']} m / {cb['asl_ft']} ft ASL**",
                f"- Boundary-layer top: **{bl['agl_m']} m / {bl['agl_ft']} ft AGL**; **{bl['asl_m']} m / {bl['asl_ft']} ft ASL**",
                f"- Usable thermal depth above launch: **{depth['m']} m / {depth['ft']} ft**; thermals likely to reach launch: **{reaches}**",
                f"- Solar heating: **{s['solar_wm2']} W/m²**; CAPE: **{s['cape_jkg']} J/kg**; low cloud: **{s['low_cloud_pct']}%**; rain: **{s['rain_mm']} mm**",
                f"- Reason: {'; '.join(s['reasons'])}", ""
            ]
        lines += [
            f"- Site elevation: **{item['site']['elevation']['m']} m / {item['site']['elevation']['ft']} ft**",
            f"- Access: {item['site']['access']}", ""
        ]
    return "\n".join(lines)


def main() -> None:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    now = datetime.now(TZ)
    results = []
    errors = []
    for site in config["sites"]:
        try:
            item = collect_site(site, now.date().isoformat())
            item["distance_from_portchester"] = {
                "km_straight_line": round(haversine_km(config["home"]["lat"], config["home"]["lon"], site["lat"], site["lon"]), 1)
            }
            results.append(item)
        except Exception as exc:
            errors.append({"site": site["name"], "error": f"{type(exc).__name__}: {exc}"})

    verdict_order = {"GO": 0, "MARGINAL": 1, "NO GO": 2}
    results.sort(key=lambda x: (verdict_order.get(x["verdict"], 3), -x["score"]))
    eligible = [x for x in results if x["verified_for_automatic_go"] and x["verdict"] in {"GO", "MARGINAL"}]
    report = {
        "generated_local": now.isoformat(),
        "home": config["home"],
        "outlook_hours_local": list(OUTLOOK_HOURS),
        "best_automatic_choice": eligible[0] if eligible else None,
        "ranked_sites": results,
        "errors": errors,
        "safety_notice": "Forecast ranking is not permission or a launch decision. Official site status and on-site assessment override it."
    }
    OUTPUT.mkdir(parents=True, exist_ok=True)
    stamp = now.date().isoformat()
    (OUTPUT / "sites_latest.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    (OUTPUT / "sites_latest.md").write_text(render(report), encoding="utf-8")
    (OUTPUT / f"sites_{stamp}.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    (OUTPUT / f"sites_{stamp}.md").write_text(render(report), encoding="utf-8")
    print(render(report))


if __name__ == "__main__":
    main()
