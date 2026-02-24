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

// Primary: ECMWF via Open-Meteo (best European model)
async function fetchOpenMeteo(lat, lon) {
  const base = `latitude=${lat}&longitude=${lon}`;
  const hourly = `hourly=temperature_2m,dewpoint_2m,precipitation_probability,windspeed_10m,winddirection_10m,windgusts_10m,cape,visibility,boundary_layer_height,convective_inhibition,lifted_index`;
  const daily = `daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant`;
  const opts = `wind_speed_unit=kmh&forecast_days=3&timezone=Europe%2FLondon`;
  const url = `https://api.open-meteo.com/v1/forecast?${base}&${hourly}&${daily}&${opts}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

// Comparison: GFS model — different NWP for cross-checking
async function fetchOpenMeteoGFS(lat, lon) {
  const base = `latitude=${lat}&longitude=${lon}`;
  const hourly = `hourly=windspeed_10m,winddirection_10m,windgusts_10m,precipitation_probability,boundary_layer_height,cape`;
  const daily = `daily=windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,precipitation_probability_max`;
  const opts = `wind_speed_unit=kmh&forecast_days=3&timezone=Europe%2FLondon&models=gfs_seamless`;
  const url = `https://api.open-meteo.com/v1/forecast?${base}&${hourly}&${daily}&${opts}`;
  try { const res = await fetch(url); if (!res.ok) return null; return res.json(); }
  catch { return null; }
}

function processWeatherData(raw, rawGfs) {
  return [0,1,2].map(i => {
    const d = raw.daily;
    const sl  = arr => (arr||[]).slice(i*24, i*24+24);
    const slP = arr => sl(arr).slice(6,18);
    const avg = arr => arr.length ? arr.reduce((a,b)=>a+(b||0),0)/arr.length : 0;
    const tempMax = d.temperature_2m_max[i]??15;
    const dewpoint = avg(slP(raw.hourly.dewpoint_2m)) || ((d.temperature_2m_min[i]??8)-2);
    const hourlyBL = sl(raw.hourly.boundary_layer_height);
    const avgBL    = avg(slP(raw.hourly.boundary_layer_height));
    const avgCAPE  = avg(slP(raw.hourly.cape));
    // W* (convective velocity) estimate in m/s — RASP-style thermal strength
    const wStarMs = Math.min(4.5, Math.sqrt(Math.max(0, avgCAPE / 300)) * Math.max(0.3, avgBL / 1200));
    // Thermal trigger: first hour BL > 300m (thermals becoming useful)
    const thermalTrigger = (() => { for (let h=6;h<18;h++) if ((hourlyBL[h]||0)>300) return h; return null; })();
    // Lifted Index (negative = good thermals)
    const liftedIdx = avg(slP(raw.hourly.lifted_index ?? []));
    // CIN: convective inhibition — how much capping (low = easier thermals)
    const cin = avg(slP(raw.hourly.convective_inhibition ?? []));
    // GFS comparison
    let gfsData = null;
    if (rawGfs && rawGfs.daily) {
      const gd = rawGfs.daily;
      gfsData = {
        windSpeed: gd.windspeed_10m_max?.[i]??null,
        gustSpeed: gd.windgusts_10m_max?.[i]??null,
        windDir:   gd.winddirection_10m_dominant?.[i]??null,
        precipProb:gd.precipitation_probability_max?.[i]??null,
        blHeight:  avg((rawGfs.hourly.boundary_layer_height||[]).slice(i*24+6,i*24+18)),
        cape:      avg((rawGfs.hourly.cape||[]).slice(i*24+6,i*24+18)),
      };
    }
    // Model agreement 0-100 (how closely ECMWF & GFS agree)
    const modelAgreement = (() => {
      if (!gfsData||gfsData.windSpeed==null) return null;
      const spd = d.windspeed_10m_max[i]??20;
      const spdDiff = Math.abs(spd - gfsData.windSpeed);
      const dirDiff = angleDiff(d.winddirection_10m_dominant[i]??270, gfsData.windDir??270);
      const rnDiff  = Math.abs((d.precipitation_probability_max[i]??20)-(gfsData.precipProb??20));
      return Math.max(0, Math.round(100 - spdDiff*3 - dirDiff*0.5 - rnDiff));
    })();
    return {
      windDir:   d.winddirection_10m_dominant[i]??270,
      windSpeed: d.windspeed_10m_max[i]??20,
      gustSpeed: d.windgusts_10m_max[i]??28,
      precipProb:d.precipitation_probability_max[i]??20,
      tempMax, cape: avgCAPE,
      blHeight:  avgBL,
      visibility:avg(slP(raw.hourly.visibility))||8000,
      cloudBase: Math.round(Math.max(0,(tempMax-dewpoint)*400)),
      hourlyWindSpeed: sl(raw.hourly.windspeed_10m),
      hourlyGusts:     sl(raw.hourly.windgusts_10m),
      hourlyWindDir:   sl(raw.hourly.winddirection_10m),
      hourlyBL,
      wStarMs,
      thermalTrigger,
      liftedIdx,
      cin,
      gfsData,
      modelAgreement,
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
  if(score<38) return {label:"No XC",km:0,color:"#ff3b3b",detail:"Site unflyable"};
  const {cape,blHeight,windSpeed,precipProb} = day;
  const tv  = cape>0?Math.sqrt(2*cape/1000)*3.5:0;
  const ts  = Math.min(5,tv);
  const mo  = new Date().getMonth();
  const dl  = 8+Math.sin((mo-2)*Math.PI/6)*4;
  const sw  = Math.max(0,Math.min(dl-4,blHeight/400));
  const km  = Math.round(((sw*(ts>0.5?4:2)*(blHeight*.7/1000)*8)+(windSpeed*sw*.3))*(precipProb>20?.6:1));
  const det = `${ts.toFixed(1)}m/s thermals · ${sw.toFixed(1)}hr window`;
  if(km>=100) return {label:"100km+ Epic day 🏆",km,color:"#00e5ff",detail:det};
  if(km>=50)  return {label:`${km}km XC potential`,km,color:"#00e5ff",detail:det};
  if(km>=20)  return {label:`${km}km XC possible`,km,color:"#ffd700",detail:det};
  return {label:"Local soaring only",km,color:"#ff8c00",detail:"Weak thermals"};
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
  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const markers = useRef([]);

  const days = useMemo(()=>{
    const t=new Date();
    return [0,1,2].map(i=>{const d=new Date(t);d.setDate(d.getDate()+i);return{date:d,label:i===0?"Today":i===1?"Tomorrow":d.toLocaleDateString("en-GB",{weekday:"long"})};});
  },[]);

  const load = useCallback(async()=>{
    setLoading(true);
    const r={};
    for(let i=0;i<UK_SITES.length;i+=10){
      await Promise.all(UK_SITES.slice(i,i+10).map(async s=>{
        try{const [ec,gfs]=await Promise.all([fetchOpenMeteo(s.lat,s.lon),fetchOpenMeteoGFS(s.lat,s.lon)]);r[s.id]=processWeatherData(ec,gfs);}catch{r[s.id]=null;}
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
    [0,1,2].map(i=>{const sc=UK_SITES.map(s=>flyData[s.id]?.[i]?.score??0);return Math.round(sc.reduce((a,b)=>a+b,0)/sc.length);}),
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

  useEffect(()=>{
    if(tab!=="map") return;
    const init=()=>{
      if(!window.L||!mapRef.current||mapInst.current) return;
      mapInst.current=window.L.map(mapRef.current,{zoomControl:false}).setView([52.5,-2.8],6);
      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{attribution:"&copy; CARTO",maxZoom:19}).addTo(mapInst.current);
      window.L.control.zoom({position:"bottomright"}).addTo(mapInst.current);
      setMapReady(true);
    };
    if(!window.L){
      const lnk=document.createElement("link");lnk.rel="stylesheet";lnk.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(lnk);
      const scr=document.createElement("script");scr.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";scr.onload=init;document.head.appendChild(scr);
    } else init();
  },[tab]);

  useEffect(()=>{
    if(!mapInst.current||!mapReady) return;
    markers.current.forEach(m=>m.remove());markers.current=[];
    UK_SITES.forEach(s=>{
      const f=flyData[s.id]?.[day];
      const c=f?f.color:"#555";
      const icon=window.L.divIcon({className:"",html:`<div style="width:34px;height:34px;border-radius:50%;background:${c}18;border:2px solid ${c};display:flex;align-items:center;justify-content:center;font-family:JetBrains Mono,monospace;font-size:10px;font-weight:700;color:${c};cursor:pointer;box-shadow:0 0 10px ${c}55">${f?f.score:"?"}</div>`,iconSize:[34,34],iconAnchor:[17,17]});
      markers.current.push(window.L.marker([s.lat,s.lon],{icon}).addTo(mapInst.current).on("click",()=>setSelSite(s)));
    });
  },[mapReady,flyData,day]);

  const C = (score)=>score>=78?"#00e5ff":score>=58?"#ffd700":score>=38?"#ff8c00":"#ff3b3b";

  return(<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Barlow+Condensed:wght@300;400;600;700;900&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html,body{height:100%;background:#080c14;color:#c8d8f0;font-family:'Barlow Condensed',sans-serif}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0d1520}::-webkit-scrollbar-thumb{background:#1e3050;border-radius:2px}
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
            <span style={{fontSize:22}}>🪂</span>
            <div>
              <div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:18,letterSpacing:2,color:"#00e5ff",textTransform:"uppercase"}}>UK FLYCAST</div>
              <div style={{fontFamily:"JetBrains Mono",fontSize:8,color:"#4a6a8a",letterSpacing:1}}>PG & HG · {UK_SITES.length} SITES · SSC ✓</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {updated&&<div style={{fontFamily:"JetBrains Mono",fontSize:8,color:"#4a6a8a",textAlign:"right"}}><div>UPDATED</div><div style={{color:"#6a9abf"}}>{updated.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div></div>}
            <button onClick={load} disabled={loading} style={{background:loading?"#1a2d4a":"#00e5ff14",border:`1px solid ${loading?"#1a2d4a":"#00e5ff44"}`,color:loading?"#4a6a8a":"#00e5ff",padding:"5px 10px",borderRadius:4,fontFamily:"Barlow Condensed",fontWeight:700,fontSize:11,letterSpacing:1,cursor:loading?"default":"pointer",display:"flex",alignItems:"center",gap:4}}>
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
            return(<button key={i} onClick={()=>setDay(i)} style={{flex:"0 0 auto",background:act?`${col}14`:"#0d1520",border:`1px solid ${act?col:"#1a2d4a"}`,borderRadius:6,padding:"7px 14px",cursor:"pointer",textAlign:"left",minWidth:90,transition:"all 0.2s"}}>
              <div style={{fontFamily:"Barlow Condensed",fontWeight:700,fontSize:12,color:act?col:"#6a9abf",letterSpacing:1,textTransform:"uppercase"}}>{d.label}</div>
              <div style={{fontFamily:"JetBrains Mono",fontSize:8,color:"#4a6a8a",marginTop:1}}>{d.date.toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</div>
              <div style={{marginTop:5,display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:`${col}18`,border:`1.5px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"JetBrains Mono",fontSize:10,fontWeight:700,color:col}}>{loading?"—":sc}</div>
                <div style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:600,color:col}}>{loading?"...":lbl}</div>
              </div>
            </button>);
          })}
          <div style={{flex:1,background:"#0d1520",border:"1px solid #1a2d4a",borderRadius:6,padding:"7px 10px",display:"flex",flexDirection:"column",justifyContent:"center",minWidth:100}}>
            <div style={{fontFamily:"Barlow Condensed",fontSize:9,color:"#4a6a8a",letterSpacing:1,marginBottom:4}}>DATA SOURCES</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {[["Open-Meteo",true],["Met Office",false],["OWM",false]].map(([s,a])=>(
                <span key={s} style={{fontFamily:"JetBrains Mono",fontSize:7,color:a?"#00e5ff":"#3a4d5a",background:a?"#00e5ff11":"#1a2d4a",border:`1px solid ${a?"#00e5ff33":"#2a3d5a"}`,borderRadius:3,padding:"1px 4px"}}>{s}{a?" ✓":" —"}</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav style={{background:"#0a1220",borderBottom:"1px solid #1a2d4a",display:"flex",flexShrink:0}}>
        {[{id:"map",i:"◉",l:"MAP"},{id:"best",i:"★",l:"BEST"},{id:"sites",i:"≡",l:"SITES"},{id:"forecast",i:"◈",l:"FORECAST"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px 0",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?"#00e5ff":"transparent"}`,color:tab===t.id?"#00e5ff":"#4a6a8a",fontFamily:"Barlow Condensed",fontWeight:700,fontSize:11,letterSpacing:1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            {t.i} {t.l}
          </button>
        ))}
      </nav>

      {/* MAIN */}
      <div style={{flex:1,overflow:"hidden",position:"relative",display:"flex"}}>

        {/* MAP */}
        {tab==="map"&&<div style={{flex:1,position:"relative"}}><div ref={mapRef} style={{width:"100%",height:"100%"}} />{loading&&<LoadOvl total={UK_SITES.length} loaded={Object.keys(wx).length}/>}</div>}

        {/* BEST */}
        {tab==="best"&&<div style={{flex:1,overflow:"auto",padding:12}} className="fi">
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:20,color:"#ffd700",letterSpacing:2}}>★ BEST SITES — {days[day].label.toUpperCase()}</div>
            <div style={{fontFamily:"JetBrains Mono",fontSize:9,color:"#4a6a8a",marginTop:2}}>{best.length} sites flyable · ranked by score · PG & HG</div>
          </div>
          {loading?<LoadCards/>:best.length===0?<div style={{textAlign:"center",padding:40,color:"#4a6a8a",fontFamily:"Barlow Condensed",fontSize:16}}>No sites forecast flyable — check another day!</div>:(
            <div style={{display:"grid",gap:8}}>{best.map(({site,fly},r)=><BestCard key={site.id} site={site} fly={fly} rank={r+1} onClick={()=>setSelSite(site)}/>)}</div>
          )}
        </div>}

        {/* SITES */}
        {tab==="sites"&&<div style={{flex:1,overflow:"auto",padding:12}} className="fi">
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
            <select value={region} onChange={e=>setRegion(e.target.value)}>{regions.map(r=><option key={r} value={r}>{r}</option>)}</select>
            <select value={sport} onChange={e=>setSport(e.target.value)}><option value="All">PG + HG</option><option value="PG">PG Only</option><option value="HG">HG Only</option></select>
            <select value={sort} onChange={e=>setSort(e.target.value)}><option value="score">Sort: Flyability</option><option value="xc">Sort: XC Potential</option><option value="name">Sort: Name</option></select>
            <span style={{fontFamily:"JetBrains Mono",fontSize:9,color:"#4a6a8a"}}>{filtered.length} sites</span>
          </div>
          <div style={{display:"grid",gap:6}}>
            {filtered.map(s=>{
              const f=flyData[s.id]?.[day]; const col=f?f.color:"#4a6a8a";
              return(<button key={s.id} onClick={()=>setSelSite(s)} style={{background:"#0d1520",border:`1px solid ${selSite?.id===s.id?col:"#1a2d4a"}`,borderRadius:6,padding:"9px 12px",cursor:"pointer",textAlign:"left",width:"100%",transition:"border-color 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontFamily:"Barlow Condensed",fontWeight:700,fontSize:15,color:"#c8d8f0"}}>{s.name}</span><SportBadge sport={s.sport}/></div>
                    <div style={{fontFamily:"JetBrains Mono",fontSize:8,color:"#4a6a8a"}}>{s.region} · {s.altitude_m}m · {s.pg_rating}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {f&&<div style={{fontFamily:"JetBrains Mono",fontSize:8,color:f.xc.color,textAlign:"right",maxWidth:75}}>{f.xc.label}</div>}
                    <div style={{width:42,height:42,borderRadius:"50%",background:f?`${col}14`:"#1a2d4a",border:`2px solid ${col}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                      <div style={{fontFamily:"JetBrains Mono",fontSize:13,fontWeight:700,color:col,lineHeight:1}}>{loading?"—":(f?.score??"?")}</div>
                      <div style={{fontFamily:"JetBrains Mono",fontSize:7,color:col}}>{f?f.label.slice(0,4).toUpperCase():"..."}</div>
                    </div>
                  </div>
                </div>
                {f&&<div style={{marginTop:6,display:"flex",gap:3,flexWrap:"wrap"}}>
                  <WindDirPill fly={f}/>
                  <Pill label="WIND" value={`${kmhToMph(Math.round(f.dayData.windSpeed))} mph`} score={f.breakdown.speedScore}/>
                  <Pill label="RAIN" value={`${f.dayData.precipProb}%`}           score={f.breakdown.precipScore}/>
                  <Pill label="BASE" value={`${f.dayData.cloudBase}m`}            score={f.breakdown.cloudScore}/>
                  <Pill label="CAPE" value={`${Math.round(f.dayData.cape)}`}      score={f.breakdown.thermalIdx}/>
                </div>}
              </button>);
            })}
          </div>
        </div>}

        {/* FORECAST */}
        {tab==="forecast"&&<div style={{flex:1,overflow:"auto",padding:12}} className="fi">
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:20,color:"#00e5ff",letterSpacing:2}}>3-DAY UK FORECAST</div>
            <div style={{fontFamily:"JetBrains Mono",fontSize:9,color:"#4a6a8a",marginTop:2}}>{UK_SITES.length} sites · PG & HG</div>
          </div>
          <div style={{display:"grid",gap:10}}>
            {days.map((d,i)=>{
              const sc=ukScore[i]; const col=C(sc);
              const top=UK_SITES.map(s=>({site:s,fly:flyData[s.id]?.[i]})).filter(x=>x.fly&&x.fly.score>=58).sort((a,b)=>b.fly.score-a.fly.score).slice(0,6);
              const maxXC=Math.max(...UK_SITES.map(s=>flyData[s.id]?.[i]?.xc?.km??0));
              return(<div key={i} style={{background:"#0d1520",border:`1px solid ${i===day?col:"#1a2d4a"}`,borderRadius:8,padding:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:20,color:col,letterSpacing:1}}>{d.label.toUpperCase()}</div>
                    <div style={{fontFamily:"JetBrains Mono",fontSize:9,color:"#4a6a8a"}}>{d.date.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>
                    {maxXC>0&&<div style={{fontFamily:"Barlow Condensed",fontSize:13,color:"#00e5ff",marginTop:2}}>✈ Max XC: {maxXC}km</div>}
                  </div>
                  <div style={{textAlign:"right"}}><div style={{fontFamily:"JetBrains Mono",fontSize:26,fontWeight:700,color:col,lineHeight:1}}>{loading?"—":sc}</div><div style={{fontFamily:"Barlow Condensed",fontSize:11,color:col}}>UK AVG</div></div>
                </div>
                <div style={{background:"#1a2d4a",borderRadius:2,height:3,marginBottom:8}}><div style={{width:`${sc}%`,height:"100%",background:`linear-gradient(90deg,${col}66,${col})`,borderRadius:2}}/></div>
                {top.length>0?<div style={{display:"grid",gap:3}}>{top.map(({site,fly})=>(
                  <div key={site.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#080c14",borderRadius:4,padding:"5px 8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontFamily:"Barlow Condensed",fontWeight:700,fontSize:13,color:"#c8d8f0"}}>{site.name}</span><SportBadge sport={site.sport} tiny/><span style={{fontFamily:"JetBrains Mono",fontSize:8,color:"#4a6a8a"}}>{site.region}</span></div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:"JetBrains Mono",fontSize:8,color:fly.xc.color}}>{fly.xc.label}</span><span style={{fontFamily:"JetBrains Mono",fontSize:12,fontWeight:700,color:fly.color}}>{fly.score}</span></div>
                  </div>
                ))}</div>:<div style={{fontFamily:"Barlow Condensed",fontSize:13,color:"#4a6a8a",textAlign:"center",padding:"6px 0"}}>No sites forecast flyable</div>}
              </div>);
            })}
          </div>
        </div>}

        {/* SIDE PANEL */}
        {selSite&&<SitePanel site={selSite} flyData={flyData[selSite.id]} activeDay={day} days={days} onClose={()=>setSelSite(null)} onDayChange={setDay}/>}
      </div>

      {/* FOOTER */}
      <footer style={{background:"#080c14",borderTop:"1px solid #1a2d4a",padding:"5px 12px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:4}}>
          <div style={{fontFamily:"JetBrains Mono",fontSize:8,color:"#2a3d5a"}}>⚠ For planning only — always check NOTAMs, site guides & current conditions before flying</div>
          <div style={{display:"flex",gap:8}}>
            {[["Windy","https://windy.com"],["XCSkies","https://xcskies.com"],["Flybubble","https://flybubble.com/weather"],["BHPA","https://bhpa.co.uk"]].map(([l,h])=>(
              <a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{fontFamily:"JetBrains Mono",fontSize:8,color:"#4a6a8a",textDecoration:"none",borderBottom:"1px solid #1a2d4a"}}>{l}</a>
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
      <span style={{ fontFamily:"JetBrains Mono", fontSize:9, fontWeight:700, color:col, background:`${col}18`, border:`1px solid ${col}44`, borderRadius:3, padding:"1px 5px" }}>{icon} {label}</span>
      <span style={{ fontFamily:"JetBrains Mono", fontSize:8, color:"#6a9abf" }}>{Math.round(windDir)}° ({cDir(windDir)})</span>
      <span style={{ fontFamily:"JetBrains Mono", fontSize:7, color:"#4a6a8a" }}>window: {windWindow}</span>
      {flyableHours && <span style={{ fontFamily:"JetBrains Mono", fontSize:7, color: flyableHours.goodHours >= 4 ? "#00e5ff" : flyableHours.goodHours >= 2 ? "#ffd700" : "#ff8c00" }}>{flyableHours.goodHours}/{flyableHours.totalHours}h on window</span>}
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
    <div style={{ background: '#080c14', border: `1px solid ${col}44`, borderRadius: 3, padding: '2px 5px', display: 'flex', alignItems: 'center', gap: 3 }}>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 6, color: '#4a6a8a' }}>DIR</div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: col, fontWeight: 700 }}>{icon} {cDir(dayData.windDir)}</div>
    </div>
  );
}
function SportBadge({sport,tiny}){
  const s={fontFamily:"JetBrains Mono",fontSize:tiny?6:7,borderRadius:3,padding:tiny?"1px 2px":"1px 4px"};
  if(sport==="PGHG") return <div style={{display:"flex",gap:2}}><span style={{...s,color:"#00e5ff",background:"#00e5ff11",border:"1px solid #00e5ff33"}}>PG</span><span style={{...s,color:"#ffd700",background:"#ffd70011",border:"1px solid #ffd70033"}}>HG</span></div>;
  if(sport==="HG")   return <span style={{...s,color:"#ffd700",background:"#ffd70011",border:"1px solid #ffd70033"}}>HG</span>;
  return <span style={{...s,color:"#00e5ff",background:"#00e5ff11",border:"1px solid #00e5ff33"}}>PG</span>;
}

function ClubBadge({club}){if(!club) return null;return <span style={{fontFamily:"JetBrains Mono",fontSize:7,color:"#a78bfa",background:"#a78bfa11",border:"1px solid #a78bfa33",borderRadius:3,padding:"1px 4px",whiteSpace:"nowrap"}}>SSC</span>;}

function BestCard({site,fly,rank,onClick}){
  const col=fly.color;
  return(<button onClick={onClick} className="fi" style={{background:"#0d1520",border:`1px solid ${rank<=3?col:"#1a2d4a"}`,borderRadius:8,padding:"10px 14px",cursor:"pointer",textAlign:"left",width:"100%",animationDelay:`${rank*.04}s`,opacity:0}}>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:900,color:rank<=3?col:"#4a6a8a",minWidth:22,textAlign:"center"}}>{rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":rank}</div>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:17,color:"#e0eeff"}}>{site.name}</span>
          <SportBadge sport={site.sport}/><ClubBadge club={site.club}/>
          <span style={{fontFamily:"JetBrains Mono",fontSize:8,color:"#4a6a8a"}}>{site.region}</span>
        </div>
        <div style={{display:"flex",gap:6,marginTop:2,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontFamily:"Barlow Condensed",fontSize:13,color:col,fontWeight:700}}>{fly.label}</span>
          <span style={{fontFamily:"JetBrains Mono",fontSize:9,color:fly.xc.color}}>✈ {fly.xc.label}</span>
        </div>
        <div style={{marginTop:5,display:"flex",gap:3,flexWrap:"wrap"}}>
          <WindDirPill fly={fly}/>
          <Pill label="WIND" value={`${kmhToMph(Math.round(fly.dayData.windSpeed))} mph`} score={fly.breakdown.speedScore}/>
          <Pill label="RAIN" value={`${fly.dayData.precipProb}%`}           score={fly.breakdown.precipScore}/>
          <Pill label="BASE" value={`${fly.dayData.cloudBase}m`}            score={fly.breakdown.cloudScore}/>
        </div>
      </div>
      <div style={{width:50,height:50,borderRadius:"50%",background:`${col}14`,border:`2.5px solid ${col}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:`0 0 16px ${col}44`,flexShrink:0}}>
        <div style={{fontFamily:"JetBrains Mono",fontSize:16,fontWeight:700,color:col,lineHeight:1}}>{fly.score}</div>
        <div style={{fontFamily:"JetBrains Mono",fontSize:7,color:col}}>/ 100</div>
      </div>
    </div>
  </button>);
}

function SitePanel({site,flyData,activeDay,days,onClose,onDayChange}){
  const [showH,setShowH]=useState(false);
  const f=flyData?.[activeDay]; const col=f?f.color:"#4a6a8a";
  return(<div className="fi" style={{width:300,maxWidth:"100%",background:"#0a1220",borderLeft:"1px solid #1a2d4a",overflow:"auto",flexShrink:0}}>
    <div style={{padding:"10px 14px",borderBottom:"1px solid #1a2d4a",background:"#080c14",position:"sticky",top:0,zIndex:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:17,color:"#e0eeff"}}>{site.name}</div><SportBadge sport={site.sport}/><ClubBadge club={site.club}/></div>
          <div style={{fontFamily:"JetBrains Mono",fontSize:8,color:"#4a6a8a",marginTop:1}}>{site.region} · {site.altitude_m}m ASL</div>
        </div>
        <button onClick={onClose} style={{background:"#1a2d4a",border:"none",color:"#6a9abf",width:26,height:26,borderRadius:4,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
      <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
        {[{l:site.site_type.toUpperCase(),c:"#6a9abf"},{l:site.pg_rating.toUpperCase(),c:"#ffd700"},{l:site.windNote??`ASPECT ${cDir(site.aspect)}`,c:"#00e5ff"},{l:`${kmhToMph(site.wind_range_min)}–${kmhToMph(site.wind_range_max)} mph`,c:"#00e5ff"}].map(b=>(
          <span key={b.l} style={{fontFamily:"JetBrains Mono",fontSize:7,color:b.c,background:`${b.c}11`,border:`1px solid ${b.c}33`,borderRadius:3,padding:"1px 5px"}}>{b.l}</span>
        ))}
      </div>
    </div>
    <div style={{display:"flex",borderBottom:"1px solid #1a2d4a"}}>
      {days.map((d,i)=>{const fd=flyData?.[i];const c=fd?fd.color:"#4a6a8a";return(
        <button key={i} onClick={()=>onDayChange(i)} style={{flex:1,padding:"6px 4px",background:"none",border:"none",borderBottom:`2px solid ${i===activeDay?c:"transparent"}`,cursor:"pointer",textAlign:"center"}}>
          <div style={{fontFamily:"Barlow Condensed",fontSize:10,fontWeight:700,color:i===activeDay?c:"#4a6a8a"}}>{d.label.slice(0,3).toUpperCase()}</div>
          <div style={{fontFamily:"JetBrains Mono",fontSize:9,color:c,marginTop:1}}>{fd?fd.score:"—"}</div>
        </button>
      );})}
    </div>
    {f?<div style={{padding:14}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        <div style={{width:58,height:58,borderRadius:"50%",background:`${col}14`,border:`3px solid ${col}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:`0 0 20px ${col}44`,flexShrink:0}}>
          <div style={{fontFamily:"JetBrains Mono",fontSize:20,fontWeight:700,color:col,lineHeight:1}}>{f.score}</div>
          <div style={{fontFamily:"JetBrains Mono",fontSize:7,color:col}}>/ 100</div>
        </div>
        <div>
          <div style={{fontFamily:"Barlow Condensed",fontWeight:900,fontSize:20,color:col,letterSpacing:1}}>{f.label.toUpperCase()}</div>
          <div style={{fontFamily:"Barlow Condensed",fontSize:13,color:f.xc.color,marginTop:1}}>✈ {f.xc.label}</div>
          {f.xc.detail&&<div style={{fontFamily:"JetBrains Mono",fontSize:8,color:"#4a6a8a",marginTop:2}}>{f.xc.detail}</div>}
        </div>
      </div>
      {/* Dynamic confidence badge based on model agreement */}
      {(() => {
        const ag = f.dayData.modelAgreement;
        const col = ag==null?"#ffd700":ag>=75?"#00e5ff":ag>=50?"#ffd700":"#ff8c00";
        const lbl = ag==null?"SINGLE MODEL":ag>=75?"HIGH CONFIDENCE":ag>=50?"MODERATE CONFIDENCE":"MODELS DISAGREE";
        const sub = ag==null?"ECMWF only · GFS unavailable":`ECMWF vs GFS agreement: ${ag}%`;
        return (
          <div style={{background:"#080c14",border:`1px solid ${col}33`,borderRadius:6,padding:"6px 10px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:col,boxShadow:`0 0 6px ${col}88`,flexShrink:0}}/>
            <div>
              <div style={{fontFamily:"Barlow Condensed",fontSize:12,color:col,fontWeight:700}}>{lbl}</div>
              <div style={{fontFamily:"JetBrains Mono",fontSize:7,color:"#4a6a8a"}}>{sub}</div>
            </div>
            {ag!=null&&<div style={{marginLeft:"auto",fontFamily:"JetBrains Mono",fontSize:14,fontWeight:700,color:col}}>{ag}%</div>}
          </div>
        );
      })()}
      <div style={{marginBottom:12}}>
        <div style={{fontFamily:"Barlow Condensed",fontSize:11,color:"#4a6a8a",letterSpacing:1,marginBottom:6}}>FLYABILITY BREAKDOWN</div>
        {[
          {l:"Wind Direction",s:f.breakdown.dirScore,  v:<WindDirStatus fly={f} dayData={f.dayData}/>,w:"30%"},
          {l:"Wind Speed",    s:f.breakdown.speedScore, v:fmtSpeedBoth(f.dayData.windSpeed),w:"20%"},
          {l:"Precipitation", s:f.breakdown.precipScore,v:`${f.dayData.precipProb}% prob`,w:"15%"},
          {l:"Thermal Index", s:f.breakdown.thermalIdx, v:`CAPE ${Math.round(f.dayData.cape)} J/kg`,w:"15%"},
          {l:"Cloud Base",    s:f.breakdown.cloudScore, v:`${f.dayData.cloudBase}m AGL`,w:"10%"},
          {l:"Gust Factor",   s:f.breakdown.gustScore,  v:fmtSpeedBoth(f.dayData.gustSpeed),w:"10%"},
          {l:"Visibility",    s:f.breakdown.visScore,   v:`${(f.dayData.visibility/1000).toFixed(1)}km`,w:"5%"},
        ].map(it=>(
          <div key={it.l} style={{marginBottom:7}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <span style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:600,color:"#9ab8d8"}}>{it.l}</span>
                <span style={{fontFamily:"JetBrains Mono",fontSize:7,color:"#2a3d5a"}}>×{it.w}</span>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontFamily:"JetBrains Mono",fontSize:8,color:"#6a9abf"}}>{it.v}</span>
                <span style={{fontFamily:"JetBrains Mono",fontSize:10,fontWeight:700,color:sCol(it.s),minWidth:24,textAlign:"right"}}>{Math.round(it.s)}</span>
              </div>
            </div>
            <div style={{background:"#1a2d4a",borderRadius:2,height:3}}><div style={{width:`${Math.round(it.s)}%`,height:"100%",background:sCol(it.s),borderRadius:2,transition:"width 0.6s ease"}}/></div>
          </div>
        ))}
      </div>
      <WindCompass site={site} windDir={f.dayData.windDir} windSpeed={f.dayData.windSpeed} gustSpeed={f.dayData.gustSpeed} inWindow={f.inWindow}/>
      <div style={{marginBottom:12}}>
        <button onClick={()=>setShowH(!showH)} style={{background:"none",border:"1px solid #1a2d4a",borderRadius:4,color:"#6a9abf",fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,letterSpacing:1,padding:"4px 10px",cursor:"pointer",width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>HOURLY WIND GRAPH</span><span>{showH?"▲":"▼"}</span>
        </button>
        {showH&&<HourlyGraph data={f.dayData} site={site} siteMin={site.wind_range_min} siteMax={site.wind_range_max}/>}
      </div>
      {/* ── RASP/SKYLIGHT STYLE SOARING INDEX ── */}
      <SoaringIndex dayData={f.dayData} site={site}/>
      {/* ── MULTI-MODEL COMPARISON ── */}
      <ModelComparison dayData={f.dayData}/>
    </div>:<div style={{padding:32,textAlign:"center",color:"#4a6a8a",fontFamily:"Barlow Condensed",fontSize:13}}>Loading weather data...</div>}
  </div>);
}

// ── SOARING INDEX (RASP/Skylight style) ─────────────────────────────────────
// Shows BL height trend, W* thermal strength, trigger time, lifted index
// Mirrors what pilots look for on RASP BLIPMAPs and Skylight
function SoaringIndex({ dayData, site }) {
  const { wStarMs, thermalTrigger, liftedIdx, cin, blHeight, cloudBase, hourlyBL, cape } = dayData;
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
  const W = 268, H = 50, pl = 32, pr = 8, ptop = 6, pb = 14;
  const gw = W - pl - pr, gh = H - ptop - pb;
  const blY = v => ptop + gh - ((v||0) / blPeak) * gh;
  const blPath = blVals.map((v,i) => `${i===0?'M':'L'} ${pl + i*(gw/24)} ${blY(v||0)}`).join(' ');
  // Site altitude line
  const siteY = blY(siteAlt);

  return (
    <div style={{ background:'#080c14', border:'1px solid #1a2d4a', borderRadius:8, padding:'10px 12px', marginBottom:12 }}>
      <div style={{ fontFamily:'Barlow Condensed', fontSize:11, color:'#4a6a8a', letterSpacing:1, marginBottom:8 }}>SOARING INDEX (RASP / SKYLIGHT)</div>

      {/* RASP star rating + W* */}
      <div style={{ display:'flex', gap:12, marginBottom:10, flexWrap:'wrap' }}>
        <div style={{ flex:1, background:'#0d1520', borderRadius:6, padding:'7px 10px', border:`1px solid ${starCol}33` }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:7, color:'#4a6a8a', marginBottom:3 }}>RASP RATING</div>
          <div style={{ display:'flex', gap:2, alignItems:'center' }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} style={{ fontSize:12, opacity: n <= raspStars ? 1 : 0.15 }}>★</span>
            ))}
            <span style={{ fontFamily:'JetBrains Mono', fontSize:8, color:starCol, marginLeft:4 }}>{raspStars}/5</span>
          </div>
        </div>
        <div style={{ flex:1, background:'#0d1520', borderRadius:6, padding:'7px 10px', border:`1px solid ${thermalCol}33` }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:7, color:'#4a6a8a', marginBottom:3 }}>W* THERMAL STRENGTH</div>
          <div style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:15, color:thermalCol }}>{wStarMs.toFixed(1)} m/s</div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:6, color:'#4a6a8a' }}>{thermalLabel}</div>
        </div>
        <div style={{ flex:1, background:'#0d1520', borderRadius:6, padding:'7px 10px', border:'1px solid #1a2d4a' }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:7, color:'#4a6a8a', marginBottom:3 }}>TRIGGER TIME</div>
          <div style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:15, color: thermalTrigger ? '#ffd700' : '#3a5a7a' }}>
            {thermalTrigger ? `${String(thermalTrigger).padStart(2,'0')}:00` : 'None'}
          </div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:6, color:'#4a6a8a' }}>BL &gt; 300m above gnd</div>
        </div>
      </div>

      {/* BL Height sparkline */}
      <div style={{ marginBottom:8 }}>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:7, color:'#4a6a8a', marginBottom:3 }}>BOUNDARY LAYER HEIGHT (RASP BL TOP)</div>
        <svg width={W} height={H} style={{ display:'block' }}>
          {/* Site altitude fill zone */}
          <rect x={pl} y={siteY} width={gw} height={H - pb - siteY + ptop} fill="#ffd70006" />
          <line x1={pl} y1={siteY} x2={pl+gw} y2={siteY} stroke="#ffd70044" strokeWidth={1} strokeDasharray="4,3"/>
          <text x={pl-3} y={siteY+3} textAnchor="end" fill="#ffd70077" fontSize={6} fontFamily="JetBrains Mono">{siteAlt}m</text>
          {/* BL curve */}
          <path d={blPath} fill="none" stroke="#00e5ff" strokeWidth={1.5}/>
          <path d={blPath + ` L ${pl+gw} ${H-pb} L ${pl} ${H-pb} Z`} fill="#00e5ff08"/>
          {/* Cloud base line */}
          {cloudBase > 0 && (() => {
            const cbY = blY(cloudBase + siteAlt);
            return (<>
              <line x1={pl} y1={cbY} x2={pl+gw} y2={cbY} stroke="#9ab8d844" strokeWidth={1} strokeDasharray="2,4"/>
              <text x={pl-3} y={cbY+3} textAnchor="end" fill="#9ab8d877" fontSize={6} fontFamily="JetBrains Mono">{cloudBase+siteAlt}m</text>
            </>);
          })()}
          {/* Peak BL label */}
          <text x={pl+gw-2} y={ptop+8} textAnchor="end" fill="#00e5ff88" fontSize={6} fontFamily="JetBrains Mono">peak {Math.round(blPeak)}m</text>
          {/* Hour labels */}
          {[6,10,14,18].map(h => (
            <text key={h} x={pl+h*(gw/24)} y={H-2} textAnchor="middle" fill="#3a5a7a" fontSize={6} fontFamily="JetBrains Mono">{String(h).padStart(2,'0')}h</text>
          ))}
        </svg>
        <div style={{ display:'flex', gap:10, marginTop:2, flexWrap:'wrap' }}>
          {[['#00e5ff','BL height'],['#ffd70044','Site altitude'],['#9ab8d844','Cloud base']].map(([col,lbl]) => (
            <div key={lbl} style={{ display:'flex', alignItems:'center', gap:3 }}>
              <div style={{ width:12, height:2, background:col, borderRadius:1 }}/>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:6, color:'#4a6a8a' }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lifted Index + CAPE + CIN row */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {[
          { lbl:'LIFTED INDEX', val: isNaN(liftedIdx) ? '—' : liftedIdx.toFixed(1), col: liCol, sub: liLabel, tip:'< 0 = unstable/thermal' },
          { lbl:'CAPE', val:`${Math.round(cape)} J/kg`, col: cape>500?'#00e5ff':cape>100?'#ffd700':'#4a6a8a', sub: cape>500?'Good thermals':cape>100?'Some thermals':'Weak thermals', tip:'Convective energy' },
          { lbl:'CIN', val:`${Math.round(Math.abs(cin||0))} J/kg`, col: Math.abs(cin||0)<50?'#00e5ff':'#ff8c00', sub: Math.abs(cin||0)<50?'Low cap':'Capping present', tip:'Convective inhibition' },
          { lbl:'BL AGL', val:`${Math.round(blAboveSite)}m`, col: blAboveSite>1000?'#00e5ff':blAboveSite>500?'#ffd700':'#4a6a8a', sub:`${Math.round(blAboveSite*3.281)}ft`, tip:'BL height above site' },
        ].map(({lbl,val,col,sub,tip}) => (
          <div key={lbl} title={tip} style={{ flex:'1 1 60px', background:'#0d1520', borderRadius:5, padding:'5px 7px', border:`1px solid ${col}22` }}>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:6, color:'#3a5a7a', marginBottom:1 }}>{lbl}</div>
            <div style={{ fontFamily:'Barlow Condensed', fontWeight:700, fontSize:14, color:col, lineHeight:1.1 }}>{val}</div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:6, color:'#4a6a8a' }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MODEL COMPARISON (ECMWF vs GFS) ─────────────────────────────────────────
// Like cross-checking Windy models — shows where ECMWF & GFS agree/disagree
function ModelComparison({ dayData }) {
  const { windSpeed, windDir, gustSpeed, precipProb, blHeight, cape, gfsData, modelAgreement } = dayData;
  const gfs = gfsData;
  const agCol = modelAgreement == null ? '#4a6a8a' : modelAgreement >= 75 ? '#00e5ff' : modelAgreement >= 50 ? '#ffd700' : '#ff8c00';

  const rows = [
    { lbl:'Wind Speed',  ecmwf: fmtSpeedBoth(windSpeed), gfs: gfs?.windSpeed!=null ? fmtSpeedBoth(gfs.windSpeed) : '—', diff: gfs?.windSpeed!=null ? Math.abs(windSpeed-gfs.windSpeed) : null, unit:'km/h' },
    { lbl:'Wind Dir',    ecmwf: `${Math.round(windDir)}° ${cDir(windDir)}`, gfs: gfs?.windDir!=null ? `${Math.round(gfs.windDir)}° ${cDir(gfs.windDir)}` : '—', diff: gfs?.windDir!=null ? angleDiff(windDir,gfs.windDir) : null, unit:'°' },
    { lbl:'Gusts',       ecmwf: fmtSpeedBoth(gustSpeed), gfs: gfs?.gustSpeed!=null ? fmtSpeedBoth(gfs.gustSpeed) : '—', diff: gfs?.gustSpeed!=null ? Math.abs(gustSpeed-gfs.gustSpeed) : null, unit:'km/h' },
    { lbl:'Rain Prob',   ecmwf: `${precipProb}%`, gfs: gfs?.precipProb!=null ? `${Math.round(gfs.precipProb)}%` : '—', diff: gfs?.precipProb!=null ? Math.abs(precipProb-gfs.precipProb) : null, unit:'%' },
    { lbl:'BL Height',   ecmwf: `${Math.round(blHeight)}m`, gfs: gfs?.blHeight!=null&&gfs.blHeight>0 ? `${Math.round(gfs.blHeight)}m` : '—', diff: gfs?.blHeight!=null&&gfs.blHeight>0 ? Math.abs(blHeight-gfs.blHeight) : null, unit:'m' },
    { lbl:'CAPE',        ecmwf: `${Math.round(cape)} J/kg`, gfs: gfs?.cape!=null&&gfs.cape>0 ? `${Math.round(gfs.cape)} J/kg` : '—', diff: null, unit:'' },
  ];

  const diffCol = (d, unit) => {
    if (d == null) return '#3a5a7a';
    const thresholds = { 'km/h': [5,15], '°': [15,45], '%': [10,25], 'm': [100,300], '': [0,0] };
    const [lo, hi] = thresholds[unit] || [5,15];
    return d <= lo ? '#00e5ff' : d <= hi ? '#ffd700' : '#ff8c00';
  };

  return (
    <div style={{ background:'#080c14', border:'1px solid #1a2d4a', borderRadius:8, padding:'10px 12px', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ fontFamily:'Barlow Condensed', fontSize:11, color:'#4a6a8a', letterSpacing:1 }}>MODEL COMPARISON</div>
        {modelAgreement != null && (
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:7, color:'#4a6a8a' }}>AGREEMENT</div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:12, fontWeight:700, color:agCol }}>{modelAgreement}%</div>
          </div>
        )}
      </div>
      {/* Header */}
      <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr 40px', gap:4, marginBottom:4 }}>
        {['','ECMWF (primary)','GFS (check)','Δ'].map((h,i) => (
          <div key={i} style={{ fontFamily:'JetBrains Mono', fontSize:6, color:'#2a4a6a', textAlign: i>=2?'right':i===0?'left':'center' }}>{h}</div>
        ))}
      </div>
      {rows.map(({lbl, ecmwf, gfs: gfsVal, diff, unit}) => (
        <div key={lbl} style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr 40px', gap:4, padding:'4px 0', borderTop:'1px solid #0f1e30', alignItems:'center' }}>
          <div style={{ fontFamily:'Barlow Condensed', fontSize:11, fontWeight:600, color:'#6a8aaa' }}>{lbl}</div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'#9ab8d8', textAlign:'center' }}>{ecmwf}</div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:8, color: gfsVal==='—'?'#2a4a6a':'#9ab8d8', textAlign:'center' }}>{gfsVal}</div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:8, fontWeight:700, color:diffCol(diff,unit), textAlign:'right' }}>
            {diff != null ? (unit==='km/h' ? `${kmhToMph(Math.round(diff))}mph` : `${Math.round(diff)}${unit}`) : '—'}
          </div>
        </div>
      ))}
      <div style={{ fontFamily:'JetBrains Mono', fontSize:6, color:'#2a4a6a', marginTop:6, textAlign:'right' }}>
        ECMWF IFS via Open-Meteo · GFS via Open-Meteo
      </div>
    </div>
  );
}

// ── WIND COMPASS ─────────────────────────────────────────────────────────────
// Shows the site's exact flyable wind window shaded in green, current wind
// arrow, and a clear IN/OUT status — like ParaglidingMap.com
function WindCompass({ site, windDir, windSpeed, gustSpeed, inWindow }) {
  const sz = 180, cx = sz / 2, cy = sz / 2, r = 64;
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
      <svg width={sz} height={sz} style={{ display: 'block', margin: '0 auto' }}>
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
  if (!hrs.length) return <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#4a6a8a', padding: 8 }}>No hourly data</div>;

  const mx = Math.max(...gst.filter(Boolean), siteMax * 1.2, 10);
  const W = 268, H = 100, pl = 28, pr = 8, pt = 8, pb = 24, gw = W - pl - pr, gh = H - pt - pb;
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
      <svg width={W} height={H}>
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
    <div style={{fontFamily:"JetBrains Mono",fontSize:11,color:"#00e5ff",letterSpacing:2}}>FETCHING WEATHER DATA</div>
    <div style={{background:"#1a2d4a",borderRadius:2,height:4,width:200}}><div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#00e5ff66,#00e5ff)",borderRadius:2,transition:"width 0.3s"}}/></div>
    <div style={{fontFamily:"Barlow Condensed",fontSize:12,color:"#4a6a8a"}}>{loaded}/{total} sites · {pct}%</div>
  </div>);
}
function LoadCards(){return <div style={{display:"grid",gap:8}}>{[1,2,3,4,5].map(i=><div key={i} style={{background:"#0d1520",border:"1px solid #1a2d4a",borderRadius:8,padding:14,height:70,opacity:.3+i*.1}}><div style={{background:"#1a2d4a",borderRadius:3,height:12,width:"40%",marginBottom:8}}/><div style={{background:"#1a2d4a",borderRadius:3,height:8,width:"60%"}}/></div>)}</div>;}
function Pill({label,value,score}){const c=sCol(score);return(<div style={{background:"#080c14",border:`1px solid ${c}22`,borderRadius:3,padding:"2px 5px"}}><div style={{fontFamily:"JetBrains Mono",fontSize:6,color:"#4a6a8a"}}>{label}</div><div style={{fontFamily:"JetBrains Mono",fontSize:9,color:c,fontWeight:600}}>{value}</div></div>);}
function sCol(s){return s>=78?"#00e5ff":s>=58?"#ffd700":s>=38?"#ff8c00":"#ff3b3b";}
function cDir(deg){const d=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];return d[Math.round(((deg%360)+360)%360/22.5)%16];}
