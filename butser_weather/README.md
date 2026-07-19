# Butser Hill weather evidence collector

This unattended collector gathers public forecast and observation evidence for a later paragliding thermal assessment. It never invents missing values.

## Collected forecast data

- UKV through Open-Meteo's UKMO endpoint
- ECMWF IFS
- ICON
- GFS
- Temperature, dew point, cloud layers, radiation, precipitation, gusts, CAPE and boundary-layer height where each model exposes them
- Pressure-level temperatures, winds and geopotential heights where available
- All eight Butser RASP graph images using the three-letter weekday format

## Observation checks

- Southampton Airport METAR, `EGHI`
- Farnborough Airport METAR, `EGLF`
- RainViewer radar echo near Butser Hill
- Met Office Butser forecast-page availability
- Public Butser-area webcam-page availability
- Sunshine since sunrise estimate from radiation fields
- Current temperature and wind proxy compared with the matching UKV forecast hour

The current-value comparison is explicitly marked as a nowcast proxy until a stable, verified nearby physical weather-station feed is available.

## Outputs

The workflow writes:

- `butser_weather/output/latest.json`
- `butser_weather/output/latest.md`
- dated JSON and Markdown files
- dated RASP PNG files when Stratus serves valid images

## Automatic schedule

`.github/workflows/butser-weather.yml` runs at both UTC equivalents of 07:00 Europe/London. The Python collector contains a local-time guard, so only the correct daylight-saving run writes data.

The workflow may also be started manually from the GitHub Actions page. A manual run outside 07:00 can be tested locally with:

```bash
python butser_weather/collector.py --force
```

## Deliberate limits

- No Windy or SkySight login scraping
- No bypassing subscription or access controls
- No undocumented personal-weather-station scraping presented as verified observations
- Satellite imagery is not yet numerically interpreted because a stable, public and licensable machine endpoint has not been verified

Every unavailable source is recorded in the output with its failure reason.
