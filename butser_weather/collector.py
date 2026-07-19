#!/usr/bin/env python3
"""Collect Butser Hill forecasts and observations into JSON/Markdown.

Public sources only. Missing sources are recorded rather than guessed.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import statistics
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import requests
from PIL import Image
from io import BytesIO
from zoneinfo import ZoneInfo

LAT = 50.9770
LON = -0.9820
ELEVATION_M = 271
TZ = ZoneInfo("Europe/London")
UA = "flycast-butser/1.0 (+https://github.com/Simmo-code/flycast)"
TIMEOUT = 25
MODELS = {
    "UKV": "ukmo_seamless",
    "ECMWF": "ecmwf_ifs025",
    "ICON": "icon_seamless",
    "GFS": "gfs_seamless",
}
HOURLY = [
    "temperature_2m", "dew_point_2m", "relative_humidity_2m",
    "precipitation", "cloud_cover", "cloud_cover_low", "cloud_cover_mid",
    "cloud_cover_high", "shortwave_radiation", "direct_radiation",
    "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
    "boundary_layer_height", "cape", "visibility",
    "temperature_925hPa", "temperature_850hPa", "temperature_700hPa",
    "wind_speed_925hPa", "wind_direction_925hPa",
    "wind_speed_850hPa", "wind_direction_850hPa",
    "wind_speed_700hPa", "wind_direction_700hPa",
    "geopotential_height_925hPa", "geopotential_height_850hPa",
    "geopotential_height_700hPa",
]

session = requests.Session()
session.headers.update({"User-Agent": UA})


def get_json(url: str, params: dict[str, Any] | None = None) -> Any:
    r = session.get(url, params=params, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()


def compass(deg: float | None) -> str | None:
    if deg is None:
        return None
    names = ["north", "north-north-east", "north-east", "east-north-east",
             "east", "east-south-east", "south-east", "south-south-east",
             "south", "south-south-west", "south-west", "west-south-west",
             "west", "west-north-west", "north-west", "north-north-west"]
    return names[int((deg % 360) / 22.5 + 0.5) % 16]


def wind_uv(speed_kmh: float, direction_deg: float) -> tuple[float, float]:
    speed_ms = speed_kmh / 3.6
    rad = math.radians(direction_deg)
    return -speed_ms * math.sin(rad), -speed_ms * math.cos(rad)


def vector_difference(a_speed: float, a_dir: float, b_speed: float, b_dir: float) -> float:
    au, av = wind_uv(a_speed, a_dir)
    bu, bv = wind_uv(b_speed, b_dir)
    return math.hypot(au - bu, av - bv)


def metres_feet(m: float | None) -> dict[str, float] | None:
    if m is None:
        return None
    return {"m": round(m), "ft": round(m * 3.28084)}


def open_meteo_model(label: str, model: str) -> dict[str, Any]:
    params = {
        "latitude": LAT, "longitude": LON, "models": model,
        "hourly": ",".join(HOURLY), "forecast_days": 3,
        "timezone": "Europe/London", "wind_speed_unit": "kmh",
    }
    try:
        data = get_json("https://api.open-meteo.com/v1/forecast", params)
    except requests.HTTPError:
        # Some models do not expose every pressure-level field. Retry core fields.
        core = HOURLY[:16]
        params["hourly"] = ",".join(core)
        data = get_json("https://api.open-meteo.com/v1/forecast", params)
    return {"status": "ok", "model": label, "provider_model": model, "data": data}


def open_meteo_current() -> dict[str, Any]:
    params = {
        "latitude": LAT, "longitude": LON, "timezone": "Europe/London",
        "current": "temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
        "hourly": "shortwave_radiation,direct_radiation,cloud_cover,temperature_2m,wind_speed_10m,wind_direction_10m",
        "past_days": 1, "forecast_days": 1, "wind_speed_unit": "kmh",
    }
    return {"status": "ok", "note": "Open-Meteo current/nowcast proxy, not a physical hilltop station", "data": get_json("https://api.open-meteo.com/v1/forecast", params)}


def metars() -> dict[str, Any]:
    params = {"ids": "EGHI,EGLF", "format": "json", "hours": 3}
    data = get_json("https://aviationweather.gov/api/data/metar", params)
    return {"status": "ok", "stations": {x.get("icaoId", "unknown"): x for x in data}}


def rainviewer() -> dict[str, Any]:
    meta = get_json("https://api.rainviewer.com/public/weather-maps.json")
    frames = meta.get("radar", {}).get("past", [])
    if not frames:
        return {"status": "unavailable", "reason": "no radar frames"}
    frame = frames[-1]
    zoom = 8
    n = 2 ** zoom
    x = int((LON + 180.0) / 360.0 * n)
    lat_rad = math.radians(LAT)
    y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    host = meta.get("host", "https://tilecache.rainviewer.com")
    tile_url = f"{host}{frame['path']}/256/{zoom}/{x}/{y}/2/1_1.png"
    r = session.get(tile_url, timeout=TIMEOUT)
    r.raise_for_status()
    img = Image.open(BytesIO(r.content)).convert("RGBA")
    px = ((LON + 180.0) / 360.0 * n - x) * 256
    py = ((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n - y) * 256
    samples = []
    for dx in range(-4, 5):
        for dy in range(-4, 5):
            rgba = img.getpixel((max(0, min(255, int(px + dx))), max(0, min(255, int(py + dy)))))
            samples.append(rgba)
    active = sum(1 for r_, g, b, a in samples if a > 20 and max(r_, g, b) > 30)
    return {
        "status": "ok", "frame_unix": frame.get("time"), "tile_url": tile_url,
        "rain_pixels_near_site_pct": round(active / len(samples) * 100, 1),
        "interpretation": "rain likely nearby" if active >= 5 else "no meaningful radar echo at site",
        "attribution": "RainViewer",
    }


def rasp_images(target_date: datetime, output_dir: Path) -> dict[str, Any]:
    day = target_date.strftime("%a")
    products = ["main", "temp", "wind", "wind_dir", "cu", "sun", "stars", "rain"]
    output_dir.mkdir(parents=True, exist_ok=True)
    results = {}
    for product in products:
        url = f"https://app.stratus.org.uk/blip/graph/blip_{product}.php?day={day}&tp=BUT"
        try:
            r = session.get(url, timeout=TIMEOUT)
            ctype = r.headers.get("content-type", "")
            valid = r.ok and ("image" in ctype or r.content[:8] == b"\x89PNG\r\n\x1a\n") and len(r.content) > 1000
            if valid:
                path = output_dir / f"rasp_{day}_{product}.png"
                path.write_bytes(r.content)
                results[product] = {"status": "ok", "url": url, "file": str(path)}
            else:
                results[product] = {"status": "unavailable", "url": url, "http": r.status_code, "content_type": ctype, "bytes": len(r.content)}
        except Exception as exc:
            results[product] = {"status": "error", "url": url, "reason": str(exc)}
    return results


def met_office_page() -> dict[str, Any]:
    url = "https://weather.metoffice.gov.uk/forecast/gcp618npj"
    r = session.get(url, timeout=TIMEOUT)
    return {"status": "ok" if r.ok else "unavailable", "url": url, "http": r.status_code, "bytes": len(r.content)}


def webcam_checks() -> list[dict[str, Any]]:
    # Public pages likely to provide useful views; image extraction is deliberately not guessed.
    urls = [
        "https://www.southdowns.gov.uk/",
        "https://www.portsmouthweather.co.uk/",
        "https://www.webcamtaxi.com/en/england/hampshire.html",
    ]
    out = []
    for url in urls:
        try:
            r = session.get(url, timeout=TIMEOUT, allow_redirects=True)
            out.append({"url": url, "status": "reachable" if r.ok else "unavailable", "http": r.status_code, "final_url": r.url})
        except Exception as exc:
            out.append({"url": url, "status": "error", "reason": str(exc)})
    return out


def sunshine_since_sunrise(current: dict[str, Any], now: datetime) -> dict[str, Any]:
    data = current["data"]
    hourly = data.get("hourly", {})
    times = hourly.get("time", [])
    direct = hourly.get("direct_radiation", [])
    shortwave = hourly.get("shortwave_radiation", [])
    values = []
    for t, d, s in zip(times, direct, shortwave):
        dt = datetime.fromisoformat(t).replace(tzinfo=TZ)
        if dt.date() == now.date() and dt <= now and 4 <= dt.hour <= 22:
            values.append((d or 0, s or 0))
    if not values:
        return {"status": "unavailable"}
    sunny_equivalent_hours = sum(min(1.0, max(0.0, d / 500.0)) for d, _ in values)
    return {
        "status": "estimated", "sunny_equivalent_hours": round(sunny_equivalent_hours, 1),
        "mean_shortwave_wm2": round(statistics.mean(s for _, s in values), 1),
        "warning": "Derived from Open-Meteo radiation/nowcast fields; not an observed sunshine recorder",
    }


def compare_observed_to_ukv(current: dict[str, Any], ukv: dict[str, Any]) -> dict[str, Any]:
    obs = current["data"].get("current", {})
    hourly = ukv["data"].get("hourly", {})
    times = hourly.get("time", [])
    target = obs.get("time")
    if target not in times:
        return {"status": "unavailable", "reason": "matching UKV hour not found"}
    i = times.index(target)
    def v(name: str):
        arr = hourly.get(name, [])
        return arr[i] if i < len(arr) else None
    result = {
        "status": "ok", "time": target,
        "temperature_observed_proxy_c": obs.get("temperature_2m"),
        "temperature_ukv_c": v("temperature_2m"),
        "wind_observed_proxy_kmh": obs.get("wind_speed_10m"),
        "wind_ukv_kmh": v("wind_speed_10m"),
        "direction_observed_proxy_deg": obs.get("wind_direction_10m"),
        "direction_ukv_deg": v("wind_direction_10m"),
    }
    if result["temperature_observed_proxy_c"] is not None and result["temperature_ukv_c"] is not None:
        result["temperature_error_c"] = round(result["temperature_observed_proxy_c"] - result["temperature_ukv_c"], 1)
    if all(result[k] is not None for k in ["wind_observed_proxy_kmh", "wind_ukv_kmh", "direction_observed_proxy_deg", "direction_ukv_deg"]):
        result["wind_vector_error_ms"] = round(vector_difference(result["wind_observed_proxy_kmh"], result["direction_observed_proxy_deg"], result["wind_ukv_kmh"], result["direction_ukv_deg"]), 1)
    result["warning"] = "Observed values are Open-Meteo current/nowcast proxy until a verified local station feed is available"
    return result


def safe(name: str, fn):
    try:
        return fn()
    except Exception as exc:
        return {"status": "error", "source": name, "reason": f"{type(exc).__name__}: {exc}"}


def build_report(payload: dict[str, Any]) -> str:
    lines = [f"# Butser weather data run — {payload['generated_local']}", ""]
    lines.append("## Source status")
    for name, value in payload["sources"].items():
        status = value.get("status", "mixed") if isinstance(value, dict) else "mixed"
        lines.append(f"- **{name}:** {status}")
    lines += ["", "## Observation checks"]
    for name in ["metars", "rain_radar", "sunshine_since_sunrise", "ukv_reality_check"]:
        lines.append(f"- **{name}:** `{json.dumps(payload['observations'].get(name), ensure_ascii=False)[:500]}`")
    lines += ["", "This is raw evidence for a later flying assessment. Missing sources are explicit and no unavailable values are invented."]
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="butser_weather/output")
    parser.add_argument("--force", action="store_true", help="Run outside the 07:00 Europe/London schedule guard")
    args = parser.parse_args()
    now = datetime.now(TZ)
    if not args.force and now.hour != 7:
        print(f"Local time is {now:%H:%M}; scheduled collection only runs at 07:xx Europe/London")
        return 0

    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    models = {label: safe(label, lambda l=label, m=model: open_meteo_model(l, m)) for label, model in MODELS.items()}
    current = safe("open_meteo_current", open_meteo_current)
    observations = {
        "metars": safe("METAR", metars),
        "rain_radar": safe("RainViewer", rainviewer),
        "met_office": safe("Met Office page", met_office_page),
        "webcams": safe("webcams", webcam_checks),
    }
    if current.get("status") == "ok":
        observations["sunshine_since_sunrise"] = sunshine_since_sunrise(current, now)
        if models.get("UKV", {}).get("status") == "ok":
            observations["ukv_reality_check"] = compare_observed_to_ukv(current, models["UKV"])
    observations.setdefault("sunshine_since_sunrise", {"status": "unavailable"})
    observations.setdefault("ukv_reality_check", {"status": "unavailable"})

    rasp_dir = out / "rasp" / now.strftime("%Y-%m-%d")
    rasp = safe("RASP", lambda: rasp_images(now, rasp_dir))
    payload = {
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "generated_local": now.isoformat(),
        "site": {"name": "Butser Hill", "lat": LAT, "lon": LON, "elevation": metres_feet(ELEVATION_M)},
        "sources": {"models": models, "open_meteo_current": current, "rasp": rasp},
        "observations": observations,
        "limitations": [
            "No Windy or SkySight login scraping is used.",
            "Met Office official observation API requires licensed DataHub access; public Butser forecast-page reachability is checked instead.",
            "Nearby PWS feeds are included only when a stable public endpoint can be verified; no station values are scraped from undocumented pages.",
            "Sunshine is an estimate until a local station with solar radiation or sunshine-duration observations is connected.",
        ],
    }
    dated = out / f"{now:%Y-%m-%d}.json"
    latest = out / "latest.json"
    text = json.dumps(payload, indent=2, ensure_ascii=False)
    dated.write_text(text + "\n", encoding="utf-8")
    latest.write_text(text + "\n", encoding="utf-8")
    report = build_report(payload)
    (out / f"{now:%Y-%m-%d}.md").write_text(report, encoding="utf-8")
    (out / "latest.md").write_text(report, encoding="utf-8")
    print(f"Wrote {latest}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
