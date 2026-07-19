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
UA = "flycast-site-recommender/1.0 (+https://github.com/Simmo-code/flycast)"

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


def mean(values: list[float | None]) -> float | None:
    good = [float(v) for v in values if v is not None]
    return sum(good) / len(good) if good else None


def collect_site(site: dict[str, Any], today: str) -> dict[str, Any]:
    data = fetch_json("https://api.open-meteo.com/v1/forecast", {
        "latitude": site["lat"], "longitude": site["lon"],
        "hourly": ",".join(HOURLY), "forecast_days": 1,
        "timezone": "Europe/London", "wind_speed_unit": "kmh"
    })
    hourly = data["hourly"]
    indices = [i for i, t in enumerate(hourly["time"])
               if t.startswith(today) and 10 <= int(t[11:13]) <= 17]
    if not indices:
        raise RuntimeError("No daytime forecast rows returned")

    def vals(name: str) -> list[float | None]:
        arr = hourly.get(name, [])
        return [arr[i] if i < len(arr) else None for i in indices]

    wind = mean(vals("wind_speed_10m")) or 0.0
    gust = max([v for v in vals("wind_gusts_10m") if v is not None] or [0.0])
    dirs = [v for v in vals("wind_direction_10m") if v is not None]
    # Circular mean for direction.
    u = mean([math.sin(math.radians(v)) for v in dirs]) or 0.0
    v = mean([math.cos(math.radians(v)) for v in dirs]) or 1.0
    direction = math.degrees(math.atan2(u, v)) % 360
    rain = sum(v for v in vals("precipitation") if v is not None)
    low_cloud = mean(vals("cloud_cover_low")) or 0.0
    radiation = mean(vals("shortwave_radiation")) or 0.0
    cape = max([v for v in vals("cape") if v is not None] or [0.0])
    blh = max([v for v in vals("boundary_layer_height") if v is not None] or [0.0])
    temp = max([v for v in vals("temperature_2m") if v is not None] or [0.0])
    dew = mean(vals("dew_point_2m"))

    verified = bool(site.get("verified")) and bool(site.get("wind_sectors"))
    angle_error = angular_distance_to_sector(direction, site["wind_sectors"]) if verified else 180.0
    direction_score = max(0.0, 30.0 - angle_error * 0.75) if verified else 0.0
    wind_score = 20.0 if 8 <= wind <= 22 else max(0.0, 20.0 - abs(wind - 15) * 1.8)
    thermal_score = min(20.0, radiation / 35.0 + min(cape, 400) / 80.0)
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
    if gust > 35:
        reasons.append(f"Forecast gusts reach {round(gust)} km/h")
        hard_no = True
    if rain >= 1.0:
        reasons.append(f"About {rain:.1f} mm rain is forecast during 10:00–17:00")
        hard_no = True
    if low_cloud > 80:
        reasons.append(f"Low cloud averages {round(low_cloud)}%")
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

    lcl_agl_m = None
    if dew is not None:
        lcl_agl_m = max(0, round(125 * (temp - dew)))

    return {
        "id": site["id"], "name": site["name"], "verdict": verdict,
        "score": total, "verified_for_automatic_go": verified,
        "forecast": {
            "period": "10:00-17:00 local",
            "wind_direction_deg": round(direction), "wind_direction": compass(direction),
            "mean_wind_kmh": round(wind, 1), "max_gust_kmh": round(gust, 1),
            "rain_mm": round(rain, 1), "mean_low_cloud_pct": round(low_cloud),
            "mean_shortwave_wm2": round(radiation), "max_cape_jkg": round(cape),
            "max_boundary_layer_m": round(blh),
            "estimated_lcl_agl": {"m": lcl_agl_m, "ft": round(lcl_agl_m * 3.28084)} if lcl_agl_m is not None else None
        },
        "site": {
            "elevation": {"m": site["elevation_m"], "ft": round(site["elevation_m"] * 3.28084)},
            "wind_sectors": site.get("wind_sectors", []), "club": site["club"],
            "access": site["access"], "pilot_level": site["pilot_level"],
            "guide_url": site["guide_url"]
        },
        "reasons": reasons
    }


def render(report: dict[str, Any]) -> str:
    lines = [
        f"# South of England flying-site recommendation — {report['generated_local']}", "",
        "> Planning aid only. Check current club status, official site guide, NOTAMs, local observations and your own limits before travelling or launching.", ""
    ]
    best = report.get("best_automatic_choice")
    if best:
        lines += [f"## Best automatic choice: **{best['name']} — {best['verdict']}**", f"Score: **{best['score']}/100**", ""]
    else:
        lines += ["## Best automatic choice: **No verified GO/MARGINAL site found**", ""]
    lines += ["## Ranked sites", "", "| Rank | Site | Verdict | Score | Wind | Gust | Rain |", "|---:|---|---|---:|---|---:|---:|"]
    for rank, item in enumerate(report["ranked_sites"], 1):
        f = item["forecast"]
        lines.append(f"| {rank} | {item['name']} | **{item['verdict']}** | {item['score']} | {f['wind_direction']} ({f['wind_direction_deg']}°), {f['mean_wind_kmh']} km/h | {f['max_gust_kmh']} km/h | {f['rain_mm']} mm |")
    lines += [""]
    for item in report["ranked_sites"]:
        f = item["forecast"]
        lines += [f"## {item['name']} — {item['verdict']}",
                  f"- Wind: **{f['wind_direction']} ({f['wind_direction_deg']}°)** at **{f['mean_wind_kmh']} km/h**, gusting **{f['max_gust_kmh']} km/h**",
                  f"- Rain: **{f['rain_mm']} mm**; low cloud: **{f['mean_low_cloud_pct']}%**; solar heating: **{f['mean_shortwave_wm2']} W/m²**",
                  f"- Site elevation: **{item['site']['elevation']['m']} m / {item['site']['elevation']['ft']} ft**",
                  f"- Access: {item['site']['access']}",
                  f"- Reason: {'; '.join(item['reasons'])}", ""]
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
    results.sort(key=lambda x: (x["verdict"] != "GO", x["verdict"] == "NO GO", -x["score"]))
    eligible = [x for x in results if x["verified_for_automatic_go"] and x["verdict"] in {"GO", "MARGINAL"}]
    report = {
        "generated_local": now.isoformat(), "home": config["home"],
        "best_automatic_choice": eligible[0] if eligible else None,
        "ranked_sites": results, "errors": errors,
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
