import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ─── SITES DATABASE ────────────────────────────────────────────────────────────
// sport: "PG" = paragliding only, "HG" = hang gliding only, "PGHG" = both
const UK_SITES = [
  // ── SKY SURFING CLUB (Hampshire South Downs) — exact data from skysurfingclub.co.uk ──
  { id: 100, name: "SSC: Butser North",       lat: 50.9824, lon: -0.9842, altitude_m: 250, aspect:  17, wind_range_min: 12, wind_range_max: 38, site_type: "hill",    pg_rating: "CP+10", region: "SSC Hampshire", sport: "PGHG", club: "Sky Surfing Club", windNote: "340–055°" },
  { id: 101, name: "SSC: Butser South",       lat: 50.9729, lon: -0.9783, altitude_m: 180, aspect: 228, wind_range_min: 10, wind_range_max: 32, site_type: "hill",    pg_rating: "CP",    region: "SSC Hampshire", sport: "PGHG", club: "Sky Surfing Club", windNote: "200–255°" },
  { id: 102, name: "SSC: Butser West",        lat: 50.9767, lon: -0.9873, altitude_m: 250, aspect: 295, wind_range_min: 12, wind_range_max: 38, site_type: "hill",    pg_rating: "CP",    region: "SSC Hampshire", sport: "PGHG", club: "Sky Surfing Club", windNote: "265–325°" },
  { id: 103, name: "SSC: Chalton",            lat: 50.9299, lon: -0.9540, altitude_m: 144, aspect:  60, wind_range_min: 12, wind_range_max: 40, site_type: "hill",    pg_rating: "CP+10", region: "SSC Hampshire", sport: "PG",   club: "Sky Surfing Club", windNote: "020–100°" },
  { id: 104, name: "SSC: Harting Down",       lat: 50.9594, lon: -0.8703, altitude_m: 229, aspect:  10, wind_range_min: 12, wind_range_max: 40, site_type: "hill",    pg_rating: "CP+10", region: "SSC Hampshire", sport: "PGHG", club: "Sky Surfing Club", windNote: "340–040°" },
  { id: 105, name: "SSC: Oxenbourne",         lat: 50.9722, lon: -0.9923, altitude_m: 250, aspect: 312, wind_range_min: 12, wind_range_max: 38, site_type: "hill",    pg_rating: "CP+10", region: "SSC Hampshire", sport: "PG",   club: "Sky Surfing Club", windNote: "265–360°" },
  { id: 106, name: "SSC: Matterley Bowl",     lat: 51.0467, lon: -1.2466, altitude_m: 160, aspect:   5, wind_range_min: 10, wind_range_max: 30, site_type: "hill",    pg_rating: "CP",    region: "SSC Hampshire", sport: "PG",   club: "Sky Surfing Club", windNote: "350–020°" },
  { id: 107, name: "SSC: Mercury (Wether Down)", lat: 50.9741, lon: -1.0384, altitude_m: 225, aspect: 73, wind_range_min: 12, wind_range_max: 40, site_type: "hill", pg_rating: "CP+10", region: "SSC Hampshire", sport: "PGHG", club: "Sky Surfing Club", windNote: "045–100°" },
  { id: 108, name: "SSC: Meon Shore",         lat: 50.8210, lon: -1.2526, altitude_m:  15, aspect: 223, wind_range_min: 15, wind_range_max: 55, site_type: "coastal", pg_rating: "CP+20", region: "SSC Hampshire", sport: "PG",   club: "Sky Surfing Club", windNote: "205–240°" },
  { id: 109, name: "SSC: Park Hill",          lat: 50.9981, lon: -1.0262, altitude_m: 190, aspect: 168, wind_range_min: 12, wind_range_max: 38, site_type: "hill",    pg_rating: "pilot", region: "SSC Hampshire", sport: "PG",   club: "Sky Surfing Club", windNote: "135–200°" },
  { id: 110, name: "SSC: Whitewool",          lat: 50.9788, lon: -1.0755, altitude_m: 190, aspect:  60, wind_range_min: 12, wind_range_max: 38, site_type: "hill",    pg_rating: "CP",    region: "SSC Hampshire", sport: "PG",   club: "Sky Surfing Club", windNote: "020–100°" },
  // ── SOUTH DOWNS & SOUTHEAST ──────────────────────────────────────────────
  { id: 1,  name: "Devil's Dyke",        lat: 50.9012, lon: -0.2234, altitude_m: 208, aspect: 180, wind_range_min: 15, wind_range_max: 40, site_type: "hill",    pg_rating: "CP",   region: "South Downs",    sport: "PGHG" },
  { id: 2,  name: "Firle Beacon",         lat: 50.8412, lon:  0.1156, altitude_m: 217, aspect: 180, wind_range_min: 12, wind_range_max: 38, site_type: "hill",    pg_rating: "open", region: "South Downs",    sport: "PGHG" },
  { id: 3,  name: "Ditchling Beacon",     lat: 50.9034, lon: -0.1078, altitude_m: 248, aspect: 180, wind_range_min: 15, wind_range_max: 40, site_type: "hill",    pg_rating: "CP",   region: "South Downs",    sport: "PGHG" },
  { id: 4,  name: "Mount Caburn",         lat: 50.8712, lon:  0.0734, altitude_m: 163, aspect: 225, wind_range_min: 12, wind_range_max: 38, site_type: "hill",    pg_rating: "CP",   region: "South Downs",    sport: "PGHG" },
  { id: 5,  name: "Windover Hill",        lat: 50.8212, lon:  0.1934, altitude_m: 197, aspect: 180, wind_range_min: 12, wind_range_max: 38, site_type: "hill",    pg_rating: "open", region: "South Downs",    sport: "PGHG" },
  { id: 6,  name: "Butser Hill",          lat: 50.9712, lon: -1.0134, altitude_m: 270, aspect: 225, wind_range_min: 15, wind_range_max: 42, site_type: "hill",    pg_rating: "CP",   region: "South Downs",    sport: "PGHG" },
  { id: 7,  name: "Bo Peep (Alciston)",   lat: 50.8334, lon:  0.1512, altitude_m: 160, aspect: 180, wind_range_min: 12, wind_range_max: 38, site_type: "hill",    pg_rating: "CP",   region: "South Downs",    sport: "HG"   },
  { id: 8,  name: "Beachy Head",          lat: 50.7412, lon:  0.2434, altitude_m: 162, aspect: 180, wind_range_min: 15, wind_range_max: 45, site_type: "coastal", pg_rating: "CP",   region: "South Downs",    sport: "PGHG" },
  { id: 9,  name: "Newhaven Cliffs",      lat: 50.7812, lon:  0.0534, altitude_m: 80,  aspect: 180, wind_range_min: 18, wind_range_max: 55, site_type: "coastal", pg_rating: "CP",   region: "South Downs",    sport: "PG"   },
  { id: 10, name: "Cissbury Ring",        lat: 50.8712, lon: -0.3734, altitude_m: 184, aspect: 225, wind_range_min: 15, wind_range_max: 40, site_type: "hill",    pg_rating: "CP",   region: "South Downs",    sport: "PGHG" },
  { id: 11, name: "Lancing Hill",         lat: 50.8312, lon: -0.3134, altitude_m: 130, aspect: 200, wind_range_min: 15, wind_range_max: 42, site_type: "hill",    pg_rating: "CP",   region: "South Downs",    sport: "HG"   },
  { id: 12, name: "Chanctonbury Ring",    lat: 50.8912, lon: -0.3934, altitude_m: 238, aspect: 200, wind_range_min: 15, wind_range_max: 42, site_type: "hill",    pg_rating: "open", region: "South Downs",    sport: "PGHG" },
  { id: 13, name: "Dunstable Downs",      lat: 51.8512, lon: -0.5334, altitude_m: 243, aspect: 270, wind_range_min: 15, wind_range_max: 45, site_type: "hill",    pg_rating: "CP",   region: "Chilterns",      sport: "PGHG" },
  // ── WALES & BLACK MOUNTAINS ──────────────────────────────────────────────
  { id: 20, name: "Hay Bluff",            lat: 52.0012, lon: -3.1234, altitude_m: 677, aspect: 315, wind_range_min: 15, wind_range_max: 50, site_type: "mountain", pg_rating: "open", region: "Black Mountains", sport: "PGHG" },
  { id: 21, name: "Blorenge",             lat: 51.7712, lon: -3.0434, altitude_m: 559, aspect: 225, wind_range_min: 15, wind_range_max: 50, site_type: "mountain", pg_rating: "open", region: "South Wales",     sport: "PGHG" },
  { id: 22, name: "Rhossili",             lat: 51.5712, lon: -4.2934, altitude_m: 193, aspect: 270, wind_range_min: 20, wind_range_max: 55, site_type: "coastal",  pg_rating: "CP",   region: "Gower",           sport: "PGHG" },
  { id: 23, name: "Llangynidr",           lat: 51.8612, lon: -3.2634, altitude_m: 519, aspect: 315, wind_range_min: 15, wind_range_max: 48, site_type: "mountain", pg_rating: "open", region: "Brecon Beacons",  sport: "PGHG" },
  { id: 24, name: "Pen y Fan",            lat: 51.8834, lon: -3.4378, altitude_m: 886, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "mountain", pg_rating: "open", region: "Brecon Beacons",  sport: "PGHG" },
  { id: 25, name: "Mynydd Llangorse",     lat: 51.9212, lon: -3.2834, altitude_m: 515, aspect: 315, wind_range_min: 15, wind_range_max: 48, site_type: "hill",     pg_rating: "open", region: "Brecon Beacons",  sport: "PGHG" },
  { id: 26, name: "Coity Mountain",       lat: 51.7512, lon: -3.1034, altitude_m: 473, aspect: 270, wind_range_min: 15, wind_range_max: 48, site_type: "mountain", pg_rating: "open", region: "South Wales",     sport: "PGHG" },
  { id: 27, name: "Pandy Ridge",          lat: 51.9312, lon: -3.0034, altitude_m: 450, aspect: 270, wind_range_min: 15, wind_range_max: 48, site_type: "hill",     pg_rating: "open", region: "Black Mountains", sport: "PGHG" },
  { id: 28, name: "Bache Hill (Kington)", lat: 52.2012, lon: -3.0234, altitude_m: 420, aspect: 270, wind_range_min: 15, wind_range_max: 48, site_type: "hill",     pg_rating: "open", region: "Mid Wales",       sport: "PGHG" },
  { id: 29, name: "Nant y Moel",          lat: 51.6312, lon: -3.5434, altitude_m: 480, aspect: 315, wind_range_min: 15, wind_range_max: 50, site_type: "hill",     pg_rating: "open", region: "South Wales",     sport: "PGHG" },
  { id: 30, name: "Great Orme",           lat: 53.3312, lon: -3.8534, altitude_m: 207, aspect: 315, wind_range_min: 15, wind_range_max: 45, site_type: "coastal",  pg_rating: "CP",   region: "North Wales",     sport: "PGHG" },
  { id: 31, name: "Moel Famau",           lat: 53.1412, lon: -3.3134, altitude_m: 555, aspect: 270, wind_range_min: 15, wind_range_max: 48, site_type: "hill",     pg_rating: "open", region: "Clwydian Range",  sport: "PGHG" },
  { id: 32, name: "Pembrokeshire Coast",  lat: 51.8612, lon: -5.0634, altitude_m: 140, aspect: 270, wind_range_min: 20, wind_range_max: 60, site_type: "coastal",  pg_rating: "CP",   region: "Pembrokeshire",   sport: "PG"   },
  // ── SOUTHWEST & DARTMOOR ─────────────────────────────────────────────────
  { id: 40, name: "Dartmoor (Pew Tor)",   lat: 50.5512, lon: -4.0934, altitude_m: 319, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "hill",    pg_rating: "open", region: "Dartmoor",    sport: "PGHG" },
  { id: 41, name: "Cosdon Hill",          lat: 50.7012, lon: -3.9034, altitude_m: 550, aspect: 315, wind_range_min: 15, wind_range_max: 50, site_type: "hill",    pg_rating: "open", region: "Dartmoor",    sport: "PGHG" },
  { id: 42, name: "Haytor",               lat: 50.5834, lon: -3.7534, altitude_m: 457, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "hill",    pg_rating: "open", region: "Dartmoor",    sport: "PGHG" },
  { id: 43, name: "Butterdon Hill",       lat: 50.3912, lon: -3.8734, altitude_m: 338, aspect: 270, wind_range_min: 15, wind_range_max: 48, site_type: "hill",    pg_rating: "open", region: "Dartmoor",    sport: "PGHG" },
  { id: 44, name: "Exmoor (Dunkery)",     lat: 51.1612, lon: -3.5934, altitude_m: 519, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "hill",    pg_rating: "open", region: "Exmoor",      sport: "PGHG" },
  { id: 45, name: "Countisbury Hill",     lat: 51.2312, lon: -3.7534, altitude_m: 310, aspect: 315, wind_range_min: 20, wind_range_max: 55, site_type: "coastal", pg_rating: "CP",   region: "Exmoor Coast",sport: "PGHG" },
  { id: 46, name: "St Agnes (Cornwall)",  lat: 50.2912, lon: -5.2034, altitude_m: 175, aspect: 270, wind_range_min: 20, wind_range_max: 60, site_type: "coastal", pg_rating: "CP",   region: "Cornwall",    sport: "PG"   },
  { id: 47, name: "Brown Willy",          lat: 50.5834, lon: -4.6134, altitude_m: 419, aspect: 270, wind_range_min: 15, wind_range_max: 52, site_type: "hill",    pg_rating: "open", region: "Bodmin Moor", sport: "PGHG" },
  { id: 48, name: "White Sheet Hill",     lat: 51.0812, lon: -2.2234, altitude_m: 243, aspect: 225, wind_range_min: 12, wind_range_max: 40, site_type: "hill",    pg_rating: "open", region: "Wiltshire",   sport: "PGHG" },
  { id: 49, name: "Westbury",             lat: 51.2645, lon: -2.1578, altitude_m: 213, aspect: 270, wind_range_min: 12, wind_range_max: 38, site_type: "hill",    pg_rating: "club", region: "Wiltshire",   sport: "PGHG" },
  { id: 50, name: "Combe Gibbet",         lat: 51.4212, lon: -1.4534, altitude_m: 297, aspect: 315, wind_range_min: 12, wind_range_max: 38, site_type: "hill",    pg_rating: "open", region: "Berkshire",   sport: "PGHG" },
  // ── PEAK DISTRICT & PENNINES ─────────────────────────────────────────────
  { id: 60, name: "Mam Tor",              lat: 53.3456, lon: -1.8014, altitude_m: 517, aspect: 270, wind_range_min: 15, wind_range_max: 45, site_type: "mountain", pg_rating: "CP",   region: "Peak District",  sport: "PGHG" },
  { id: 61, name: "Bradwell Edge",        lat: 53.3286, lon: -1.7512, altitude_m: 420, aspect: 315, wind_range_min: 12, wind_range_max: 40, site_type: "hill",     pg_rating: "CP",   region: "Peak District",  sport: "PGHG" },
  { id: 62, name: "Stanage Edge",         lat: 53.3712, lon: -1.6634, altitude_m: 458, aspect: 270, wind_range_min: 15, wind_range_max: 45, site_type: "hill",     pg_rating: "CP",   region: "Peak District",  sport: "PGHG" },
  { id: 63, name: "Rushup Edge",          lat: 53.3312, lon: -1.8434, altitude_m: 490, aspect: 180, wind_range_min: 15, wind_range_max: 45, site_type: "hill",     pg_rating: "open", region: "Peak District",  sport: "PGHG" },
  { id: 64, name: "Chrome Hill",          lat: 53.2212, lon: -1.8834, altitude_m: 426, aspect: 270, wind_range_min: 15, wind_range_max: 45, site_type: "hill",     pg_rating: "open", region: "Peak District",  sport: "HG"   },
  { id: 65, name: "Parlick",              lat: 53.8712, lon: -2.5834, altitude_m: 432, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "hill",     pg_rating: "open", region: "Lancashire",     sport: "PGHG" },
  { id: 66, name: "Pendle Hill",          lat: 53.8614, lon: -2.2998, altitude_m: 557, aspect: 315, wind_range_min: 15, wind_range_max: 45, site_type: "hill",     pg_rating: "CP",   region: "Lancashire",     sport: "PGHG" },
  { id: 67, name: "Fair Snape Fell",      lat: 53.8912, lon: -2.6134, altitude_m: 521, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "hill",     pg_rating: "open", region: "Lancashire",     sport: "PGHG" },
  { id: 68, name: "Ingleborough",         lat: 54.1712, lon: -2.3734, altitude_m: 723, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "mountain", pg_rating: "open", region: "Yorkshire Dales",sport: "PGHG" },
  { id: 69, name: "Simon's Seat",         lat: 54.0212, lon: -1.9234, altitude_m: 485, aspect: 315, wind_range_min: 15, wind_range_max: 45, site_type: "hill",     pg_rating: "open", region: "Yorkshire Dales",sport: "PGHG" },
  // ── SHROPSHIRE ───────────────────────────────────────────────────────────
  { id: 80, name: "Long Mynd",            lat: 52.5364, lon: -2.8712, altitude_m: 517, aspect: 270, wind_range_min: 15, wind_range_max: 55, site_type: "hill",    pg_rating: "open", region: "Shropshire", sport: "PGHG" },
  { id: 81, name: "Caer Caradoc",         lat: 52.5212, lon: -2.7934, altitude_m: 459, aspect: 270, wind_range_min: 15, wind_range_max: 48, site_type: "hill",    pg_rating: "CP",   region: "Shropshire", sport: "PGHG" },
  { id: 82, name: "Stiperstones",         lat: 52.5712, lon: -2.9434, altitude_m: 536, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "hill",    pg_rating: "open", region: "Shropshire", sport: "PGHG" },
  // ── LAKE DISTRICT / NORTH ────────────────────────────────────────────────
  { id: 90, name: "Clough Head",          lat: 54.6212, lon: -3.0634, altitude_m: 726, aspect: 315, wind_range_min: 15, wind_range_max: 55, site_type: "mountain", pg_rating: "open", region: "Lake District", sport: "PGHG" },
  { id: 91, name: "Latrigg",              lat: 54.6112, lon: -3.1234, altitude_m: 368, aspect: 315, wind_range_min: 12, wind_range_max: 42, site_type: "hill",     pg_rating: "CP",   region: "Lake District", sport: "PG"   },
  { id: 92, name: "Hartside",             lat: 54.7712, lon: -2.4934, altitude_m: 580, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "hill",     pg_rating: "open", region: "Cumbria",       sport: "PGHG" },
];

// ─── WEATHER ──────────────────────────────────────────────────────────────────
// Unit helpers
const kmhToMph = v => Math.round(v * 0.621371);
const fmtSpeed = (v, unit) => unit === 'mph' ? `${kmhToMph(v)} mph` : `${Math.round(v)} km/h`;
const fmtSpeedBoth = v => `${kmhToMph(Math.round(v))} mph (${Math.round(v)} km/h)`;

const FORECAST_DAYS = 7; // Extend to 7-day outlook

// ── Helper: fetch any Open-Meteo endpoint silently (returns null on failure)
async function tryFetch(url) {
  try { const r = await fetch(url); return r.ok ? r.json() : null; }
  catch { return null; }
}

// ── ECMWF IFS — primary, best medium-range for Europe
async function fetchOpenMeteo(lat, lon) {
  const base = `latitude=${lat}&longitude=${lon}`;
  const hourly = `hourly=temperature_2m,dewpoint_2m,precipitation_probability,windspeed_10m,winddirection_10m,windgusts_10m,windspeed_100m,winddirection_100m,cape,visibility,boundary_layer_height,convective_inhibition,lifted_index,cloud_cover`;
  const daily  = `daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,sunrise,sunset`;
  const opts   = `wind_speed_unit=kmh&forecast_days=${FORECAST_DAYS}&timezone=Europe%2FLondon`;
  const url = `https://api.open-meteo.com/v1/forecast?${base}&${hourly}&${daily}&${opts}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

// ── UKMO UKV 2km — actual Met Office model, highest UK resolution
async function fetchUKMO(lat, lon) {
  const base = `latitude=${lat}&longitude=${lon}`;
  const hourly = `hourly=windspeed_10m,winddirection_10m,windgusts_10m,precipitation_probability,boundary_layer_height,cape,cloud_cover`;
  const daily  = `daily=windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,precipitation_probability_max`;
  const opts   = `wind_speed_unit=kmh&forecast_days=3&timezone=Europe%2FLondon`;
  return tryFetch(`https://api.open-meteo.com/v1/ukmo?${base}&${hourly}&${daily}&${opts}`);
}

// ── DWD ICON-EU 7km — German weather service, highly reliable for Europe
async function fetchICON(lat, lon) {
  const base = `latitude=${lat}&longitude=${lon}`;
  const hourly = `hourly=windspeed_10m,winddirection_10m,windgusts_10m,precipitation_probability,boundary_layer_height,cape,cloud_cover`;
  const daily  = `daily=windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,precipitation_probability_max`;
  const opts   = `wind_speed_unit=kmh&forecast_days=3&timezone=Europe%2FLondon&models=icon_seamless`;
  return tryFetch(`https://api.open-meteo.com/v1/dwd-icon?${base}&${hourly}&${daily}&${opts}`);
}

// ── GFS — American model, good for 5-7 day outlook
async function fetchGFS(lat, lon) {
  const base = `latitude=${lat}&longitude=${lon}`;
  const hourly = `hourly=windspeed_10m,winddirection_10m,windgusts_10m,precipitation_probability,boundary_layer_height,cape`;
  const daily  = `daily=windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,precipitation_probability_max`;
  const opts   = `wind_speed_unit=kmh&forecast_days=${FORECAST_DAYS}&timezone=Europe%2FLondon&models=gfs_seamless`;
  return tryFetch(`https://api.open-meteo.com/v1/forecast?${base}&${hourly}&${daily}&${opts}`);
}

// ── Extract day slice from a secondary model raw response
function extractModelDay(raw, i) {
  if (!raw || !raw.daily) return null;
  const d = raw.daily;
  const avg = arr => { const v=(arr||[]).slice(i*24+6,i*24+18).filter(x=>x!=null); return v.length?v.reduce((a,b)=>a+b,0)/v.length:null; };
  return {
    windSpeed: d.windspeed_10m_max?.[i]??null,
    gustSpeed: d.windgusts_10m_max?.[i]??null,
    windDir:   d.winddirection_10m_dominant?.[i]??null,
    precipProb:d.precipitation_probability_max?.[i]??null,
    blHeight:  avg(raw.hourly?.boundary_layer_height),
    cape:      avg(raw.hourly?.cape),
    cloudCover:avg(raw.hourly?.cloud_cover),
  };
}

function processWeatherData(raw, rawUKMO, rawICON, rawGFS) {
  return Array.from({length: FORECAST_DAYS}, (_, i) => {
    const d   = raw.daily;
    const sl  = arr => (arr||[]).slice(i*24, i*24+24);
    const slP = arr => sl(arr).slice(6,18);
    const avg = arr => arr.length ? arr.reduce((a,b)=>a+(b||0),0)/arr.length : 0;
    const tempMax = d.temperature_2m_max[i]??15;
    const hourlyTemp2m = sl(raw.hourly.temperature_2m ?? []);
    const hourlyDew2m  = sl(raw.hourly.dewpoint_2m ?? []);
    // Hourly cloud base AGL: (T - Td) * 400 feet per degree (standard Wobus/lifted condensation formula)
    // Convert feet→metres: * 0.3048. Use surface temp and dewpoint at each hour.
    const hourlyCloudBase = hourlyTemp2m.map((t,h) => {
      const td = hourlyDew2m[h] ?? null;
      if (t == null || td == null) return null;
      const spread = Math.max(0, t - td);
      return Math.round(spread * 400 * 0.3048); // metres AGL
    });
    // Daytime average cloud base (06-18h)
    const dayCB = hourlyCloudBase.slice(6,18).filter(v=>v!=null);
    const dewpoint = avg(slP(raw.hourly.dewpoint_2m)) || ((d.temperature_2m_min[i]??8)-2);
    const hourlyBL = sl(raw.hourly.boundary_layer_height);
    const avgBL    = avg(slP(raw.hourly.boundary_layer_height));
    const avgCAPE  = avg(slP(raw.hourly.cape));
    const avgCloud = avg(slP(raw.hourly.cloud_cover)); // 0-100%

    // W* convective velocity estimate
    const wStarMs = Math.min(4.5, Math.sqrt(Math.max(0, avgCAPE/300)) * Math.max(0.3, avgBL/1200));
    // Thermal trigger hour
    const thermalTrigger = (() => { for(let h=6;h<18;h++) if((hourlyBL[h]||0)>300) return h; return null; })();
    // Lifted Index
    const liftedIdx = avg(slP(raw.hourly.lifted_index??[]));
    const cin = avg(slP(raw.hourly.convective_inhibition??[]));

    // ── Wind shear: compare 100m wind to 10m wind
    const spd10  = avg(slP(raw.hourly.windspeed_10m));
    const spd100 = avg(slP(raw.hourly.windspeed_100m??[]));
    const dir10  = d.winddirection_10m_dominant[i]??270;
    const dir100h = slP(raw.hourly.winddirection_100m??[]);
    const dir100 = dir100h.length ? avg(dir100h) : null;
    const windShear = spd100 > 0 ? (spd100 - spd10) : null; // km/h increase with height
    const shearDir  = dir100 != null ? angleDiff(dir10, dir100) : null;

    // ── Overcast risk: cloud cover >80% during key hours kills thermals
    const overcastRisk = avgCloud > 75 ? 'HIGH' : avgCloud > 50 ? 'MODERATE' : avgCloud > 25 ? 'LOW' : 'CLEAR';
    const overcastKillsDay = avgCloud > 80; // stratus warning

    // ── Sunrise / sunset for flying window
    const sunrise = d.sunrise?.[i] ? new Date(d.sunrise[i]).getHours() + new Date(d.sunrise[i]).getMinutes()/60 : 6;
    const sunset  = d.sunset?.[i]  ? new Date(d.sunset[i]).getHours()  + new Date(d.sunset[i]).getMinutes()/60  : 20;

    // ── Secondary model snapshots
    const ukmoDay = extractModelDay(rawUKMO, i);
    const iconDay = extractModelDay(rawICON, i);
    const gfsDay  = extractModelDay(rawGFS,  i);

    // ── Multi-model agreement score (0-100) across all available models
    const modelAgreement = (() => {
      const models = [ukmoDay, iconDay, gfsDay].filter(m => m?.windSpeed != null);
      if (!models.length) return null;
      const primary = d.windspeed_10m_max[i]??20;
      const avgSpdDiff = models.reduce((s,m) => s + Math.abs(primary - m.windSpeed), 0) / models.length;
      const avgDirDiff = models.reduce((s,m) => s + angleDiff(dir10, m.windDir??dir10), 0) / models.length;
      const avgRnDiff  = models.reduce((s,m) => s + Math.abs((d.precipitation_probability_max[i]??20)-(m.precipProb??20)), 0) / models.length;
      return Math.max(0, Math.round(100 - avgSpdDiff*2.5 - avgDirDiff*0.4 - avgRnDiff*0.5));
    })();

    // ── Ensemble-style wind range from spread across models
    const allWindSpeeds = [d.windspeed_10m_max[i]??20, ukmoDay?.windSpeed, iconDay?.windSpeed, gfsDay?.windSpeed].filter(v=>v!=null);
    const windMin = Math.min(...allWindSpeeds);
    const windMax = Math.max(...allWindSpeeds);

    return {
      windDir:   dir10,
      windSpeed: d.windspeed_10m_max[i]??20,
      gustSpeed: d.windgusts_10m_max[i]??28,
      precipProb:d.precipitation_probability_max[i]??20,
      tempMax, cape: avgCAPE,
      blHeight:  avgBL,
      visibility:avg(slP(raw.hourly.visibility))||8000,
      cloudBase: dayCB.length ? Math.round(dayCB.reduce((a,b)=>a+b,0)/dayCB.length) : Math.round(Math.max(0,(tempMax-dewpoint)*400*0.3048)),
      hourlyCloudBase,
      cloudCover:Math.round(avgCloud),
      hourlyWindSpeed: sl(raw.hourly.windspeed_10m),
      hourlyGusts:     sl(raw.hourly.windgusts_10m),
      hourlyWindDir:   sl(raw.hourly.winddirection_10m),
      hourlyBL,
      wStarMs, thermalTrigger, liftedIdx, cin,
      windShear, shearDir, overcastRisk, overcastKillsDay,
      sunrise, sunset,
      ukmoDay, iconDay, gfsDay,
      modelAgreement,
      windMin, windMax,
    };
  });
}

// ─── ALGORITHMS ──────────────────────────────────────────────────────────────
function angleDiff(a,b){const d=Math.abs(a-b)%360;return d>180?360-d:d;}

// Parse windNote "340-055°" or "265-325°" into {lo, hi} in degrees 0-359
// Returns null if no windNote (falls back to aspect-based window)
function parseWindWindow(windNote) {
  if (!windNote) return null;
  const m = windNote.match(/(\d{1,3})[^0-9]+(\d{1,3})/);
  if (!m) return null;
  return { lo: parseInt(m[1]), hi: parseInt(m[2]) };
}

// Check if a wind direction (degrees) is within a defined window [lo, hi]
// Handles wrap-around (e.g. 340-055 wraps through North)
function windInWindow(windDir, lo, hi) {
  const w = ((windDir % 360) + 360) % 360;
  if (lo <= hi) return w >= lo && w <= hi;
  // wraps around 0/360 (e.g. 340 to 055)
  return w >= lo || w <= hi;
}

// Returns 0-100 direction score using the site's actual wind window
// 100 = dead centre, 80 = within window, 40 = within 15° of edge, 0 = outside window
function calcDirScore(windDir, site) {
  const win = parseWindWindow(site.windNote);
  if (win) {
    // Use exact degree window from site guide
    const { lo, hi } = win;
    if (windInWindow(windDir, lo, hi)) {
      // Find centre of window for bonus scoring
      let span = hi >= lo ? hi - lo : (360 - lo) + hi;
      let centre = (lo + span / 2) % 360;
      const distFromCentre = angleDiff(windDir, centre);
      const halfSpan = span / 2;
      // Score 100 at centre, 80 at edges of window
      return Math.round(80 + 20 * Math.max(0, 1 - distFromCentre / halfSpan));
    }
    // Outside window — check how far outside
    // Find nearest edge
    const distLo = angleDiff(windDir, lo);
    const distHi = angleDiff(windDir, hi);
    const distEdge = Math.min(distLo, distHi);
    if (distEdge <= 10) return 40;   // just outside — marginal
    if (distEdge <= 20) return 15;   // noticeably cross
    return 0;                         // clearly off — effectively unflyable
  }
  // Fallback: aspect-based scoring (±30° bands)
  const dd = angleDiff(windDir, site.aspect);
  return dd<=25?100:dd<=40?85:dd<=60?65:dd<=90?35:dd<=120?10:0;
}

// Returns how many peak hours (08-18) have wind direction in window
function calcFlyableHours(hourlyWindDir, site) {
  if (!hourlyWindDir || !hourlyWindDir.length) return null;
  const win = parseWindWindow(site.windNote);
  const peak = hourlyWindDir.slice(8, 18); // 08:00–18:00
  if (!peak.length) return null;
  const goodHours = peak.filter(d => {
    if (d == null) return false;
    if (win) return windInWindow(d, win.lo, win.hi);
    return angleDiff(d, site.aspect) <= 60;
  }).length;
  return { goodHours, totalHours: peak.length };
}

function calcFlyability(site, day) {
  const {windDir,windSpeed,gustSpeed,precipProb,cape,cloudBase,visibility,blHeight,hourlyWindDir} = day;

  // ── DIRECTION: use exact window, hard cutoff outside ──────────────────────
  const dirScore = calcDirScore(windDir, site);
  const win = parseWindWindow(site.windNote);
  const inWindow = win ? windInWindow(windDir, win.lo, win.hi) : (angleDiff(windDir, site.aspect) <= 60);
  const flyableHours = calcFlyableHours(hourlyWindDir, site);

  // Hard penalty: if wind is clearly outside the window, cap score severely
  const dirMultiplier = dirScore === 0 ? 0 : 1;

  // ── SPEED ──────────────────────────────────────────────────────────────────
  let speedScore=0;
  if(windSpeed<site.wind_range_min) speedScore=Math.max(0,(windSpeed/site.wind_range_min)*70);
  else if(windSpeed<=site.wind_range_max){const p=(windSpeed-site.wind_range_min)/(site.wind_range_max-site.wind_range_min);speedScore=p<0.3?70+p*100:p<0.7?100:100-(p-0.7)*150;}
  else speedScore=Math.max(0,100-(windSpeed-site.wind_range_max)*6);

  const precipScore = precipProb<5?100:precipProb<15?85:precipProb<25?60:precipProb<40?30:0;
  const thermalIdx  = Math.min(100, Math.sqrt(Math.max(0,cape))*0.8 + blHeight/25);
  const cba         = Math.max(0,cloudBase-site.altitude_m);
  const cloudScore  = cba>1000?100:cba>600?80:cba>300?50:cba>100?20:5;
  const gr          = gustSpeed/Math.max(windSpeed,1);
  const gustScore   = gr<1.15?100:gr<1.25?85:gr<1.4?60:gr<1.6?30:5;
  const visScore    = visibility>15000?100:visibility>8000?80:visibility>5000?60:visibility>2000?25:0;

  // Weighted total — direction now 30% (was 25%), more critical
  const total = (dirScore*.30+speedScore*.20+precipScore*.13+thermalIdx*.13+cloudScore*.09+gustScore*.10+visScore*.05) * dirMultiplier;

  return {
    score:Math.round(Math.max(0,Math.min(100,total))),
    breakdown:{dirScore,speedScore,precipScore,thermalIdx,cloudScore,gustScore,visScore},
    label:total>=78?"Excellent":total>=58?"Good":total>=38?"Marginal":"Unflyable",
    color:total>=78?"#00e5ff":total>=58?"#ffd700":total>=38?"#ff8c00":"#ff3b3b",
    inWindow, flyableHours,
    windWindow: win ? `${String(win.lo).padStart(3,'0')}–${String(win.hi).padStart(3,'0')}°` : `${cDir(site.aspect)}±60°`,
  };
}

function calcXC(site, day, score) {
  if(score<38) return {label:"No XC",km:0,tier:0,color:"#ff3b3b",detail:"Site unflyable",emoji:"✗"};
  const {cape,blHeight,windSpeed,precipProb,wStarMs,cloudBase,thermalTrigger,overcastKillsDay} = day;
  // W* thermal velocity (m/s) — use pre-computed if available, else derive
  const wStar = wStarMs || (cape>0?Math.sqrt(2*cape/1000)*3.0:0);
  const ts = Math.min(5, wStar);
  const mo = new Date().getMonth();
  const dl = 8+Math.sin((mo-2)*Math.PI/6)*4; // daylight hours
  const blAGL = Math.max(0, blHeight - site.altitude_m);
  // Soaring window hours (limited by BL height and daylight)
  const sw = Math.max(0, Math.min(dl-4, blAGL/350));
  // Effective glide speed component from wind
  const windBoost = Math.min(windSpeed*0.25*sw, 30);
  // Base km: thermal climb rate × glide ratio × window
  let km = Math.round(((sw*ts*3.5*(blAGL*0.75/1000)*7)+windBoost)*(precipProb>30?0.5:precipProb>15?0.75:1)*(overcastKillsDay?0.3:1));
  km = Math.max(0, Math.min(250, km));
  const det = `W*${ts.toFixed(1)}m/s · BL${Math.round(blAGL)}m AGL · ${sw.toFixed(1)}hr window`;
  // Tiered labels matching real XC milestone distances
  if(km>=200) return {label:"200km+ Epic XC! 🏆",km,tier:6,color:"#ff00ff",detail:det,emoji:"🏆"};
  if(km>=150) return {label:"150km+ Exceptional",km,tier:5,color:"#00ffcc",detail:det,emoji:"🌟"};
  if(km>=100) return {label:"100km+ Classic day",km,tier:4,color:"#00e5ff",detail:det,emoji:"✈"};
  if(km>=50)  return {label:"50km+ XC day",km,tier:3,color:"#00e5ff",detail:det,emoji:"↗"};
  if(km>=20)  return {label:"20km+ Local XC",km,tier:2,color:"#ffd700",detail:det,emoji:"↗"};
  if(km>=5)   return {label:"Soaring day",km,tier:1,color:"#ff8c00",detail:"Thermal soaring possible",emoji:"~"};
  return {label:"Ridge/local only",km:0,tier:0,color:"#ff8c00",detail:"Weak thermals",emoji:"~"};
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [wx,setWx]           = useState({});
  const [loading,setLoading] = useState(true);
  const [updated,setUpdated] = useState(null);
  const [selSite,setSelSite] = useState(null);
  const [day,setDay]         = useState(0);
  const [tab,setTab]         = useState("map");
  const [mapReady,setMapReady] = useState(false);
  const [region,setRegion]   = useState("All");
  const [sport,setSport]     = useState("All");
  const [sort,setSort]       = useState("score");
  const [mapTileStyle,setMapTileStyle] = useState('voyager');
  const [panelCollapsed,setPanelCollapsed] = useState(false);
  const [showAirspace,setShowAirspace] = useState(false);
  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const markers = useRef([]);
  const tileLayerRef = useRef(null);
  const airspaceLayerRef = useRef(null);

  const days = useMemo(()=>{
    const t=new Date();
    return Array.from({length:7},(_,i)=>{const d=new Date(t);d.setDate(d.getDate()+i);return{date:d,label:i===0?"Today":i===1?"Tomorrow":d.toLocaleDateString("en-GB",{weekday:"short"})};});
  },[]);

  const load = useCallback(async()=>{
    setLoading(true);
    const r={};
    for(let i=0;i<UK_SITES.length;i+=10){
      await Promise.all(UK_SITES.slice(i,i+10).map(async s=>{
        try{const [ec,ukmo,icon,gfs]=await Promise.all([fetchOpenMeteo(s.lat,s.lon),fetchUKMO(s.lat,s.lon),fetchICON(s.lat,s.lon),fetchGFS(s.lat,s.lon)]);r[s.id]=processWeatherData(ec,ukmo,icon,gfs);}catch{r[s.id]=null;}
      }));
    }
    setWx(r);setUpdated(new Date());setLoading(false);
  },[]);

  const flyData = useMemo(()=>{
    const res={};
    UK_SITES.forEach(s=>{
      const w=wx[s.id];
      if(!w){res[s.id]=null;return;}
      res[s.id]=w.map(d=>{const f=calcFlyability(s,d);return{...f,xc:calcXC(s,d,f.score),dayData:d};});
    });
    return res;
  },[wx]);

  const best = useMemo(()=>
    UK_SITES.map(s=>({site:s,fly:flyData[s.id]?.[day]}))
      .filter(x=>x.fly&&x.fly.score>=55)
      .sort((a,b)=>b.fly.score-a.fly.score).slice(0,12),
  [flyData,day]);

  const ukScore = useMemo(()=>
    Array.from({length:7},(_,i)=>{const sc=UK_SITES.map(s=>flyData[s.id]?.[i]?.score??0);return Math.round(sc.reduce((a,b)=>a+b,0)/sc.length);}),
  [flyData]);

  const regions = useMemo(()=>["All",...Array.from(new Set(UK_SITES.map(s=>s.region))).sort()],[]);

  const filtered = useMemo(()=>{
    let s=UK_SITES;
    if(region!=="All") s=s.filter(x=>x.region===region);
    if(sport==="PG")   s=s.filter(x=>x.sport==="PG"||x.sport==="PGHG");
    if(sport==="HG")   s=s.filter(x=>x.sport==="HG"||x.sport==="PGHG");
    return s.sort((a,b)=>{
      if(sort==="score") return (flyData[b.id]?.[day]?.score??0)-(flyData[a.id]?.[day]?.score??0);
      if(sort==="xc")    return (flyData[b.id]?.[day]?.xc?.km??0)-(flyData[a.id]?.[day]?.xc?.km??0);
      return a.name.localeCompare(b.name);
    });
  },[region,sport,sort,flyData,day]);

  useEffect(()=>{load();},[load]);

  // ── Map init: run once on mount, keep alive always (never unmount map)
  useEffect(()=>{
    const init=()=>{
      if(!window.L||!mapRef.current||mapInst.current) return;
      mapInst.current=window.L.map(mapRef.current,{zoomControl:false}).setView([52.5,-2.8],6);
      window.L.control.zoom({position:"bottomright"}).addTo(mapInst.current);
      setMapReady(true);
    };
    if(!window.L){
      const lnk=document.createElement("link");lnk.rel="stylesheet";lnk.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(lnk);
      const scr=document.createElement("script");scr.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";scr.onload=init;document.head.appendChild(scr);
    } else init();
  },[]);

  // ── Invalidate map size whenever returning to map tab or panel collapses
  useEffect(()=>{
    if(mapInst.current){
      setTimeout(()=>mapInst.current.invalidateSize(),80);
    }
  },[tab,panelCollapsed]);

  // Tile layer switching effect
  useEffect(()=>{
    if(!mapInst.current||!mapReady) return;
    const TILES = {
      voyager:   {url:"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",    attr:"© OpenStreetMap © CARTO"},
      satellite: {url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",attr:"© Esri"},
      dark:      {url:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",              attr:"© OpenStreetMap © CARTO"},
      topo:      {url:"https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",                           attr:"© OpenTopoMap"},
      osm:       {url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",                         attr:"© OpenStreetMap"},
    };
    const t = TILES[mapTileStyle] || TILES.voyager;
    if(tileLayerRef.current){ mapInst.current.removeLayer(tileLayerRef.current); }
    tileLayerRef.current = window.L.tileLayer(t.url,{attribution:t.attr,maxZoom:19});
    tileLayerRef.current.addTo(mapInst.current);
  },[mapReady,mapTileStyle]);

  // ── UK Airspace overlay using OpenAIP GeoJSON (free, no key for tiles)
  // Key UK airspace zones hardcoded for reliability + fetch from OpenAIP
  useEffect(()=>{
    if(!mapInst.current||!mapReady) return;
    if(airspaceLayerRef.current){ mapInst.current.removeLayer(airspaceLayerRef.current); airspaceLayerRef.current=null; }
    if(!showAirspace) return;
    // Hardcoded key UK airspace areas (simplified polygons)
    const UK_AIRSPACE = [
      // London TMA (Class A) — simplified
      {name:"London TMA",type:"CTA/TMA",cls:"A",coords:[[51.1,-1.0],[51.9,0.7],[52.0,0.5],[51.8,-0.2],[51.5,-0.5],[51.2,-0.8],[51.1,-1.0]],floor:"SFC",ceiling:"FL195"},
      // Manchester TMA
      {name:"Manchester TMA",type:"TMA",cls:"A",coords:[[53.0,-3.0],[53.0,-1.5],[53.8,-1.5],[53.8,-3.0],[53.0,-3.0]],floor:"FL45",ceiling:"FL195"},
      // Birmingham CTA
      {name:"Birmingham CTA",type:"CTA",cls:"D",coords:[[52.1,-2.2],[52.1,-1.2],[52.6,-1.2],[52.6,-2.2],[52.1,-2.2]],floor:"FL55",ceiling:"FL195"},
      // Scottish TCA
      {name:"Scottish TCA",type:"TCA",cls:"D",coords:[[55.5,-5.0],[55.5,-2.0],[57.5,-2.0],[57.5,-5.0],[55.5,-5.0]],floor:"FL55",ceiling:"FL195"},
      // Heathrow CTR (Class A)
      {name:"Heathrow CTR",type:"CTR",cls:"A",coords:[[51.41,-0.61],[51.41,-0.27],[51.52,-0.27],[51.52,-0.61],[51.41,-0.61]],floor:"SFC",ceiling:"FL35"},
      // Gatwick CTR
      {name:"Gatwick CTR",type:"CTR",cls:"D",coords:[[51.11,-0.25],[51.11,0.02],[51.20,0.02],[51.20,-0.25],[51.11,-0.25]],floor:"SFC",ceiling:"FL35"},
      // Bristol CTR
      {name:"Bristol CTR",type:"CTR",cls:"D",coords:[[51.35,-2.85],[51.35,-2.40],[51.55,-2.40],[51.55,-2.85],[51.35,-2.85]],floor:"SFC",ceiling:"FL35"},
      // Bournemouth CTR
      {name:"Bournemouth CTR",type:"CTR",cls:"D",coords:[[50.73,-1.95],[50.73,-1.68],[50.84,-1.68],[50.84,-1.95],[50.73,-1.95]],floor:"SFC",ceiling:"FL35"},
      // Southampton ATZ
      {name:"Southampton ATZ",type:"ATZ",cls:"G",coords:[[50.92,-1.40],[50.92,-1.27],[50.96,-1.27],[50.96,-1.40],[50.92,-1.40]],floor:"SFC",ceiling:"2000ft"},
      // RNAS Yeovilton MATZ
      {name:"Yeovilton MATZ",type:"MATZ",cls:"MATZ",coords:[[50.93,-2.72],[50.93,-2.52],[51.04,-2.52],[51.04,-2.72],[50.93,-2.72]],floor:"SFC",ceiling:"3000ft"},
      // Brize Norton MATZ
      {name:"Brize Norton MATZ",type:"MATZ",cls:"MATZ",coords:[[51.68,-1.70],[51.68,-1.45],[51.83,-1.45],[51.83,-1.70],[51.68,-1.70]],floor:"SFC",ceiling:"3000ft"},
      // Lyneham ATZ
      {name:"Lyneham ATZ",type:"ATZ",cls:"G",coords:[[51.48,-2.02],[51.48,-1.97],[51.53,-1.97],[51.53,-2.02],[51.48,-2.02]],floor:"SFC",ceiling:"2000ft"},
      // Danger Area EG D129 Salisbury Plain
      {name:"EG D129 Salisbury Plain",type:"DANGER",cls:"D",coords:[[51.08,-2.00],[51.08,-1.60],[51.28,-1.60],[51.28,-2.00],[51.08,-2.00]],floor:"SFC",ceiling:"FL100"},
      // Danger Area EG D201 Dartmoor
      {name:"EG D201 Dartmoor",type:"DANGER",cls:"D",coords:[[50.48,-4.20],[50.48,-3.80],[50.68,-3.80],[50.68,-4.20],[50.48,-4.20]],floor:"SFC",ceiling:"FL100"},
    ];
    const typeStyle = {
      "CTR":    {fill:"#ff3b3b22",stroke:"#ff3b3b",width:2},
      "CTA/TMA":{fill:"#ff8c0018",stroke:"#ff8c00",width:1.5},
      "TMA":    {fill:"#ff8c0018",stroke:"#ff8c00",width:1.5},
      "CTA":    {fill:"#ff8c0018",stroke:"#ff8c00",width:1.5},
      "TCA":    {fill:"#ffd70018",stroke:"#ffd700",width:1.5},
      "MATZ":   {fill:"#a78bfa22",stroke:"#a78bfa",width:2},
      "ATZ":    {fill:"#00e5ff14",stroke:"#00e5ff",width:1},
      "DANGER": {fill:"#ff000033",stroke:"#ff0000",width:2,dash:"6,4"},
    };
    const layers = UK_AIRSPACE.map(zone => {
      const sty = typeStyle[zone.type] || {fill:"#ffffff11",stroke:"#ffffff",width:1};
      return window.L.polygon(zone.coords, {
        fillColor:sty.fill,
        fillOpacity:1,
        color:sty.stroke,
        weight:sty.width,
        dashArray:sty.dash||null,
        opacity:0.85,
      }).bindTooltip(
        `<b>${zone.name}</b><br/>${zone.type} Class ${zone.cls}<br/>${zone.floor} – ${zone.ceiling}`,
        {sticky:true,className:'airspace-tooltip'}
      );
    });
    airspaceLayerRef.current = window.L.layerGroup(layers).addTo(mapInst.current);
  },[mapReady,showAirspace]);

  useEffect(()=>{
    if(!mapInst.current||!mapReady) return;
    markers.current.forEach(m=>m.remove());markers.current=[];
    UK_SITES.forEach(s=>{
      const f=flyData[s.id]?.[day];
      const col=f?f.color:"#444";
      const sc=f?f.score:null;
      const wd=f?.dayData?.windDir??null;
      const inWin=f?.inWindow??false;
      // ── Wind quadrant pie chart — matches reference image style
      // Parse site wind window from windNote (e.g. "340–055°") or aspect ±60°
      const win = (() => {
        if(s.windNote){const m2=s.windNote.match(/(\d{1,3})[^0-9]+(\d{1,3})/);if(m2)return{lo:parseInt(m2[1]),hi:parseInt(m2[2])};}
        // Fallback: ±60° around aspect
        return {lo:(s.aspect-60+360)%360, hi:(s.aspect+60)%360};
      })();

      // SVG dimensions — 72px for good visibility on map
      const SZ=72, CX=36, CY=36, R=32, IR=13; // IR = inner radius (score circle)
      const toRad = deg => (deg - 90) * Math.PI / 180;
      const pt = (deg,r) => ({ x: CX + r*Math.cos(toRad(deg)), y: CY + r*Math.sin(toRad(deg)) });

      // Build pie: red full disk, then green sector for flyable window
      const lo=win.lo, hi=win.hi;
      const span = lo<=hi ? hi-lo : 360-lo+hi;
      const la = span>180?1:0; // large-arc-flag
      const pLo=pt(lo,R), pHi=pt(hi,R);
      const greenSector = span>=359
        ? `<circle cx="${CX}" cy="${CY}" r="${R}" fill="#22cc6655"/>`
        : `<path d="M${CX},${CY} L${pLo.x.toFixed(2)},${pLo.y.toFixed(2)} A${R},${R} 0 ${la},1 ${pHi.x.toFixed(2)},${pHi.y.toFixed(2)} Z" fill="#22cc6655"/>`;

      // Wind direction needle — tip touches rim, base at centre
      const needleSvg = wd!=null ? (()=>{
        const tipPt = pt(wd, R-1);
        const ndlCol = inWin ? "#00ff88" : "#ff4444";
        // Arrowhead
        const headL = pt(wd-12, R-9), headR = pt(wd+12, R-9);
        return `<line x1="${CX}" y1="${CY}" x2="${tipPt.x.toFixed(2)}" y2="${tipPt.y.toFixed(2)}" stroke="${ndlCol}" stroke-width="2.5" stroke-linecap="round"/>
          <polygon points="${tipPt.x.toFixed(2)},${tipPt.y.toFixed(2)} ${headL.x.toFixed(2)},${headL.y.toFixed(2)} ${headR.x.toFixed(2)},${headR.y.toFixed(2)}" fill="${ndlCol}"/>
          <circle cx="${CX}" cy="${CY}" r="3" fill="${ndlCol}"/>`;
      })() : "";

      // Outer ring colour = score colour; inner score text
      const scoreFontSize = sc!=null&&sc>=100 ? 12 : 14;
      const html=`<div style="width:${SZ}px;height:${SZ}px;cursor:pointer">
        <svg width="${SZ}" height="${SZ}" viewBox="0 0 ${SZ} ${SZ}">
          <!-- Dark background -->
          <circle cx="${CX}" cy="${CY}" r="${R+1}" fill="#0a1220" stroke="${col}" stroke-width="2.5"/>
          <!-- Red full = off-window fill -->
          <circle cx="${CX}" cy="${CY}" r="${R}" fill="#ff333322"/>
          <!-- Green sector = flyable window -->
          ${greenSector}
          <!-- Wind needle on top -->
          ${needleSvg}
          <!-- White centre circle to show score clearly -->
          <circle cx="${CX}" cy="${CY}" r="${IR}" fill="#0a1220" stroke="${col}88" stroke-width="1.5"/>
          <!-- Score text -->
          <text x="${CX}" y="${CY}" text-anchor="middle" dominant-baseline="middle" fill="${col}" font-size="${scoreFontSize}" font-weight="700" font-family="JetBrains Mono,monospace">${sc??'?'}</text>
          <!-- Cardinal N tick -->
          <line x1="${CX}" y1="${CY-R+2}" x2="${CX}" y2="${CY-R+6}" stroke="#ffffff33" stroke-width="1.5"/>
        </svg>
      </div>`;
      const icon=window.L.divIcon({className:"",html,iconSize:[SZ,SZ],iconAnchor:[CX,CY]});
      markers.current.push(window.L.marker([s.lat,s.lon],{icon}).addTo(mapInst.current).on("click",()=>setSelSite(s)));
    });
  },[mapReady,flyData,day]);

  const C = (score)=>score>=78?"#00e5ff":score>=58?"#ffd700":score>=38?"#ff8c00":"#ff3b3b";

  return(<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Barlow+Condensed:wght@300;400;600;700;900&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html,body{height:100%;background:#080c14;color:#c8d8f0;font-family:'Barlow Condensed',sans-serif}
      @media(max-width:700px){
        .side-panel{position:absolute!important;top:0;right:0;bottom:0;width:100vw!important;z-index:100}
        .main-wrap{position:relative}
      }
      ::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:#0d1520}::-webkit-scrollbar-thumb{background:#2a4060;border-radius:4px;border:1px solid #1a2d4a}::-webkit-scrollbar-thumb:hover{background:#3a6090}
      .side-panel{overflow-y:auto!important;overflow-x:hidden}
      .airspace-tooltip{background:#0a1220;border:1px solid #1a2d4a;color:#c8d8f0;font-family:'JetBrains Mono',monospace;font-size:11px;padding:4px 8px;border-radius:4px}
      .airspace-tooltip .leaflet-tooltip-tip{background:#0a1220}
      select{background:#0d1520;border:1px solid #1a2d4a;color:#9ab8d8;padding:4px 8px;border-radius:4px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:600;cursor:pointer}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      .fi{animation:fi 0.25s ease-out forwards}
    `}</style>
    <div style={{display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden"}}>

      {/* HEADER */}
      <header style={{background:"linear-gradient(180deg,#0a1628 0%,#080c14 100%)",borderBottom:"1px solid #1a2d4a",padding:"0 12px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:8,paddingBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:24}}>🪂</span>
            <div>
              <div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:20,letterSpacing:2,color:"#00e5ff",textTransform:"uppercase"}}>UK FLYCAST</div>
              <div style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#4a6a8a",letterSpacing:1}}>PG & HG · {UK_SITES.length} SITES · 7 DAYS · SSC ✓</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {updated&&<div style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#4a6a8a",textAlign:"right"}}><div>UPDATED</div><div style={{color:"#6a9abf"}}>{updated.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div></div>}
            <button onClick={load} disabled={loading} style={{background:loading?"#1a2d4a":"#00e5ff14",border:`1px solid ${loading?"#1a2d4a":"#00e5ff44"}`,color:loading?"#4a6a8a":"#00e5ff",padding:"5px 10px",borderRadius:4,fontFamily:"Barlow Condensed",fontWeight:700,fontSize:14,letterSpacing:1,cursor:loading?"default":"pointer",display:"flex",alignItems:"center",gap:4}}>
              <span style={{display:"inline-block",animation:loading?"spin 1s linear infinite":"none"}}>↻</span>
              {loading?"FETCHING...":"REFRESH"}
            </button>
          </div>
        </div>
        {/* 3-DAY STRIP */}
        <div style={{display:"flex",gap:6,paddingBottom:8,overflowX:"auto"}}>
          {days.map((d,i)=>{
            const sc=ukScore[i]||0; const col=C(sc);
            const lbl=sc>=78?"EXCELLENT":sc>=58?"GOOD":sc>=38?"MARGINAL":"POOR";
            const act=i===day;
            return(<button key={i} onClick={()=>setDay(i)} style={{flex:"0 0 auto",background:act?`${col}14`:"#0d1520",border:`1px solid ${act?col:"#1a2d4a"}`,borderRadius:5,padding:"4px 8px",cursor:"pointer",textAlign:"center",minWidth:58,transition:"all 0.2s"}}>
              <div style={{fontFamily:"Barlow Condensed",fontWeight:700,fontSize:13,color:act?col:"#6a9abf",letterSpacing:0,textTransform:"uppercase"}}>{d.label}</div>
              <div style={{fontFamily:"JetBrains Mono",fontSize:11,color:"#4a6a8a",marginTop:1}}>{d.date.toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</div>
              <div style={{marginTop:3,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                <div style={{fontFamily:"JetBrains Mono",fontSize:14,fontWeight:700,color:col}}>{loading?"—":sc}</div>
                
              </div>
            </button>);
          })}
          <div style={{flex:1,background:"#0d1520",border:"1px solid #1a2d4a",borderRadius:6,padding:"7px 10px",display:"flex",flexDirection:"column",justifyContent:"center",minWidth:100}}>
            <div style={{fontFamily:"Barlow Condensed",fontSize:15,color:"#4a6a8a",letterSpacing:1,marginBottom:4}}>DATA SOURCES</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {[["ECMWF","#00e5ff"],["UKMO 2km","#00ff9d"],["ICON-EU","#ffd700"],["GFS","#9ab8d8"]].map(([s,col])=>(
                <span key={s} style={{fontFamily:"JetBrains Mono",fontSize:14,color:col,background:`${col}14`,border:`1px solid ${col}44`,borderRadius:3,padding:"1px 4px"}}>{s} ✓</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav style={{background:"#0a1220",borderBottom:"1px solid #1a2d4a",display:"flex",flexShrink:0}}>
        {[{id:"map",i:"◉",l:"MAP"},{id:"best",i:"★",l:"BEST"},{id:"sites",i:"≡",l:"SITES"},{id:"forecast",i:"◈",l:"FORECAST"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px 0",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?"#00e5ff":"transparent"}`,color:tab===t.id?"#00e5ff":"#4a6a8a",fontFamily:"Barlow Condensed",fontWeight:700,fontSize:15,letterSpacing:1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            {t.i} {t.l}
          </button>
        ))}
      </nav>

      {/* MAIN */}
      <div className="main-wrap" style={{flex:1,overflow:"hidden",position:"relative",display:"flex",isolation:"isolate",minHeight:0}}>

        {/* MAP — always mounted so Leaflet never loses its container */}
        <div style={{flex:1,position:"relative",display:tab==="map"?"block":"none",minHeight:0}}>
          <div ref={mapRef} style={{width:"100%",height:"100%",position:"absolute",inset:0}} />
          {loading&&tab==="map"&&<LoadOvl total={UK_SITES.length} loaded={Object.keys(wx).length}/>}
          {/* MAP LEGEND */}
          <div style={{position:"absolute",top:10,left:10,zIndex:1000,display:tab==="map"?"block":"none",background:"#080c14dd",backdropFilter:"blur(8px)",border:"1px solid #1a2d4a",borderRadius:8,padding:"8px 12px"}}>
            <div style={{fontFamily:"Barlow Condensed",fontWeight:700,fontSize:14,color:"#6a9abf",letterSpacing:1,marginBottom:5}}>MAP KEY</div>
            {[["#00e5ff","Excellent (78+)"],["#ffd700","Good (58-77)"],["#ff8c00","Marginal (38-57)"],["#ff3b3b","Poor (<38)"]].map(([col,lbl])=>(
              <div key={lbl} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:col,border:`2px solid ${col}`,flexShrink:0}}/>
                <span style={{fontFamily:"JetBrains Mono",fontSize:12,color:"#9ab8d8"}}>{lbl}</span>
              </div>
            ))}
            <div style={{borderTop:"1px solid #1a2d4a",marginTop:5,paddingTop:5}}>
              <div style={{fontFamily:"Barlow Condensed",fontWeight:700,fontSize:12,color:"#4a6a8a",marginBottom:3}}>WIND QUADRANT</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <svg width="28" height="28"><circle cx="14" cy="14" r="13" fill="#080c14" stroke="#888" strokeWidth="1.5"/><path d="M14,14 L14,1 A13,13 0 0,1 25,14 Z" fill="#00e59644"/><circle cx="14" cy="2" r="2.5" fill="#00e596"/></svg>
                <span style={{fontFamily:"JetBrains Mono",fontSize:11,color:"#9ab8d8"}}>Green = on window</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginTop:3}}>
                <svg width="28" height="28"><circle cx="14" cy="14" r="13" fill="#080c14" stroke="#888" strokeWidth="1.5"/><circle cx="14" cy="14" r="13" fill="#ff3b3b33"/><circle cx="14" cy="2" r="2.5" fill="#ff4444"/></svg>
                <span style={{fontFamily:"JetBrains Mono",fontSize:11,color:"#9ab8d8"}}>Red = off window</span>
              </div>
            </div>
            {showAirspace&&<div style={{borderTop:"1px solid #1a2d4a",marginTop:5,paddingTop:5}}>
              <div style={{fontFamily:"Barlow Condensed",fontWeight:700,fontSize:12,color:"#4a6a8a",marginBottom:3}}>AIRSPACE</div>
              {[["#ff3b3b","CTR (Class A)"],["#ff8c00","TMA/CTA"],["#a78bfa","MATZ"],["#00e5ff","ATZ"],["#ff0000","Danger Area"]].map(([col,lbl])=>(
                <div key={lbl} style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <div style={{width:12,height:4,background:col,borderRadius:1,opacity:0.8}}/>
                  <span style={{fontFamily:"JetBrains Mono",fontSize:11,color:"#9ab8d8"}}>{lbl}</span>
                </div>
              ))}
            </div>
          </div>
          {/* MAP TILE TOGGLE + AIRSPACE */}
          <div style={{position:"absolute",bottom:90,left:10,zIndex:1000,display:tab==="map"?"flex":"none",display:"flex",flexDirection:"column",gap:4}}>
            {[
              {id:"voyager",   label:"🗺 Map",     title:"Street map"},
              {id:"satellite", label:"🛰 Sat",     title:"Satellite"},
              {id:"topo",      label:"⛰ Topo",    title:"Topographic"},
              {id:"osm",       label:"🌍 OSM",     title:"OpenStreetMap"},
              {id:"dark",      label:"🌑 Dark",    title:"Dark mode"},
            ].map(t=>(
              <button key={t.id} title={t.title} onClick={()=>setMapTileStyle(t.id)}
                style={{background:mapTileStyle===t.id?"#00e5ff":"#080c14cc",border:`1px solid ${mapTileStyle===t.id?"#00e5ff":"#1a2d4a"}`,color:mapTileStyle===t.id?"#080c14":"#9ab8d8",padding:"5px 8px",borderRadius:5,fontFamily:"Barlow Condensed",fontWeight:700,fontSize:14,cursor:"pointer",backdropFilter:"blur(4px)",whiteSpace:"nowrap"}}>
                {t.label}
              </button>
            ))}
            <div style={{width:"100%",height:1,background:"#1a2d4a",margin:"2px 0"}}/>
            <button title="Toggle UK Airspace" onClick={()=>setShowAirspace(p=>!p)}
              style={{background:showAirspace?"#ff8c00":"#080c14cc",border:`1px solid ${showAirspace?"#ff8c00":"#1a2d4a"}`,color:showAirspace?"#080c14":"#9ab8d8",padding:"5px 8px",borderRadius:5,fontFamily:"Barlow Condensed",fontWeight:700,fontSize:14,cursor:"pointer",backdropFilter:"blur(4px)",whiteSpace:"nowrap"}}>
              ✈ Airspace
            </button>
          </div>
        </div>

        {/* BEST */}
        {tab==="best"&&<div style={{flex:1,overflow:"auto",padding:12}} className="fi">
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:22,color:"#ffd700",letterSpacing:2}}>★ BEST SITES — {days[day].label.toUpperCase()}</div>
            <div style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#4a6a8a",marginTop:2}}>{best.length} sites flyable · ranked by score · PG & HG</div>
          </div>
          {loading?<LoadCards/>:best.length===0?<div style={{textAlign:"center",padding:40,color:"#4a6a8a",fontFamily:"Barlow Condensed",fontSize:18}}>No sites forecast flyable — check another day!</div>:(
            <div style={{display:"grid",gap:8}}>{best.map(({site,fly},r)=><BestCard key={site.id} site={site} fly={fly} rank={r+1} onClick={()=>setSelSite(site)}/>)}</div>
          )}
        </div>}

        {/* SITES */}
        {tab==="sites"&&<div style={{flex:1,overflow:"auto",padding:12}} className="fi">
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
            <select value={region} onChange={e=>setRegion(e.target.value)}>{regions.map(r=><option key={r} value={r}>{r}</option>)}</select>
            <select value={sport} onChange={e=>setSport(e.target.value)}><option value="All">PG + HG</option><option value="PG">PG Only</option><option value="HG">HG Only</option></select>
            <select value={sort} onChange={e=>setSort(e.target.value)}><option value="score">Sort: Flyability</option><option value="xc">Sort: XC Potential</option><option value="name">Sort: Name</option></select>
            <span style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#4a6a8a"}}>{filtered.length} sites</span>
          </div>
          <div style={{display:"grid",gap:6}}>
            {filtered.map(s=>{
              const f=flyData[s.id]?.[day]; const col=f?f.color:"#4a6a8a";
              return(<button key={s.id} onClick={()=>setSelSite(s)} style={{background:"#0d1520",border:`1px solid ${selSite?.id===s.id?col:"#1a2d4a"}`,borderRadius:6,padding:"9px 12px",cursor:"pointer",textAlign:"left",width:"100%",transition:"border-color 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontFamily:"Barlow Condensed",fontWeight:700,fontSize:17,color:"#c8d8f0"}}>{s.name}</span><SportBadge sport={s.sport}/></div>
                    <div style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#4a6a8a"}}>{s.region} · {s.altitude_m}m · {s.pg_rating}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {f&&<div style={{fontFamily:"JetBrains Mono",fontSize:15,color:f.xc.color,textAlign:"right",maxWidth:75}}>{f.xc.label}</div>}
                    <div style={{width:42,height:42,borderRadius:"50%",background:f?`${col}14`:"#1a2d4a",border:`2px solid ${col}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                      <div style={{fontFamily:"JetBrains Mono",fontSize:16,fontWeight:700,color:col,lineHeight:1}}>{loading?"—":(f?.score??"?")}</div>
                      <div style={{fontFamily:"JetBrains Mono",fontSize:14,color:col}}>{f?f.label.slice(0,4).toUpperCase():"..."}</div>
                    </div>
                  </div>
                </div>
                {f&&<div style={{marginTop:6,display:"flex",gap:3,flexWrap:"wrap"}}>
                  <WindDirPill fly={f}/>
                  <Pill label="WIND" value={`${kmhToMph(Math.round(f.dayData.windSpeed))} mph`} score={f.breakdown.speedScore}/>
                  <Pill label="RAIN" value={`${f.dayData.precipProb}%`}           score={f.breakdown.precipScore}/>
                  <Pill label="BASE" value={`${f.dayData.cloudBase}m/${Math.round(f.dayData.cloudBase*3.281)}ft`} score={f.breakdown.cloudScore}/>
                  <Pill label="CAPE" value={`${Math.round(f.dayData.cape)}`}      score={f.breakdown.thermalIdx}/>
                </div>}
              </button>);
            })}
          </div>
        </div>}

        {/* FORECAST */}
        {tab==="forecast"&&<div style={{flex:1,overflow:"auto",padding:12}} className="fi">
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:22,color:"#00e5ff",letterSpacing:2}}>7-DAY UK FORECAST</div>
            <div style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#4a6a8a",marginTop:2}}>{UK_SITES.length} sites · PG & HG</div>
          </div>
          <div style={{display:"grid",gap:10}}>
            {days.map((d,i)=>{
              const sc=ukScore[i]; const col=C(sc);
              const top=UK_SITES.map(s=>({site:s,fly:flyData[s.id]?.[i]})).filter(x=>x.fly&&x.fly.score>=58).sort((a,b)=>b.fly.score-a.fly.score).slice(0,6);
              const maxXC=Math.max(...UK_SITES.map(s=>flyData[s.id]?.[i]?.xc?.km??0));
              return(<div key={i} style={{background:"#0d1520",border:`1px solid ${i===day?col:"#1a2d4a"}`,borderRadius:8,padding:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:22,color:col,letterSpacing:1}}>{d.label.toUpperCase()}</div>
                    <div style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#4a6a8a"}}>{d.date.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>
                    {maxXC>0&&<div style={{fontFamily:"Barlow Condensed",fontSize:15,color:"#00e5ff",marginTop:2}}>✈ Max XC: {maxXC}km</div>}
                  </div>
                  <div style={{textAlign:"right"}}><div style={{fontFamily:"JetBrains Mono",fontSize:28,fontWeight:700,color:col,lineHeight:1}}>{loading?"—":sc}</div><div style={{fontFamily:"Barlow Condensed",fontSize:14,color:col}}>UK AVG</div></div>
                </div>
                <div style={{background:"#1a2d4a",borderRadius:2,height:3,marginBottom:8}}><div style={{width:`${sc}%`,height:"100%",background:`linear-gradient(90deg,${col}66,${col})`,borderRadius:2}}/></div>
                {top.length>0?<div style={{display:"grid",gap:3}}>{top.map(({site,fly})=>(
                  <div key={site.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#080c14",borderRadius:4,padding:"5px 8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontFamily:"Barlow Condensed",fontWeight:700,fontSize:15,color:"#c8d8f0"}}>{site.name}</span><SportBadge sport={site.sport} tiny/><span style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#4a6a8a"}}>{site.region}</span></div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:"JetBrains Mono",fontSize:15,color:fly.xc.color}}>{fly.xc.label}</span><span style={{fontFamily:"JetBrains Mono",fontSize:15,fontWeight:700,color:fly.color}}>{fly.score}</span></div>
                  </div>
                ))}</div>:<div style={{fontFamily:"Barlow Condensed",fontSize:15,color:"#4a6a8a",textAlign:"center",padding:"6px 0"}}>No sites forecast flyable</div>}
              </div>);
            })}
          </div>
        </div>}

        {/* Floating "show panel" button when collapsed */}
        {selSite&&panelCollapsed&&tab!=="map"&&(
          <button
            onClick={()=>setPanelCollapsed(false)}
            title="Show site panel"
            style={{
              position:"absolute", right:0, top:"50%", transform:"translateY(-50%)",
              width:28, height:72,
              background:"#0d1a2e",
              border:"1px solid #00e5ff55",
              borderRight:"none",
              borderRadius:"6px 0 0 6px",
              color:"#00e5ff", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              zIndex:300, padding:0,
              writingMode:"vertical-rl", letterSpacing:2,
              fontFamily:"Barlow Condensed", fontWeight:700, fontSize:13,
              userSelect:"none",
              boxShadow:"-2px 0 10px #00e5ff22",
            }}>◀ SHOW</button>
        )}
        {/* SITE PANEL — collapsible, scrollable, persistent */}
        {selSite&&(
          <div style={{
            display:"flex", flexDirection:"row", flexShrink:0,
            position:tab==="map"?"absolute":"relative",
            right:0, top:0, bottom:0,
            zIndex:tab==="map"?200:10,
            alignSelf:"stretch",
            width:panelCollapsed?0:"min(480px,100vw)",
            transition:"width 0.25s ease",
            overflow:"hidden",
          }}>
            {/* Collapse tab button */}
            {tab==="map"&&<button
              onClick={()=>setPanelCollapsed(p=>!p)}
              title={panelCollapsed?"Expand panel":"Collapse panel"}
              style={{
                position:"absolute",
                left:-28,
                top:"50%", transform:"translateY(-50%)",
                width:28, height:72,
                background:"#0d1a2e",
                border:"1px solid #00e5ff55",
                borderRight:"none",
                borderRadius:"6px 0 0 6px",
                color:"#00e5ff", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, zIndex:400, padding:0,
                boxShadow:"-2px 0 10px #00e5ff22",
                writingMode:"vertical-rl",
                letterSpacing:2,
                fontFamily:"Barlow Condensed", fontWeight:700,
                userSelect:"none",
              }}>
              {panelCollapsed?"◀ SHOW":"▶ HIDE"}
            </button>}
            {/* Panel content — fills wrapper */}
            <div style={{width:"min(480px,100vw)",height:"100%",overflow:"visible",flexShrink:0,display:"flex",flexDirection:"column"}}>
              <SitePanel
                site={selSite}
                flyData={flyData[selSite.id]}
                activeDay={day}
                days={days}
                onClose={()=>{setSelSite(null);setPanelCollapsed(false);}}
                onDayChange={setDay}
                onCollapse={()=>setPanelCollapsed(p=>!p)}
                isCollapsed={panelCollapsed}
              />
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{background:"#080c14",borderTop:"1px solid #1a2d4a",padding:"5px 12px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:4}}>
          <div style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#2a3d5a"}}>⚠ For planning only — always check NOTAMs, site guides & current conditions before flying</div>
          <div style={{display:"flex",gap:8}}>
            {[["Windy","https://windy.com"],["XCSkies","https://xcskies.com"],["Flybubble","https://flybubble.com/weather"],["BHPA","https://bhpa.co.uk"]].map(([l,h])=>(
              <a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#4a6a8a",textDecoration:"none",borderBottom:"1px solid #1a2d4a"}}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  </>);
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
// Wind direction status — rich display for site panel breakdown row
function WindDirStatus({ fly, dayData }) {
  const { inWindow, windWindow, flyableHours, breakdown } = fly;
  const { windDir } = dayData;
  const col = inWindow ? "#00e5ff" : breakdown.dirScore > 0 ? "#ff8c00" : "#ff3b3b";
  const icon = inWindow ? "✓" : "✗";
  const label = inWindow ? "ON WINDOW" : breakdown.dirScore > 0 ? "MARGINAL" : "OFF WINDOW";
  return (
    <span style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
      <span style={{ fontFamily:"JetBrains Mono", fontSize:15, fontWeight:700, color:col, background:`${col}18`, border:`1px solid ${col}44`, borderRadius:3, padding:"1px 5px" }}>{icon} {label}</span>
      <span style={{ fontFamily:"JetBrains Mono", fontSize:15, color:"#6a9abf" }}>{Math.round(windDir)}° ({cDir(windDir)})</span>
      <span style={{ fontFamily:"JetBrains Mono", fontSize:14, color:"#4a6a8a" }}>window: {windWindow}</span>
      {flyableHours && <span style={{ fontFamily:"JetBrains Mono", fontSize:14, color: flyableHours.goodHours >= 4 ? "#00e5ff" : flyableHours.goodHours >= 2 ? "#ffd700" : "#ff8c00" }}>{flyableHours.goodHours}/{flyableHours.totalHours}h on window</span>}
    </span>
  );
}

// Compact wind direction pill for site cards — shows ✓/✗ + direction
function WindDirPill({ fly }) {
  const { inWindow, breakdown, dayData } = fly;
  const dirScore = breakdown.dirScore;
  const col = inWindow ? '#00e596' : dirScore > 15 ? '#ff8c00' : '#ff3b3b';
  const icon = inWindow ? '✓' : '✗';
  return (
    <div style={{ background: '#080c14', border: `1px solid ${col}44`, borderRadius: 3, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#4a6a8a' }}>DIR</div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: col, fontWeight: 700 }}>{icon} {cDir(dayData.windDir)}</div>
    </div>
  );
}
function SportBadge({sport,tiny}){
  const s={fontFamily:"JetBrains Mono",fontSize:tiny?9:11,borderRadius:3,padding:tiny?"1px 3px":"2px 6px"};
  if(sport==="PGHG") return <div style={{display:"flex",gap:2}}><span style={{...s,color:"#00e5ff",background:"#00e5ff11",border:"1px solid #00e5ff33"}}>PG</span><span style={{...s,color:"#ffd700",background:"#ffd70011",border:"1px solid #ffd70033"}}>HG</span></div>;
  if(sport==="HG")   return <span style={{...s,color:"#ffd700",background:"#ffd70011",border:"1px solid #ffd70033"}}>HG</span>;
  return <span style={{...s,color:"#00e5ff",background:"#00e5ff11",border:"1px solid #00e5ff33"}}>PG</span>;
}

function ClubBadge({club}){if(!club) return null;return <span style={{fontFamily:"JetBrains Mono",fontSize:14,color:"#a78bfa",background:"#a78bfa11",border:"1px solid #a78bfa33",borderRadius:3,padding:"1px 4px",whiteSpace:"nowrap"}}>SSC</span>;}

function BestCard({site,fly,rank,onClick}){
  const col=fly.color;
  return(<button onClick={onClick} className="fi" style={{background:"#0d1520",border:`1px solid ${rank<=3?col:"#1a2d4a"}`,borderRadius:8,padding:"10px 14px",cursor:"pointer",textAlign:"left",width:"100%",animationDelay:`${rank*.04}s`,opacity:0}}>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{fontFamily:"Barlow Condensed",fontSize:22,fontWeight:900,color:rank<=3?col:"#4a6a8a",minWidth:22,textAlign:"center"}}>{rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":rank}</div>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:21,color:"#e0eeff"}}>{site.name}</span>
          <SportBadge sport={site.sport}/><ClubBadge club={site.club}/>
          <span style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#4a6a8a"}}>{site.region}</span>
        </div>
        <div style={{display:"flex",gap:6,marginTop:2,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontFamily:"Barlow Condensed",fontSize:15,color:col,fontWeight:700}}>{fly.label}</span>
          <span style={{fontFamily:"JetBrains Mono",fontSize:15,color:fly.xc.color}}>✈ {fly.xc.label}</span>
        </div>
        <div style={{marginTop:5,display:"flex",gap:3,flexWrap:"wrap"}}>
          <WindDirPill fly={fly}/>
          <Pill label="WIND" value={`${kmhToMph(Math.round(fly.dayData.windSpeed))} mph`} score={fly.breakdown.speedScore}/>
          <Pill label="RAIN" value={`${fly.dayData.precipProb}%`}           score={fly.breakdown.precipScore}/>
          <Pill label="BASE" value={`${fly.dayData.cloudBase}m`}            score={fly.breakdown.cloudScore}/>
        </div>
      </div>
      <div style={{width:50,height:50,borderRadius:"50%",background:`${col}14`,border:`2.5px solid ${col}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:`0 0 16px ${col}44`,flexShrink:0}}>
        <div style={{fontFamily:"JetBrains Mono",fontSize:18,fontWeight:700,color:col,lineHeight:1}}>{fly.score}</div>
        <div style={{fontFamily:"JetBrains Mono",fontSize:14,color:col}}>/ 100</div>
      </div>
    </div>
  </button>);
}

function SitePanel({site,flyData,activeDay,days,onClose,onDayChange,onCollapse,isCollapsed}){
  const [showH,setShowH]=useState(false);
  const f=flyData?.[activeDay]; const col=f?f.color:"#4a6a8a";
  return(<div className="fi side-panel" style={{width:"100%",background:"#0a1220",borderLeft:"1px solid #1a2d4a",overflowY:"auto",overflowX:"hidden",flexShrink:0,position:"relative",zIndex:50,height:"100%",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"10px 14px",borderBottom:"1px solid #1a2d4a",background:"#080c14",position:"sticky",top:0,zIndex:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:21,color:"#e0eeff"}}>{site.name}</div><SportBadge sport={site.sport}/><ClubBadge club={site.club}/></div>
          <div style={{fontFamily:"JetBrains Mono",fontSize:14,color:"#4a6a8a",marginTop:1}}>{site.region} · {site.altitude_m}m / {Math.round(site.altitude_m*3.281)}ft ASL</div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {onCollapse&&<button onClick={onCollapse} title={isCollapsed?"Expand":"Collapse"} style={{background:"#0d1520",border:"1px solid #00e5ff44",color:"#00e5ff",width:26,height:26,borderRadius:4,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>◁</button>}
          <button onClick={onClose} style={{background:"#1a2d4a",border:"none",color:"#6a9abf",width:26,height:26,borderRadius:4,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
      </div>
      <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
        {[{l:site.site_type.toUpperCase(),c:"#6a9abf"},{l:site.pg_rating.toUpperCase(),c:"#ffd700"},{l:site.windNote??`ASPECT ${cDir(site.aspect)}`,c:"#00e5ff"},{l:`${kmhToMph(site.wind_range_min)}–${kmhToMph(site.wind_range_max)} mph`,c:"#00e5ff"}].map(b=>(
          <span key={b.l} style={{fontFamily:"JetBrains Mono",fontSize:14,color:b.c,background:`${b.c}11`,border:`1px solid ${b.c}33`,borderRadius:3,padding:"1px 5px"}}>{b.l}</span>
        ))}
      </div>
    </div>
    <div style={{display:"flex",borderBottom:"1px solid #1a2d4a"}}>
      {days.map((d,i)=>{const fd=flyData?.[i];const c=fd?fd.color:"#4a6a8a";return(
        <button key={i} onClick={()=>onDayChange(i)} style={{flex:1,padding:"6px 4px",background:"none",border:"none",borderBottom:`2px solid ${i===activeDay?c:"transparent"}`,cursor:"pointer",textAlign:"center"}}>
          <div style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color:i===activeDay?c:"#4a6a8a"}}>{d.label.slice(0,3).toUpperCase()}</div>
          <div style={{fontFamily:"JetBrains Mono",fontSize:16,color:c,marginTop:2}}>{fd?fd.score:"—"}</div>
        </button>
      );})}
    </div>
    {f?<div style={{padding:14,flex:1}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        <div style={{width:58,height:58,borderRadius:"50%",background:`${col}14`,border:`3px solid ${col}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:`0 0 20px ${col}44`,flexShrink:0}}>
          <div style={{fontFamily:"JetBrains Mono",fontSize:22,fontWeight:700,color:col,lineHeight:1}}>{f.score}</div>
          <div style={{fontFamily:"JetBrains Mono",fontSize:14,color:col}}>/ 100</div>
        </div>
        <div>
          <div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:22,color:col,letterSpacing:1}}>{f.label.toUpperCase()}</div>
          <div style={{fontFamily:"Barlow Condensed",fontSize:15,color:f.xc.color,marginTop:1}}>{f.xc.emoji} {f.xc.label}</div>
        </div>
      </div>
      {/* Dynamic confidence badge based on model agreement */}
      {(() => {
        const ag = f.dayData.modelAgreement;
        const col = ag==null?"#ffd700":ag>=75?"#00e5ff":ag>=50?"#ffd700":"#ff8c00";
        const lbl = ag==null?"SINGLE MODEL":ag>=75?"HIGH CONFIDENCE":ag>=50?"MODERATE CONFIDENCE":"MODELS DISAGREE";
        const sub = ag==null?"ECMWF only · GFS unavailable":`ECMWF · UKMO · ICON · GFS · ${ag}% agreement`;
        return (
          <div style={{background:"#080c14",border:`1px solid ${col}33`,borderRadius:6,padding:"6px 10px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:col,boxShadow:`0 0 6px ${col}88`,flexShrink:0}}/>
            <div>
              <div style={{fontFamily:"Barlow Condensed",fontSize:15,color:col,fontWeight:700}}>{lbl}</div>
              <div style={{fontFamily:"JetBrains Mono",fontSize:14,color:"#4a6a8a"}}>{sub}</div>
            </div>
            {ag!=null&&<div style={{marginLeft:"auto",fontFamily:"JetBrains Mono",fontSize:16,fontWeight:700,color:col}}>{ag}%</div>}
          </div>
        );
      })()}
      {/* ── XC TIER INDICATOR ── */}
      {f.xc&&(()=>{
        const tiers=[
          {km:0,label:"Ridge",color:"#4a6a8a"},
          {km:5,label:"Soar",color:"#ff8c00"},
          {km:20,label:"20km",color:"#ffd700"},
          {km:50,label:"50km",color:"#ffd700"},
          {km:100,label:"100km",color:"#00e5ff"},
          {km:150,label:"150km",color:"#00ffcc"},
          {km:200,label:"200km",color:"#ff00ff"},
        ];
        const activeTier = tiers.reduce((p,t)=>f.xc.km>=t.km?t:p,tiers[0]);
        return(
          <div style={{marginBottom:12,background:"#080c14",border:"1px solid #1a2d4a",borderRadius:6,padding:"8px 10px"}}>
            <div style={{fontFamily:"Barlow Condensed",fontSize:14,color:"#4a6a8a",letterSpacing:1,marginBottom:5}}>XC POTENTIAL</div>
            <div style={{display:"flex",gap:2,marginBottom:5,alignItems:"center"}}>
              {tiers.slice(1).map(t=>{
                const active=f.xc.km>=t.km;
                return <div key={t.km} style={{flex:1,height:8,borderRadius:2,background:active?t.color:`${t.color}22`,transition:"background 0.4s",position:"relative"}}/>;
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              {tiers.slice(1).map(t=><span key={t.km} style={{flex:1,fontFamily:"JetBrains Mono",fontSize:12,color:f.xc.km>=t.km?t.color:"#2a3d5a",textAlign:"center"}}>{t.label}</span>)}
            </div>
            <div style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:activeTier.color}}>
              {f.xc.emoji} {f.xc.label}
            </div>
            {f.xc.detail&&<div style={{fontFamily:"JetBrains Mono",fontSize:13,color:"#4a6a8a",marginTop:2}}>{f.xc.detail}</div>}
          </div>
        );
      })()}
      {/* ── RASP BLIPspot link ── */}
      <div style={{marginBottom:12,display:"flex",gap:6,flexWrap:"wrap"}}>
        <a href={`http://www.blipspot.com/tools/point/?lat=${site.lat.toFixed(3)}&lon=${site.lon.toFixed(3)}`} target="_blank" rel="noopener noreferrer"
          style={{flex:1,display:"flex",alignItems:"center",gap:6,background:"#080c14",border:"1px solid #00e5ff33",borderRadius:5,padding:"6px 10px",textDecoration:"none",cursor:"pointer"}}>
          <span style={{fontSize:16}}>📡</span>
          <div>
            <div style={{fontFamily:"Barlow Condensed",fontWeight:700,fontSize:15,color:"#00e5ff",letterSpacing:1}}>RASP BLIPspot</div>
            <div style={{fontFamily:"JetBrains Mono",fontSize:12,color:"#4a6a8a"}}>Open sounding data →</div>
          </div>
        </a>
        <a href={`https://xcweather.co.uk/#${site.lat.toFixed(2)},${site.lon.toFixed(2)},13`} target="_blank" rel="noopener noreferrer"
          style={{flex:1,display:"flex",alignItems:"center",gap:6,background:"#080c14",border:"1px solid #ffd70033",borderRadius:5,padding:"6px 10px",textDecoration:"none",cursor:"pointer"}}>
          <span style={{fontSize:16}}>🌤</span>
          <div>
            <div style={{fontFamily:"Barlow Condensed",fontWeight:700,fontSize:15,color:"#ffd700",letterSpacing:1}}>XCWeather</div>
            <div style={{fontFamily:"JetBrains Mono",fontSize:12,color:"#4a6a8a"}}>Wind forecast →</div>
          </div>
        </a>
      </div>
      <div style={{marginBottom:12}}>
        <div style={{fontFamily:"Barlow Condensed",fontSize:15,color:"#4a6a8a",letterSpacing:1,marginBottom:8}}>FLYABILITY BREAKDOWN</div>
        {[
          {l:"Wind Direction",s:f.breakdown.dirScore,  v:<WindDirStatus fly={f} dayData={f.dayData}/>,w:"30%"},
          {l:"Wind Speed",    s:f.breakdown.speedScore, v:f.dayData.windMin!=null&&f.dayData.windMax!=f.dayData.windMin?`${kmhToMph(Math.round(f.dayData.windMin))}–${kmhToMph(Math.round(f.dayData.windMax))} mph`:fmtSpeedBoth(f.dayData.windSpeed),w:"20%"},
          {l:"Precipitation", s:f.breakdown.precipScore,v:`${f.dayData.precipProb}% prob`,w:"15%"},
          {l:"Thermal Index", s:f.breakdown.thermalIdx, v:`CAPE ${Math.round(f.dayData.cape)} J/kg`,w:"15%"},
          {l:"Cloud Base",    s:f.breakdown.cloudScore, v:`${f.dayData.cloudBase}m / ${Math.round(f.dayData.cloudBase*3.281)}ft AGL`,w:"10%"},
          {l:"Gust Factor",   s:f.breakdown.gustScore,  v:fmtSpeedBoth(f.dayData.gustSpeed),w:"10%"},
          {l:"Visibility",    s:f.breakdown.visScore,   v:`${(f.dayData.visibility/1000).toFixed(1)}km`,w:"5%"},
        ].map(it=>(
          <div key={it.l} style={{marginBottom:7}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <span style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:600,color:"#9ab8d8"}}>{it.l}</span>
                <span style={{fontFamily:"JetBrains Mono",fontSize:14,color:"#2a3d5a"}}>×{it.w}</span>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontFamily:"JetBrains Mono",fontSize:15,color:"#6a9abf"}}>{it.v}</span>
                <span style={{fontFamily:"JetBrains Mono",fontSize:13,fontWeight:700,color:sCol(it.s),minWidth:24,textAlign:"right"}}>{Math.round(it.s)}</span>
              </div>
            </div>
            <div style={{background:"#1a2d4a",borderRadius:2,height:3}}><div style={{width:`${Math.round(it.s)}%`,height:"100%",background:sCol(it.s),borderRadius:2,transition:"width 0.6s ease"}}/></div>
          </div>
        ))}
      </div>
      <WindCompass site={site} windDir={f.dayData.windDir} windSpeed={f.dayData.windSpeed} gustSpeed={f.dayData.gustSpeed} inWindow={f.inWindow}/>
      <div style={{marginBottom:12}}>
        <button onClick={()=>setShowH(!showH)} style={{background:"none",border:"1px solid #1a2d4a",borderRadius:4,color:"#6a9abf",fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,letterSpacing:1,padding:"6px 12px",cursor:"pointer",width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>HOURLY WIND GRAPH</span><span>{showH?"▲":"▼"}</span>
        </button>
        {showH&&<HourlyGraph data={f.dayData} site={site} siteMin={site.wind_range_min} siteMax={site.wind_range_max}/>}
      </div>
      {/* ── RASP/SKYLIGHT STYLE SOARING INDEX ── */}
      <SoaringIndex dayData={f.dayData} site={site}/>
      {/* ── MULTI-MODEL COMPARISON ── */}
      <ModelComparison dayData={f.dayData}/>
    </div>:<div style={{padding:32,textAlign:"center",color:"#4a6a8a",fontFamily:"Barlow Condensed",fontSize:15}}>Loading weather data...</div>}
  </div>);
}

// ── SOARING INDEX (RASP/Skylight style) ─────────────────────────────────────
// Shows BL height trend, W* thermal strength, trigger time, lifted index
// Mirrors what pilots look for on RASP BLIPMAPs and Skylight
function SoaringIndex({ dayData, site }) {
  const { wStarMs, thermalTrigger, liftedIdx, cin, blHeight, cloudBase, hourlyBL, hourlyCloudBase, cape, sunrise, sunset, overcastKillsDay, cloudCover } = dayData;
  const siteAlt = site.altitude_m;

  // RASP star rating (1-5) based on W* and BL height above site
  const blAboveSite = Math.max(0, blHeight - siteAlt);
  const raspStars = wStarMs < 0.5 ? 0 : wStarMs < 1.2 ? 1 : wStarMs < 2.0 ? 2 : wStarMs < 2.8 ? 3 : wStarMs < 3.5 ? 4 : 5;
  const starCol = raspStars <= 1 ? '#4a6a8a' : raspStars <= 2 ? '#ffd700' : raspStars <= 3 ? '#00e5ff' : '#00ff9d';

  // Thermal quality label (like Skylight's rating)
  const thermalLabel = wStarMs < 0.5 ? 'None' : wStarMs < 1.0 ? 'Weak' : wStarMs < 2.0 ? 'Moderate' : wStarMs < 3.0 ? 'Good' : 'Strong';
  const thermalCol = wStarMs < 0.5 ? '#3a5a7a' : wStarMs < 1.0 ? '#4a6a8a' : wStarMs < 2.0 ? '#ffd700' : wStarMs < 3.0 ? '#00e5ff' : '#00ff9d';

  // LI colour: negative = unstable = good
  const liCol = liftedIdx < -4 ? '#ff8c00' : liftedIdx < -2 ? '#00e5ff' : liftedIdx < 0 ? '#ffd700' : '#4a6a8a';
  const liLabel = liftedIdx < -4 ? 'Very unstable' : liftedIdx < -2 ? 'Unstable' : liftedIdx < 0 ? 'Slightly unstable' : 'Stable';

  // BL height sparkline (hourly through the day)
  const blVals = hourlyBL || [];
  const blPeak = Math.max(...blVals.filter(Boolean), 500);
  const W = 340, H = 55, pl = 36, pr = 8, ptop = 6, pb = 16;
  const gw = W - pl - pr, gh = H - ptop - pb;
  const blY = v => ptop + gh - ((v||0) / blPeak) * gh;
  const blPath = blVals.map((v,i) => `${i===0?'M':'L'} ${pl + i*(gw/24)} ${blY(v||0)}`).join(' ');
  // Site altitude line
  const siteY = blY(siteAlt);

  return (
    <div style={{ background:'#080c14', border:'1px solid #1a2d4a', borderRadius:8, padding:'10px 12px', marginBottom:12 }}>
      <div style={{ fontFamily:'Barlow Condensed', fontSize:14, color:'#4a6a8a', letterSpacing:1, marginBottom:8 }}>SOARING INDEX (RASP / SKYLIGHT)</div>

      {/* RASP star rating + W* */}
      <div style={{ display:'flex', gap:12, marginBottom:10, flexWrap:'wrap' }}>
        <div style={{ flex:1, background:'#0d1520', borderRadius:6, padding:'7px 10px', border:`1px solid ${starCol}33` }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:14, color:'#4a6a8a', marginBottom:3 }}>RASP RATING</div>
          <div style={{ display:'flex', gap:2, alignItems:'center' }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} style={{ fontSize:15, opacity: n <= raspStars ? 1 : 0.15 }}>★</span>
            ))}
            <span style={{ fontFamily:'JetBrains Mono', fontSize:15, color:starCol, marginLeft:4 }}>{raspStars}/5</span>
          </div>
        </div>
        <div style={{ flex:1, background:'#0d1520', borderRadius:6, padding:'7px 10px', border:`1px solid ${thermalCol}33` }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:14, color:'#4a6a8a', marginBottom:3 }}>W* THERMAL STRENGTH</div>
          <div style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:17, color:thermalCol }}>{wStarMs.toFixed(1)} m/s</div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:14, color:'#4a6a8a' }}>{thermalLabel}</div>
        </div>
        <div style={{ flex:1, background:'#0d1520', borderRadius:6, padding:'7px 10px', border:'1px solid #1a2d4a' }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:14, color:'#4a6a8a', marginBottom:3 }}>TRIGGER TIME</div>
          <div style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:17, color: thermalTrigger ? '#ffd700' : '#3a5a7a' }}>
            {thermalTrigger ? `${String(thermalTrigger).padStart(2,'0')}:00` : 'None'}
          </div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#4a6a8a' }}>
            🌅 {Math.floor(sunrise||6)}:{String(Math.round(((sunrise||6)%1)*60)).padStart(2,'0')} — 🌇 {Math.floor(sunset||20)}:{String(Math.round(((sunset||20)%1)*60)).padStart(2,'0')}
          </div>
        </div>
      </div>

      {/* BL Height sparkline */}
      <div style={{ marginBottom:8 }}>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:14, color:'#4a6a8a', marginBottom:3 }}>BOUNDARY LAYER HEIGHT (RASP BL TOP)</div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ display:'block', width:'100%', height:H }}>
          {/* Site altitude fill zone */}
          <rect x={pl} y={siteY} width={gw} height={H - pb - siteY + ptop} fill="#ffd70006" />
          <line x1={pl} y1={siteY} x2={pl+gw} y2={siteY} stroke="#ffd70044" strokeWidth={1} strokeDasharray="4,3"/>
          <text x={pl-3} y={siteY+3} textAnchor="end" fill="#ffd70077" fontSize={6} fontFamily="JetBrains Mono">{siteAlt}m/{Math.round(siteAlt*3.281)}ft</text>
          {/* BL curve */}
          <path d={blPath} fill="none" stroke="#00e5ff" strokeWidth={1.5}/>
          <path d={blPath + ` L ${pl+gw} ${H-pb} L ${pl} ${H-pb} Z`} fill="#00e5ff08"/>
          {/* Cloud base line (ASL = cloudBase AGL + site altitude) */}
          {cloudBase > 0 && (() => {
            const cbASL = cloudBase + siteAlt;
            const cbLineY = blY(cbASL);
            return (<>
              <line x1={pl} y1={cbLineY} x2={pl+gw} y2={cbLineY} stroke="#9ab8d866" strokeWidth={1.5} strokeDasharray="3,3"/>
              <text x={pl-3} y={cbLineY+3} textAnchor="end" fill="#9ab8d888" fontSize={6} fontFamily="JetBrains Mono">{cloudBase}m AGL</text>
            </>);
          })()}
          {/* Peak BL label */}
          <text x={pl+gw-2} y={ptop+8} textAnchor="end" fill="#00e5ff88" fontSize={6} fontFamily="JetBrains Mono">peak {Math.round(blPeak)}m / {Math.round(blPeak*3.281)}ft</text>
          {/* Hour labels */}
          {[6,10,14,18].map(h => (
            <text key={h} x={pl+h*(gw/24)} y={H-2} textAnchor="middle" fill="#3a5a7a" fontSize={6} fontFamily="JetBrains Mono">{String(h).padStart(2,'0')}h</text>
          ))}
        </svg>
        {overcastKillsDay && (
          <div style={{ background:'#3a1a0a', border:'1px solid #ff3b3b44', borderRadius:5, padding:'5px 8px', marginTop:4, display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontSize:14 }}>☁️</span>
            <div>
              <div style={{ fontFamily:'Barlow Condensed', fontSize:15, fontWeight:700, color:'#ff3b3b' }}>OVERCAST WARNING</div>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#ff8c00' }}>Heavy cloud cover ({cloudCover}%) will limit or kill thermal development</div>
            </div>
          </div>
        )}
        <div style={{ display:'flex', gap:10, marginTop:2, flexWrap:'wrap' }}>
          {[['#00e5ff','BL height'],['#ffd70044','Site altitude'],['#9ab8d844','Cloud base']].map(([col,lbl]) => (
            <div key={lbl} style={{ display:'flex', alignItems:'center', gap:3 }}>
              <div style={{ width:12, height:2, background:col, borderRadius:1 }}/>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:14, color:'#4a6a8a' }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CLOUD BASE GRAPH ── */}
      {hourlyCloudBase && hourlyCloudBase.some(v=>v!=null) && (() => {
        const cbVals = hourlyCloudBase || [];
        const cbMax  = Math.max(...cbVals.filter(Boolean), 3000);
        const WC=340, HC=60, plC=40, prC=8, ptC=6, pbC=16;
        const gwC=WC-plC-prC, ghC=HC-ptC-pbC;
        const cbY = v => ptC + ghC - ((v||0)/cbMax)*ghC;
        // Fill area path
        const cbPath = cbVals.map((v,i)=>`${i===0?'M':'L'} ${plC+i*(gwC/24)} ${cbY(v||0)}`).join(' ');
        // Good cb threshold (>600m = good for XC)
        const goodY  = cbY(600);
        const siteAltY = cbY(siteAlt);
        // Find min/max cb during 09-17
        const dayCBVals = cbVals.slice(9,17).filter(Boolean);
        const minCB = dayCBVals.length ? Math.min(...dayCBVals) : null;
        const maxCB = dayCBVals.length ? Math.max(...dayCBVals) : null;
        const cbColor = minCB == null ? '#9ab8d8' : minCB < 300 ? '#ff3b3b' : minCB < 600 ? '#ff8c00' : minCB < 1200 ? '#ffd700' : '#00e5ff';
        // Y-axis labels
        const yLabels = [500,1000,1500,2000].filter(v=>v<cbMax*0.95);
        return (
          <div style={{ marginBottom:10, background:'#080c14', border:`1px solid ${cbColor}33`, borderRadius:6, padding:'8px 10px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:14, color:'#4a6a8a' }}>CLOUD BASE HEIGHT (AGL)</span>
              {minCB&&<span style={{ fontFamily:'JetBrains Mono', fontSize:13, color:cbColor }}>{minCB}–{maxCB}m · {Math.round(minCB*3.281)}–{Math.round((maxCB||0)*3.281)}ft</span>}
            </div>
            <svg viewBox={`0 0 ${WC} ${HC}`} style={{ display:'block', width:'100%', height:HC }}>
              {/* Y-axis labels */}
              {yLabels.map(v=>(
                <g key={v}>
                  <line x1={plC} y1={cbY(v)} x2={plC+gwC} y2={cbY(v)} stroke="#1a2d4a" strokeWidth={0.5}/>
                  <text x={plC-3} y={cbY(v)+3} textAnchor="end" fill="#2a4a6a" fontSize={6} fontFamily="JetBrains Mono">{v}m</text>
                </g>
              ))}
              {/* Site altitude line */}
              {siteAlt < cbMax * 0.9 && (
                <>
                  <line x1={plC} y1={siteAltY} x2={plC+gwC} y2={siteAltY} stroke="#ffd70033" strokeWidth={1} strokeDasharray="3,3"/>
                  <text x={plC-3} y={siteAltY-2} textAnchor="end" fill="#ffd70066" fontSize={5} fontFamily="JetBrains Mono">site</text>
                </>
              )}
              {/* 600m good-XC threshold line */}
              {600 < cbMax * 0.9 && (
                <>
                  <line x1={plC} y1={goodY} x2={plC+gwC} y2={goodY} stroke="#00e5ff22" strokeWidth={1} strokeDasharray="2,4"/>
                  <text x={plC+gwC+2} y={goodY+3} textAnchor="start" fill="#00e5ff44" fontSize={5} fontFamily="JetBrains Mono">600m</text>
                </>
              )}
              {/* Cloud base fill */}
              <path d={cbPath + ` L ${plC+gwC} ${HC-pbC} L ${plC} ${HC-pbC} Z`} fill={`${cbColor}12`}/>
              {/* Cloud base line */}
              <path d={cbPath} fill="none" stroke={cbColor} strokeWidth={2}/>
              {/* Hour dots at key times */}
              {[8,10,12,14,16].map(h=>{
                const v=cbVals[h]; if(!v) return null;
                return <circle key={h} cx={plC+h*(gwC/24)} cy={cbY(v)} r={2} fill={cbColor}/>;
              })}
              {/* Hour labels */}
              {[6,9,12,15,18].map(h=>(
                <text key={h} x={plC+h*(gwC/24)} y={HC-2} textAnchor="middle" fill="#3a5a7a" fontSize={6} fontFamily="JetBrains Mono">{String(h).padStart(2,'0')}h</text>
              ))}
            </svg>
            {/* Quick interpretation */}
            <div style={{ display:'flex', gap:8, marginTop:4, flexWrap:'wrap' }}>
              {[
                {col:'#ff3b3b', lbl:'<300m Too low'},
                {col:'#ff8c00', lbl:'300-600m Low'},
                {col:'#ffd700', lbl:'600-1200m Fair'},
                {col:'#00e5ff', lbl:'>1200m Good XC'},
              ].map(({col,lbl})=>(
                <div key={lbl} style={{ display:'flex', alignItems:'center', gap:3 }}>
                  <div style={{ width:10, height:3, background:col, borderRadius:1 }}/>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#4a6a8a' }}>{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Lifted Index + CAPE + CIN row */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {[
          { lbl:'LIFTED INDEX', val: isNaN(liftedIdx) ? '—' : liftedIdx.toFixed(1), col: liCol, sub: liLabel, tip:'< 0 = unstable/thermal' },
          { lbl:'CAPE', val:`${Math.round(cape)} J/kg`, col: cape>500?'#00e5ff':cape>100?'#ffd700':'#4a6a8a', sub: cape>500?'Good thermals':cape>100?'Some thermals':'Weak thermals', tip:'Convective energy' },
          { lbl:'CIN', val:`${Math.round(Math.abs(cin||0))} J/kg`, col: Math.abs(cin||0)<50?'#00e5ff':'#ff8c00', sub: Math.abs(cin||0)<50?'Low cap':'Capping present', tip:'Convective inhibition' },
          { lbl:'BL AGL', val:`${Math.round(blAboveSite)}m / ${Math.round(blAboveSite*3.281)}ft`, col: blAboveSite>1000?'#00e5ff':blAboveSite>500?'#ffd700':'#4a6a8a', sub: blAboveSite>1500?'Excellent ceiling':blAboveSite>800?'Good ceiling':blAboveSite>400?'Moderate':'Low ceiling', tip:'BL height above site' },
        ].map(({lbl,val,col,sub,tip}) => (
          <div key={lbl} title={tip} style={{ flex:'1 1 60px', background:'#0d1520', borderRadius:5, padding:'5px 7px', border:`1px solid ${col}22` }}>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:14, color:'#3a5a7a', marginBottom:1 }}>{lbl}</div>
            <div style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:16, color:col, lineHeight:1.1 }}>{val}</div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:14, color:'#4a6a8a' }}>{sub}</div>
          </div>
        ))}
      </div>
      {/* ── DETAILED CLOUD BASE PANEL ── */}
      {cloudBase > 0 && (() => {
        const cbASL = cloudBase + siteAlt; // cloud base above sea level
        const cbFt  = Math.round(cloudBase * 3.281); // AGL feet
        const cbASLFt = Math.round(cbASL * 3.281); // ASL feet
        const blAGL = Math.max(0, blHeight - siteAlt);
        const blFt  = Math.round(blAGL * 3.281);
        const blASLFt = Math.round(blHeight * 3.281);
        // Cu-nimb risk: cloud base below BL height → thermals hitting base → possible over-development
        const cuNimbRisk = blAGL > cloudBase * 0.85;
        const cbCol = cloudBase < 300 ? '#ff3b3b' : cloudBase < 600 ? '#ff8c00' : cloudBase < 1200 ? '#ffd700' : '#00e5ff';
        return (
          <div style={{ background:'#080c14', border:`1px solid ${cbCol}44`, borderRadius:6, padding:'8px 10px', marginTop:8 }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:14, color:'#4a6a8a', letterSpacing:1, marginBottom:5 }}>CLOUD BASE DETAIL</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
              <div style={{ flex:'1 1 80px', background:'#0d1520', borderRadius:4, padding:'5px 7px' }}>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#4a6a8a' }}>AGL</div>
                <div style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:18, color:cbCol }}>{cloudBase}m</div>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:13, color:cbCol }}>{cbFt}ft</div>
              </div>
              <div style={{ flex:'1 1 80px', background:'#0d1520', borderRadius:4, padding:'5px 7px' }}>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#4a6a8a' }}>ASL</div>
                <div style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:18, color:'#9ab8d8' }}>{cbASL}m</div>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:13, color:'#9ab8d8' }}>{cbASLFt}ft</div>
              </div>
              <div style={{ flex:'1 1 80px', background:'#0d1520', borderRadius:4, padding:'5px 7px' }}>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#4a6a8a' }}>BL AGL</div>
                <div style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:18, color: blFt > cbFt ? '#ff8c00' : '#00e5ff' }}>{blAGL}m</div>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:13, color: blFt > cbFt ? '#ff8c00' : '#00e5ff' }}>{blFt}ft</div>
              </div>
            </div>
            {cuNimbRisk && (
              <div style={{ background:'#2a1000', border:'1px solid #ff8c0044', borderRadius:4, padding:'5px 8px', display:'flex', gap:6, alignItems:'center' }}>
                <span>⚡</span>
                <div>
                  <div style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:15, color:'#ff8c00' }}>Cu-Nimb Risk</div>
                  <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#ff8c00' }}>BL height exceeds cloud base — thermals may overdevelop</div>
                </div>
              </div>
            )}
            {!cuNimbRisk && cloudBase >= 1200 && (
              <div style={{ fontFamily:'JetBrains Mono', fontSize:13, color:'#00e5ff' }}>✓ High cloud base — excellent XC conditions</div>
            )}
            {cloudBase < 600 && !cuNimbRisk && (
              <div style={{ fontFamily:'JetBrains Mono', fontSize:13, color:'#ff8c00' }}>⚠ Low cloud base — restricted altitude ceiling</div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ── MODEL COMPARISON (ECMWF vs GFS) ─────────────────────────────────────────
// Like cross-checking Windy models — shows where ECMWF & GFS agree/disagree
function ModelComparison({ dayData }) {
  const { windSpeed, windDir, gustSpeed, precipProb, blHeight, cape,
          ukmoDay, iconDay, gfsDay, modelAgreement, windMin, windMax,
          windShear, shearDir, overcastRisk, cloudCover } = dayData;
  const agCol = modelAgreement == null ? '#4a6a8a' : modelAgreement >= 75 ? '#00e5ff' : modelAgreement >= 50 ? '#ffd700' : '#ff8c00';
  const fmt = v => v != null ? fmtSpeedBoth(v) : '—';
  const fmtDir = v => v != null ? `${Math.round(v)}° ${cDir(v)}` : '—';
  const fmtPct = v => v != null ? `${Math.round(v)}%` : '—';
  const fmtBL  = v => v != null && v > 0 ? `${Math.round(v)}m/${Math.round(v*3.281)}ft` : '—';

  // Model colours
  const MC = { ECMWF:'#00e5ff', UKMO:'#00ff9d', ICON:'#ffd700', GFS:'#9ab8d8' };

  const models = [
    { name:'ECMWF', col:MC.ECMWF, ws:windSpeed, wd:windDir, gs:gustSpeed, rn:precipProb, bl:blHeight, cp:cape },
    { name:'UKMO',  col:MC.UKMO,  ws:ukmoDay?.windSpeed, wd:ukmoDay?.windDir, gs:ukmoDay?.gustSpeed, rn:ukmoDay?.precipProb, bl:ukmoDay?.blHeight, cp:ukmoDay?.cape },
    { name:'ICON',  col:MC.ICON,  ws:iconDay?.windSpeed, wd:iconDay?.windDir, gs:iconDay?.gustSpeed, rn:iconDay?.precipProb, bl:iconDay?.blHeight, cp:iconDay?.cape },
    { name:'GFS',   col:MC.GFS,   ws:gfsDay?.windSpeed,  wd:gfsDay?.windDir,  gs:gfsDay?.gustSpeed,  rn:gfsDay?.precipProb,  bl:gfsDay?.blHeight,  cp:gfsDay?.cape },
  ];

  const diffCol = (d, unit) => {
    if (d == null) return '#3a5a7a';
    const t = { 'km/h':[5,15], '°':[15,45], '%':[10,25], 'm':[100,300] };
    const [lo,hi] = t[unit]||[5,15];
    return d<=lo?'#00e5ff':d<=hi?'#ffd700':'#ff8c00';
  };

  // Wind speed range across all models
  const hasRange = windMin != null && windMax != null && (windMax - windMin) > 1;

  // Overcast colour
  const ovCol = overcastRisk==='HIGH'?'#ff3b3b':overcastRisk==='MODERATE'?'#ff8c00':overcastRisk==='LOW'?'#ffd700':'#00e5ff';

  return (
    <div style={{ background:'#080c14', border:'1px solid #1a2d4a', borderRadius:8, padding:'12px', marginBottom:12 }}>
      {/* Header row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ fontFamily:'Barlow Condensed', fontSize:16, color:'#4a6a8a', letterSpacing:1, fontWeight:700 }}>MODEL COMPARISON</div>
        {modelAgreement != null && (
          <div style={{ display:'flex', alignItems:'center', gap:6, background:`${agCol}14`, border:`1px solid ${agCol}44`, borderRadius:5, padding:'3px 8px' }}>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:13, color:'#4a6a8a' }}>AGREE</span>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:18, fontWeight:700, color:agCol }}>{modelAgreement}%</span>
          </div>
        )}
      </div>

      {/* Model badges row */}
      <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
        {models.map(m => (
          <div key={m.name} style={{ display:'flex', flexDirection:'column', flex:'1 1 60px', background:'#0d1520', borderRadius:5, padding:'5px 8px', border:`1px solid ${m.col}33` }}>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:12, color:m.col, fontWeight:700 }}>{m.name}</span>
            <span style={{ fontFamily:'Barlow Condensed', fontSize:15, color: m.ws!=null?'#c8d8f0':'#3a5a7a', fontWeight:700 }}>
              {m.ws!=null ? `${kmhToMph(Math.round(m.ws))} mph` : '—'}
            </span>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:12, color: m.wd!=null?'#9ab8d8':'#3a5a7a' }}>
              {m.wd!=null ? cDir(m.wd) : '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Wind speed range bar */}
      {hasRange && (
        <div style={{ marginBottom:10 }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:13, color:'#4a6a8a', marginBottom:4 }}>
            WIND RANGE (model spread): {kmhToMph(Math.round(windMin))}–{kmhToMph(Math.round(windMax))} mph
          </div>
          <div style={{ background:'#1a2d4a', borderRadius:3, height:8, position:'relative' }}>
            <div style={{
              position:'absolute',
              left:`${(windMin/50)*100}%`,
              width:`${Math.max(4,((windMax-windMin)/50)*100)}%`,
              height:'100%', background:'linear-gradient(90deg,#00e5ff88,#ffd70088)',
              borderRadius:3
            }}/>
          </div>
        </div>
      )}

      {/* Detail table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, fontFamily:'JetBrains Mono' }}>
          <thead>
            <tr>
              {['',...models.map(m=>m.name)].map((h,i) => (
                <th key={i} style={{ padding:'3px 6px', textAlign:i===0?'left':'center', color: i===0?'#4a6a8a':models[i-1]?.col, fontSize:12, fontWeight:700, borderBottom:'1px solid #1a2d4a' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { lbl:'Gusts', vals: models.map(m => m.gs!=null ? `${kmhToMph(Math.round(m.gs))} mph` : '—') },
              { lbl:'Rain',  vals: models.map(m => fmtPct(m.rn)) },
              { lbl:'BL',    vals: models.map(m => fmtBL(m.bl)) },
              { lbl:'CAPE',  vals: models.map(m => m.cp!=null&&m.cp>0 ? `${Math.round(m.cp)}` : '—') },
            ].map(row => (
              <tr key={row.lbl}>
                <td style={{ padding:'4px 6px', color:'#6a8aaa', fontFamily:'Barlow Condensed', fontSize:14, fontWeight:600, borderBottom:'1px solid #0f1e30' }}>{row.lbl}</td>
                {row.vals.map((v,i) => (
                  <td key={i} style={{ padding:'4px 6px', textAlign:'center', color:v==='—'?'#2a4a6a':'#9ab8d8', borderBottom:'1px solid #0f1e30' }}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Wind shear + overcast warnings */}
      <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
        {windShear != null && (
          <div style={{ flex:1, background:'#0d1520', borderRadius:5, padding:'5px 8px', border:`1px solid ${Math.abs(windShear)>10?'#ff8c0044':'#1a2d4a'}` }}>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#4a6a8a' }}>WIND SHEAR</div>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:16, fontWeight:700, color:Math.abs(windShear)>15?'#ff3b3b':Math.abs(windShear)>8?'#ff8c00':'#00e5ff' }}>
              +{kmhToMph(Math.round(Math.abs(windShear)))} mph at 100m
            </div>
            {shearDir != null && shearDir > 20 && (
              <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#ff8c00' }}>Direction shift {Math.round(shearDir)}° with height</div>
            )}
          </div>
        )}
        <div style={{ flex:1, background:'#0d1520', borderRadius:5, padding:'5px 8px', border:`1px solid ${ovCol}44` }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#4a6a8a' }}>OVERCAST RISK</div>
          <div style={{ fontFamily:'Barlow Condensed', fontSize:16, fontWeight:700, color:ovCol }}>{overcastRisk||'—'}</div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#4a6a8a' }}>{cloudCover != null ? `${cloudCover}% cloud cover` : ''}</div>
        </div>
      </div>

      <div style={{ fontFamily:'JetBrains Mono', fontSize:13, color:'#2a4a6a', marginTop:6, textAlign:'right' }}>
        ECMWF · UKMO UKV 2km · DWD ICON-EU · GFS — all via Open-Meteo
      </div>
    </div>
  );
}

// ── WIND COMPASS ─────────────────────────────────────────────────────────────
// Shows the site's exact flyable wind window shaded in green, current wind
// arrow, and a clear IN/OUT status — like ParaglidingMap.com
function WindCompass({ site, windDir, windSpeed, gustSpeed, inWindow }) {
  const sz = 220, cx = sz / 2, cy = sz / 2, r = 78;
  const toRad = deg => ((deg - 90) * Math.PI) / 180;
  const pt = (deg, radius) => ({
    x: cx + radius * Math.cos(toRad(deg)),
    y: cy + radius * Math.sin(toRad(deg))
  });

  // Build arc path for wind window sector
  const sectorPath = (startDeg, endDeg, radius) => {
    // Normalise to handle wrap-around (e.g. 340→055 goes through 0)
    const steps = 60;
    let span = endDeg >= startDeg ? endDeg - startDeg : (360 - startDeg) + endDeg;
    const points = Array.from({ length: steps + 1 }, (_, i) => {
      const deg = (startDeg + (span * i) / steps) % 360;
      return pt(deg, radius);
    });
    return `M ${cx} ${cy} L ${points[0].x} ${points[0].y} ` +
      points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
  };

  // Wind window
  const win = parseWindWindow(site.windNote);
  const winLo = win ? win.lo : ((site.aspect - 60 + 360) % 360);
  const winHi = win ? win.hi : ((site.aspect + 60) % 360);

  // Wind arrow
  const arrowTip = pt(windDir, r * 0.72);
  const arrowBase = pt(windDir, r * 0.15);
  // Arrow head
  const headL = pt(windDir - 150, r * 0.18);
  const headR = pt(windDir + 150, r * 0.18);

  const arrowCol = inWindow ? '#00e596' : '#ff3b3b';

  // Card-style label
  const statusLabel = inWindow ? '✓ ON WINDOW' : '✗ OFF WINDOW';
  const statusCol = inWindow ? '#00e596' : '#ff3b3b';

  return (
    <div style={{ background: '#080c14', border: '1px solid #1a2d4a', borderRadius: 8, padding: '10px 6px 6px', marginBottom: 12 }}>
      <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: '#4a6a8a', letterSpacing: 1, textAlign: 'center', marginBottom: 4 }}>WIND COMPASS</div>
      <svg viewBox={`0 0 ${sz} ${sz}`} style={{ display:'block', margin:'0 auto', width:'100%', maxWidth:sz, height:'auto' }}>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r + 14} fill="#040810" stroke="#1a2d4a" strokeWidth={1} />
        {/* Grid rings */}
        {[0.4, 0.7, 1].map(f => (
          <circle key={f} cx={cx} cy={cy} r={r * f} fill="none" stroke="#1a2d4a" strokeWidth={0.5} strokeDasharray="3,3" />
        ))}
        {/* Cardinal lines */}
        {[0, 90].map(a => {
          const p1 = pt(a, r + 10), p2 = pt(a + 180, r + 10);
          return <line key={a} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#1a2d4a" strokeWidth={0.5} />;
        })}

        {/* ── FLYABLE WINDOW SECTOR (the key feature) ── */}
        <path d={sectorPath(winLo, winHi, r)} fill="#00e59618" stroke="none" />
        {/* Window arc border */}
        {(() => {
          let span = winHi >= winLo ? winHi - winLo : (360 - winLo) + winHi;
          const steps = 60;
          const pts = Array.from({ length: steps + 1 }, (_, i) => {
            const deg = (winLo + (span * i) / steps) % 360;
            return pt(deg, r);
          });
          const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
          return <path d={d} fill="none" stroke="#00e596" strokeWidth={1.5} strokeDasharray="4,2" opacity={0.7} />;
        })()}
        {/* Window edge tick marks */}
        {[winLo, winHi].map(deg => {
          const inner = pt(deg, r * 0.85), outer = pt(deg, r * 1.05);
          return <line key={deg} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#00e596" strokeWidth={1.5} />;
        })}
        {/* Window label */}
        {(() => {
          let span = winHi >= winLo ? winHi - winLo : (360 - winLo) + winHi;
          const midDeg = (winLo + span / 2) % 360;
          const lp = pt(midDeg, r * 0.52);
          return <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fill="#00e596" fontSize={7} fontFamily="JetBrains Mono" opacity={0.8}>FLY</text>;
        })()}

        {/* Cardinal labels */}
        {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((d, i) => {
          const p = pt(i * 45, r + 22);
          return <text key={d} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill={d === 'N' ? '#6a9abf' : '#3a5a7a'} fontSize={d === 'N' ? 8 : 7} fontFamily="JetBrains Mono" fontWeight={d === 'N' ? 700 : 400}>{d}</text>;
        })}

        {/* ── WIND DIRECTION ARROW ── */}
        {/* Arrow shaft */}
        <line x1={arrowBase.x} y1={arrowBase.y} x2={arrowTip.x} y2={arrowTip.y}
          stroke={arrowCol} strokeWidth={2.5} strokeLinecap="round" />
        {/* Arrow head */}
        <polygon points={`${arrowTip.x},${arrowTip.y} ${headL.x},${headL.y} ${headR.x},${headR.y}`}
          fill={arrowCol} />
        {/* Centre dot */}
        <circle cx={cx} cy={cy} r={4} fill={arrowCol} opacity={0.4} stroke={arrowCol} strokeWidth={1} />

        {/* Wind speed in centre */}
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#9ab8d8" fontSize={10} fontFamily="JetBrains Mono" fontWeight={700}>{kmhToMph(Math.round(windSpeed))}</text>
        <text x={cx} y={cy + 7} textAnchor="middle" fill="#4a6a8a" fontSize={6} fontFamily="JetBrains Mono">mph</text>
      </svg>

      {/* Status row below compass */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 0', flexWrap: 'wrap', gap: 4 }}>
        <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 13, color: statusCol, letterSpacing: 1 }}>{statusLabel}</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: '#9ab8d8' }}>{Math.round(windDir)}° {cDir(windDir)}</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: '#4a6a8a' }}>window: {win ? `${String(winLo).padStart(3, '0')}–${String(winHi).padStart(3, '0')}°` : `${cDir(site.aspect)}±60°`}</span>
        </div>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: '#4a6a8a', textAlign: 'center', marginTop: 2 }}>
        gusts {kmhToMph(Math.round(gustSpeed))} mph ({Math.round(gustSpeed)} km/h) · {Math.round(gustSpeed / Math.max(windSpeed, 1) * 100 - 100)}% over mean
      </div>
    </div>
  );
}

// ── HOURLY WIND GRAPH ─────────────────────────────────────────────────────────
// Shows speed/gusts AND per-hour direction bars coloured green/orange/red
function HourlyGraph({ data, site, siteMin, siteMax }) {
  const hrs = data.hourlyWindSpeed || [];
  const gst = data.hourlyGusts || [];
  const dirs = data.hourlyWindDir || [];
  if (!hrs.length) return <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#4a6a8a', padding: 8 }}>No hourly data</div>;

  const mx = Math.max(...gst.filter(Boolean), siteMax * 1.2, 10);
  const W = 340, H = 110, pl = 32, pr = 8, pt = 8, pb = 24, gw = W - pl - pr, gh = H - pt - pb;
  const ty = v => pt + gh - (v / mx) * gh;
  const sp = hrs.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pl + i * (gw / 24)} ${ty(v || 0)}`).join(' ');
  const gp = gst.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pl + i * (gw / 24)} ${ty(v || 0)}`).join(' ');

  // Win window for per-hour direction colouring
  const win = parseWindWindow(site.windNote);

  const hourCol = (i) => {
    const d = dirs[i];
    if (d == null) return '#1a2d4a';
    const inWin = win ? windInWindow(d, win.lo, win.hi) : (angleDiff(d, site.aspect) <= 60);
    if (inWin) return '#00e59644';
    const distLo = win ? angleDiff(d, win.lo) : null;
    const distHi = win ? angleDiff(d, win.hi) : null;
    const near = win ? Math.min(distLo, distHi) <= 20 : (angleDiff(d, site.aspect) <= 90);
    return near ? '#ff8c0044' : '#ff3b3b33';
  };

  return (
    <div style={{ marginTop: 8, background: '#080c14', borderRadius: 6, padding: '8px 4px 4px', border: '1px solid #1a2d4a' }}>
      {/* Per-hour direction colour strip */}
      <div style={{ display: 'flex', marginLeft: pl, marginRight: pr, marginBottom: 3, height: 10, borderRadius: 2, overflow: 'hidden' }}>
        {hrs.map((_, i) => (
          <div key={i} style={{ flex: 1, background: hourCol(i), borderRight: '1px solid #040810' }} title={dirs[i] != null ? `${Math.round(dirs[i])}° ${cDir(dirs[i])}` : ''} />
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:H }}>
        {/* Flyable speed band */}
        <rect x={pl} y={ty(siteMax)} width={gw} height={ty(siteMin) - ty(siteMax)} fill="#00e5ff08" />
        <line x1={pl} y1={ty(siteMin)} x2={pl + gw} y2={ty(siteMin)} stroke="#00e5ff33" strokeWidth={1} strokeDasharray="3,2" />
        <line x1={pl} y1={ty(siteMax)} x2={pl + gw} y2={ty(siteMax)} stroke="#ff3b3b33" strokeWidth={1} strokeDasharray="3,2" />
        {[0, mx * .5, mx].map(v => (
          <g key={v}>
            <line x1={pl} y1={ty(v)} x2={pl + gw} y2={ty(v)} stroke="#1a2d4a" strokeWidth={0.5} />
            <text x={pl - 3} y={ty(v) + 3} textAnchor="end" fill="#4a6a8a" fontSize={7} fontFamily="JetBrains Mono">{kmhToMph(Math.round(v))}</text>
          </g>
        ))}
        <text x={pl-3} y={pt+3} textAnchor="end" fill="#3a5a7a" fontSize={5} fontFamily="JetBrains Mono">mph</text>
        {[0, 6, 12, 18, 23].map(h => (
          <text key={h} x={pl + h * (gw / 24)} y={pt + gh + 12} textAnchor="middle" fill="#4a6a8a" fontSize={7} fontFamily="JetBrains Mono">{String(h).padStart(2, '0')}h</text>
        ))}
        <path d={gp} fill="none" stroke="#ff3b3b66" strokeWidth={1} strokeDasharray="3,2" />
        <path d={sp} fill="none" stroke="#00e5ff" strokeWidth={1.5} />
        <text x={pl + 2} y={ty(siteMin) - 3} fill="#00e5ff55" fontSize={7} fontFamily="JetBrains Mono">MIN {kmhToMph(siteMin)} mph</text>
        <text x={pl + 2} y={ty(siteMax) + 8} fill="#ff3b3b55" fontSize={7} fontFamily="JetBrains Mono">MAX {kmhToMph(siteMax)} mph</text>
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 2, flexWrap: 'wrap' }}>
        {[['#00e5ff', 'Wind speed'], ['#ff3b3b66', 'Gusts'], ['#00e59644', 'Dir on window'], ['#ff3b3b33', 'Dir off window']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 12, height: l.includes('Dir') ? 8 : 2, background: c, borderRadius: l.includes('Dir') ? 2 : 0 }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 6, color: '#4a6a8a' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Legacy WindRose kept as alias (unused, replaced by WindCompass)
function WindRose({ windDir, siteAspect, windSpeed, gustSpeed }) {
  return null; // replaced by WindCompass
}

function LoadOvl({total,loaded}){
  const pct=Math.round((loaded/total)*100);
  return(<div style={{position:"absolute",inset:0,background:"#080c14cc",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,zIndex:1000}}>
    <div style={{fontSize:36,animation:"spin 2s linear infinite"}}>🪂</div>
    <div style={{fontFamily:"JetBrains Mono",fontSize:14,color:"#00e5ff",letterSpacing:2}}>FETCHING WEATHER DATA</div>
    <div style={{background:"#1a2d4a",borderRadius:2,height:4,width:200}}><div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#00e5ff66,#00e5ff)",borderRadius:2,transition:"width 0.3s"}}/></div>
    <div style={{fontFamily:"Barlow Condensed",fontSize:15,color:"#4a6a8a"}}>{loaded}/{total} sites · {pct}%</div>
  </div>);
}
function LoadCards(){return <div style={{display:"grid",gap:8}}>{[1,2,3,4,5].map(i=><div key={i} style={{background:"#0d1520",border:"1px solid #1a2d4a",borderRadius:8,padding:14,height:70,opacity:.3+i*.1}}><div style={{background:"#1a2d4a",borderRadius:3,height:12,width:"40%",marginBottom:8}}/><div style={{background:"#1a2d4a",borderRadius:3,height:8,width:"60%"}}/></div>)}</div>;}
function Pill({label,value,score}){const c=sCol(score);return(<div style={{background:"#080c14",border:`1px solid ${c}33`,borderRadius:4,padding:"3px 8px"}}><div style={{fontFamily:"JetBrains Mono",fontSize:14,color:"#4a6a8a"}}>{label}</div><div style={{fontFamily:"JetBrains Mono",fontSize:16,color:c,fontWeight:700}}>{value}</div></div>);}
function sCol(s){return s>=78?"#00e5ff":s>=58?"#ffd700":s>=38?"#ff8c00":"#ff3b3b";}
function cDir(deg){const d=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];return d[Math.round(((deg%360)+360)%360/22.5)%16];}
