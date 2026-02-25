import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ─── SITES DATABASE ───────────────────────────────────────────────────────────
const UK_SITES = [
  { id: 1, name: "Mam Tor", lat: 53.3456, lon: -1.8014, altitude_m: 517, aspect: 270, wind_range_min: 15, wind_range_max: 45, site_type: "mountain", pg_rating: "CP", region: "Peak District" },
  { id: 2, name: "Bradwell Edge", lat: 53.3286, lon: -1.7512, altitude_m: 420, aspect: 315, wind_range_min: 12, wind_range_max: 40, site_type: "hill", pg_rating: "CP", region: "Peak District" },
  { id: 3, name: "Parlick", lat: 53.8712, lon: -2.5834, altitude_m: 432, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "hill", pg_rating: "open", region: "Lancashire" },
  { id: 4, name: "Pendle Hill", lat: 53.8614, lon: -2.2998, altitude_m: 557, aspect: 315, wind_range_min: 15, wind_range_max: 45, site_type: "hill", pg_rating: "CP", region: "Lancashire" },
  { id: 5, name: "Long Mynd", lat: 52.5364, lon: -2.8712, altitude_m: 517, aspect: 270, wind_range_min: 15, wind_range_max: 55, site_type: "hill", pg_rating: "open", region: "Shropshire" },
  { id: 6, name: "Devil's Dyke", lat: 50.9012, lon: -0.2234, altitude_m: 208, aspect: 180, wind_range_min: 15, wind_range_max: 40, site_type: "hill", pg_rating: "CP", region: "South Downs" },
  { id: 7, name: "Firle Beacon", lat: 50.8412, lon: 0.1156, altitude_m: 217, aspect: 180, wind_range_min: 12, wind_range_max: 38, site_type: "hill", pg_rating: "open", region: "South Downs" },
  { id: 8, name: "Ditchling Beacon", lat: 50.9034, lon: -0.1078, altitude_m: 248, aspect: 180, wind_range_min: 15, wind_range_max: 40, site_type: "hill", pg_rating: "CP", region: "South Downs" },
  { id: 9, name: "White Sheet Hill", lat: 51.0812, lon: -2.2234, altitude_m: 243, aspect: 225, wind_range_min: 12, wind_range_max: 40, site_type: "hill", pg_rating: "open", region: "Wiltshire" },
  { id: 10, name: "Westbury", lat: 51.2645, lon: -2.1578, altitude_m: 213, aspect: 270, wind_range_min: 12, wind_range_max: 38, site_type: "hill", pg_rating: "club", region: "Wiltshire" },
  { id: 11, name: "Hay Bluff", lat: 52.0012, lon: -3.1234, altitude_m: 677, aspect: 315, wind_range_min: 15, wind_range_max: 50, site_type: "mountain", pg_rating: "open", region: "Black Mountains" },
  { id: 12, name: "Blorenge", lat: 51.7712, lon: -3.0434, altitude_m: 559, aspect: 225, wind_range_min: 15, wind_range_max: 50, site_type: "mountain", pg_rating: "open", region: "South Wales" },
  { id: 13, name: "Rhossili", lat: 51.5712, lon: -4.2934, altitude_m: 193, aspect: 270, wind_range_min: 20, wind_range_max: 55, site_type: "coastal", pg_rating: "CP", region: "Gower" },
  { id: 14, name: "Great Orme", lat: 53.3312, lon: -3.8534, altitude_m: 207, aspect: 315, wind_range_min: 15, wind_range_max: 45, site_type: "coastal", pg_rating: "CP", region: "North Wales" },
  { id: 15, name: "Clough Head", lat: 54.6212, lon: -3.0634, altitude_m: 726, aspect: 315, wind_range_min: 15, wind_range_max: 55, site_type: "mountain", pg_rating: "open", region: "Lake District" },
  { id: 16, name: "Ingleborough", lat: 54.1712, lon: -2.3734, altitude_m: 723, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "mountain", pg_rating: "open", region: "Yorkshire Dales" },
  { id: 17, name: "Roseberry Topping", lat: 54.5212, lon: -1.1234, altitude_m: 320, aspect: 225, wind_range_min: 12, wind_range_max: 40, site_type: "hill", pg_rating: "CP", region: "North Yorkshire" },
  { id: 18, name: "Combe Gibbet", lat: 51.4212, lon: -1.4534, altitude_m: 297, aspect: 315, wind_range_min: 12, wind_range_max: 38, site_type: "hill", pg_rating: "open", region: "Berkshire Downs" },
  { id: 19, name: "Dartmoor (Pew Tor)", lat: 50.5512, lon: -4.0934, altitude_m: 319, aspect: 270, wind_range_min: 15, wind_range_max: 50, site_type: "hill", pg_rating: "open", region: "Dartmoor" },
  { id: 20, name: "Stanage Edge", lat: 53.3712, lon: -1.6634, altitude_m: 458, aspect: 270, wind_range_min: 15, wind_range_max: 45, site_type: "hill", pg_rating: "CP", region: "Peak District" },
];

// ─── WEATHER FETCHING ────────────────────────────────────────────────────────
async function fetchOpenMeteo(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,weathercode,windspeed_10m,windspeed_80m,winddirection_10m,winddirection_80m,windgusts_10m,cape,visibility,cloudcover,surface_pressure,boundary_layer_height&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant&wind_speed_unit=kmh&forecast_days=3&timezone=Europe%2FLondon`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Open-Meteo fetch failed");
  return res.json();
}

// ─── FLYABILITY ALGORITHM ─────────────────────────────────────────────────────
function angleDiff(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function calcFlyability(site, dayData) {
  const { windDir, windSpeed, gustSpeed, precipProb, cape, cloudBase, visibility, blHeight, tempMax } = dayData;

  // Wind direction score (25%)
  const dirDiff = angleDiff(windDir, site.aspect);
  const dirScore = dirDiff <= 45 ? 100 : dirDiff <= 90 ? 60 : dirDiff <= 135 ? 20 : 0;

  // Wind speed score (20%)
  const mid = (site.wind_range_min + site.wind_range_max) / 2;
  let speedScore = 0;
  if (windSpeed < site.wind_range_min) speedScore = (windSpeed / site.wind_range_min) * 70;
  else if (windSpeed <= site.wind_range_max) {
    const range = site.wind_range_max - site.wind_range_min;
    const pos = windSpeed - site.wind_range_min;
    speedScore = 100 - Math.abs(pos / range - 0.3) * 60;
  } else speedScore = Math.max(0, 100 - (windSpeed - site.wind_range_max) * 5);

  // Precipitation score (15%)
  const precipScore = precipProb < 10 ? 100 : precipProb < 20 ? 80 : precipProb < 40 ? 40 : 0;

  // Thermal strength (15%) — from CAPE & BL height
  const thermalIdx = Math.min(100, (cape / 500) * 60 + (blHeight / 2000) * 40);

  // Cloud base (10%)
  const cloudBaseAboveLaunch = Math.max(0, cloudBase - site.altitude_m);
  const cloudScore = cloudBaseAboveLaunch > 800 ? 100 : cloudBaseAboveLaunch > 400 ? 70 : cloudBaseAboveLaunch > 200 ? 40 : 10;

  // Gust factor (10%)
  const gustRatio = gustSpeed / Math.max(windSpeed, 1);
  const gustScore = gustRatio < 1.2 ? 100 : gustRatio < 1.4 ? 70 : gustRatio < 1.6 ? 40 : 10;

  // Visibility (5%)
  const visScore = visibility > 10000 ? 100 : visibility > 5000 ? 70 : visibility > 2000 ? 30 : 0;

  const total = (dirScore * 0.25) + (speedScore * 0.20) + (precipScore * 0.15) +
    (thermalIdx * 0.15) + (cloudScore * 0.10) + (gustScore * 0.10) + (visScore * 0.05);

  return {
    score: Math.round(total),
    breakdown: { dirScore, speedScore, precipScore, thermalIdx, cloudScore, gustScore, visScore },
    label: total >= 75 ? "Excellent" : total >= 55 ? "Good" : total >= 35 ? "Marginal" : "Unflyable",
    color: total >= 75 ? "#00e5ff" : total >= 55 ? "#ffd700" : total >= 35 ? "#ff8c00" : "#ff3b3b",
  };
}

function calcXCPotential(dayData, flyScore) {
  if (flyScore < 35) return { label: "No XC", km: 0, color: "#ff3b3b" };
  const { cape, blHeight, windSpeed } = dayData;
  const thermalStr = Math.sqrt(Math.max(0, cape)) * 0.15 + blHeight / 100;
  const drift = windSpeed * 2;
  const potential = thermalStr + drift;
  if (potential > 120) return { label: "100km+ Epic day", km: 120, color: "#00e5ff" };
  if (potential > 70) return { label: "50–100km XC", km: 75, color: "#00e5ff" };
  if (potential > 35) return { label: "20–50km XC", km: 35, color: "#ffd700" };
  return { label: "Local soaring only", km: 10, color: "#ff8c00" };
}

function estimateCloudBase(tempC, dewpointC) {
  return Math.round((tempC - dewpointC) * 400);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function ParaglidingApp() {
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState("map");
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const days = useMemo(() => {
    const today = new Date();
    return [0, 1, 2].map(i => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return { date: d, label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-GB", { weekday: "long" }) };
    });
  }, []);

  const fetchAllWeather = useCallback(async () => {
    setLoading(true);
    const results = {};
    await Promise.all(
      UK_SITES.map(async site => {
        try {
          const data = await fetchOpenMeteo(site.lat, site.lon);
          results[site.id] = processWeatherData(data);
        } catch {
          results[site.id] = null;
        }
      })
    );
    setWeatherData(results);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  function processWeatherData(raw) {
    const daily = raw.daily;
    return [0, 1, 2].map(i => {
      const windDir = daily.winddirection_10m_dominant[i] ?? 270;
      const windSpeed = daily.windspeed_10m_max[i] ?? 20;
      const gustSpeed = daily.windgusts_10m_max[i] ?? 28;
      const precipProb = daily.precipitation_probability_max[i] ?? 20;
      const tempMax = daily.temperature_2m_max[i] ?? 15;
      const tempMin = daily.temperature_2m_min[i] ?? 8;
      const dewpoint = tempMin - 2;

      // Get hourly averages for cape, blh, visibility
      const hourlyStart = i * 24;
      const slice = (arr) => (arr || []).slice(hourlyStart + 6, hourlyStart + 18);
      const avg = (arr) => arr.length ? arr.reduce((a, b) => a + (b || 0), 0) / arr.length : 0;

      const cape = avg(slice(raw.hourly.cape));
      const blHeight = avg(slice(raw.hourly.boundary_layer_height));
      const visibility = avg(slice(raw.hourly.visibility)) || 8000;
      const cloudBase = estimateCloudBase(tempMax, dewpoint);

      return { windDir, windSpeed, gustSpeed, precipProb, tempMax, tempMin, cape, blHeight, visibility, cloudBase };
    });
  }

  const siteFlyData = useMemo(() => {
    const result = {};
    UK_SITES.forEach(site => {
      const siteWeather = weatherData[site.id];
      if (!siteWeather) { result[site.id] = null; return; }
      result[site.id] = siteWeather.map(dayData => {
        const fly = calcFlyability(site, dayData);
        const xc = calcXCPotential(dayData, fly.score);
        return { ...fly, xc, dayData };
      });
    });
    return result;
  }, [weatherData]);

  useEffect(() => { fetchAllWeather(); }, [fetchAllWeather]);

  // Map init
  useEffect(() => {
    if (activeTab !== "map") return;
    const initMap = () => {
      if (!window.L || !mapRef.current || mapInstanceRef.current) return;
      mapInstanceRef.current = window.L.map(mapRef.current, { zoomControl: false }).setView([53.5, -2.5], 6);
      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
      window.L.control.zoom({ position: "bottomright" }).addTo(mapInstanceRef.current);
      setMapReady(true);
    };
    if (!window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = initMap;
      document.head.appendChild(script);
    } else { initMap(); }
    return () => { if (mapInstanceRef.current && activeTab !== "map") {} };
  }, [activeTab]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    UK_SITES.forEach(site => {
      const fly = siteFlyData[site.id]?.[activeDay];
      const color = fly ? fly.color : "#555";
      const score = fly ? fly.score : "?";
      const icon = window.L.divIcon({
        className: "",
        html: `<div style="width:36px;height:36px;border-radius:50%;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;font-family:JetBrains Mono,monospace;font-size:10px;font-weight:700;color:${color};cursor:pointer;box-shadow:0 0 8px ${color}66">${score}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      const marker = window.L.marker([site.lat, site.lon], { icon })
        .addTo(mapInstanceRef.current)
        .on("click", () => setSelectedSite(site));
      markersRef.current.push(marker);
    });
  }, [mapReady, siteFlyData, activeDay]);

  const overallUKScore = useMemo(() => {
    return [0, 1, 2].map(dayIdx => {
      const scores = UK_SITES.map(s => siteFlyData[s.id]?.[dayIdx]?.score ?? 0);
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    });
  }, [siteFlyData]);

  const selectedFly = selectedSite ? siteFlyData[selectedSite.id] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Barlow+Condensed:wght@300;400;600;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #080c14; color: #c8d8f0; font-family: 'Barlow Condensed', sans-serif; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0d1520; } ::-webkit-scrollbar-thumb { background: #1e3050; border-radius: 2px; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .glow-cyan { text-shadow: 0 0 12px #00e5ff88; }
        .glow-amber { text-shadow: 0 0 12px #ffd70088; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", maxWidth: "100vw", overflow: "hidden" }}>
        {/* HEADER */}
        <header style={{ background: "linear-gradient(180deg, #0a1628 0%, #080c14 100%)", borderBottom: "1px solid #1a2d4a", padding: "0 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, paddingBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 24 }}>🪂</div>
              <div>
                <div style={{ fontFamily: "Barlow Condensed", fontWeight: 900, fontSize: 20, letterSpacing: 2, color: "#00e5ff", textTransform: "uppercase" }}>
                  UK FLYCAST
                </div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#4a6a8a", letterSpacing: 1 }}>PARAGLIDING WEATHER INTELLIGENCE</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {lastUpdated && (
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#4a6a8a", textAlign: "right" }}>
                  <div>UPDATED</div>
                  <div style={{ color: "#6a9abf" }}>{lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              )}
              <button onClick={fetchAllWeather} disabled={loading}
                style={{ background: loading ? "#1a2d4a" : "#00e5ff14", border: `1px solid ${loading ? "#1a2d4a" : "#00e5ff44"}`, color: loading ? "#4a6a8a" : "#00e5ff", padding: "6px 12px", borderRadius: 4, fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 12, letterSpacing: 1, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", animation: loading ? "spin 1s linear infinite" : "none" }}>↻</span>
                {loading ? "FETCHING..." : "REFRESH"}
              </button>
            </div>
          </div>

          {/* 3-DAY STRIP */}
          <div style={{ display: "flex", gap: 6, paddingBottom: 10, overflowX: "auto" }}>
            {days.map((day, i) => {
              const score = overallUKScore[i] || 0;
              const color = score >= 75 ? "#00e5ff" : score >= 55 ? "#ffd700" : score >= 35 ? "#ff8c00" : "#ff3b3b";
              const label = score >= 75 ? "EXCELLENT" : score >= 55 ? "GOOD" : score >= 35 ? "MARGINAL" : "POOR";
              const active = i === activeDay;
              return (
                <button key={i} onClick={() => setActiveDay(i)}
                  style={{ flex: "0 0 auto", background: active ? `${color}18` : "#0d1520", border: `1px solid ${active ? color : "#1a2d4a"}`, borderRadius: 6, padding: "8px 16px", cursor: "pointer", textAlign: "left", minWidth: 100, transition: "all 0.2s" }}>
                  <div style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 13, color: active ? color : "#6a9abf", letterSpacing: 1, textTransform: "uppercase" }}>{day.label}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#4a6a8a", marginTop: 2 }}>{day.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</div>
                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${color}22`, border: `1.5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, color }}>
                      {loading ? "—" : score}
                    </div>
                    <div style={{ fontFamily: "Barlow Condensed", fontSize: 11, fontWeight: 600, color, letterSpacing: 0.5 }}>{loading ? "..." : label}</div>
                  </div>
                </button>
              );
            })}
            <div style={{ flex: 1, background: "#0d1520", border: "1px solid #1a2d4a", borderRadius: 6, padding: "8px 16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: "Barlow Condensed", fontSize: 11, color: "#4a6a8a", letterSpacing: 1 }}>DATA SOURCES</div>
              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                {["Open-Meteo ✓", "Met Office ~", "OWM ~"].map(s => (
                  <span key={s} style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: s.includes("✓") ? "#00e5ff" : "#4a6a8a", background: s.includes("✓") ? "#00e5ff11" : "#1a2d4a", border: `1px solid ${s.includes("✓") ? "#00e5ff33" : "#2a3d5a"}`, borderRadius: 3, padding: "2px 5px" }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* NAV */}
        <nav style={{ background: "#0a1220", borderBottom: "1px solid #1a2d4a", display: "flex", flexShrink: 0 }}>
          {[{ id: "map", icon: "◉", label: "MAP" }, { id: "sites", icon: "≡", label: "SITES" }, { id: "forecast", icon: "◈", label: "FORECAST" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, padding: "9px 0", background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? "#00e5ff" : "transparent"}`, color: activeTab === tab.id ? "#00e5ff" : "#4a6a8a", fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex" }}>
          {/* MAP TAB */}
          {activeTab === "map" && (
            <div style={{ flex: 1, position: "relative" }}>
              <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
              {loading && (
                <div style={{ position: "absolute", inset: 0, background: "#080c14cc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, zIndex: 1000 }}>
                  <div style={{ fontSize: 40, animation: "spin 2s linear infinite" }}>🪂</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "#00e5ff", letterSpacing: 2 }}>FETCHING WEATHER DATA...</div>
                  <div style={{ fontFamily: "Barlow Condensed", fontSize: 12, color: "#4a6a8a" }}>Querying Open-Meteo for {UK_SITES.length} sites</div>
                </div>
              )}
            </div>
          )}

          {/* SITES TAB */}
          {activeTab === "sites" && (
            <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
              <div style={{ display: "grid", gap: 8 }}>
                {UK_SITES.sort((a, b) => {
                  const sa = siteFlyData[b.id]?.[activeDay]?.score ?? 0;
                  const sb = siteFlyData[a.id]?.[activeDay]?.score ?? 0;
                  return sa - sb;
                }).map(site => {
                  const fly = siteFlyData[site.id]?.[activeDay];
                  const color = fly ? fly.color : "#4a6a8a";
                  return (
                    <button key={site.id} onClick={() => { setSelectedSite(site); }}
                      style={{ background: "#0d1520", border: `1px solid ${selectedSite?.id === site.id ? color : "#1a2d4a"}`, borderRadius: 6, padding: "10px 14px", cursor: "pointer", textAlign: "left", width: "100%", transition: "border-color 0.2s" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 16, color: "#c8d8f0" }}>{site.name}</div>
                          <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#4a6a8a" }}>{site.region} · {site.altitude_m}m · {site.site_type.toUpperCase()} · {site.pg_rating.toUpperCase()}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {fly && <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: fly.xc.color }}>{fly.xc.label}</div>}
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: fly ? `${color}18` : "#1a2d4a", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 0 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 700, color, lineHeight: 1 }}>{loading ? "—" : (fly?.score ?? "?")}</div>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 7, color: fly ? color : "#4a6a8a" }}>
                              {fly ? (fly.label === "Excellent" ? "EXC" : fly.label === "Good" ? "GOOD" : fly.label === "Marginal" ? "MARG" : "NOGO") : "..."}
                            </div>
                          </div>
                        </div>
                      </div>
                      {fly && (
                        <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <DataPill label="DIR" value={`${fly.dayData.windDir}°`} score={fly.breakdown.dirScore} />
                          <DataPill label="SPD" value={`${Math.round(fly.dayData.windSpeed)}km/h`} score={fly.breakdown.speedScore} />
                          <DataPill label="RAIN" value={`${fly.dayData.precipProb}%`} score={fly.breakdown.precipScore} />
                          <DataPill label="BASE" value={`${fly.dayData.cloudBase}m`} score={fly.breakdown.cloudScore} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FORECAST TAB */}
          {activeTab === "forecast" && (
            <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 18, color: "#00e5ff", letterSpacing: 2 }}>3-DAY UK FLYING FORECAST</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "#4a6a8a", marginTop: 2 }}>Aggregate flyability across all {UK_SITES.length} sites</div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {days.map((day, i) => {
                  const score = overallUKScore[i];
                  const color = score >= 75 ? "#00e5ff" : score >= 55 ? "#ffd700" : score >= 35 ? "#ff8c00" : "#ff3b3b";
                  const topSites = UK_SITES
                    .map(s => ({ site: s, fly: siteFlyData[s.id]?.[i] }))
                    .filter(x => x.fly && x.fly.score >= 55)
                    .sort((a, b) => b.fly.score - a.fly.score)
                    .slice(0, 5);
                  return (
                    <div key={i} style={{ background: "#0d1520", border: `1px solid ${i === activeDay ? color : "#1a2d4a"}`, borderRadius: 8, padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontFamily: "Barlow Condensed", fontWeight: 900, fontSize: 22, color, letterSpacing: 1, textTransform: "uppercase" }}>{day.label}</div>
                          <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "#4a6a8a" }}>{day.date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "JetBrains Mono", fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{loading ? "—" : score}</div>
                          <div style={{ fontFamily: "Barlow Condensed", fontSize: 12, color }}>UK AVERAGE</div>
                        </div>
                      </div>
                      {/* Score bar */}
                      <div style={{ background: "#1a2d4a", borderRadius: 2, height: 4, marginBottom: 12 }}>
                        <div style={{ width: `${score}%`, height: "100%", background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 2, transition: "width 0.8s ease" }} />
                      </div>
                      {topSites.length > 0 ? (
                        <div>
                          <div style={{ fontFamily: "Barlow Condensed", fontSize: 11, color: "#4a6a8a", letterSpacing: 1, marginBottom: 6 }}>TOP SITES</div>
                          <div style={{ display: "grid", gap: 4 }}>
                            {topSites.map(({ site, fly }) => (
                              <div key={site.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a1220", borderRadius: 4, padding: "6px 10px" }}>
                                <div>
                                  <span style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 14, color: "#c8d8f0" }}>{site.name}</span>
                                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#4a6a8a", marginLeft: 8 }}>{site.region}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: fly.xc.color }}>{fly.xc.label}</span>
                                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 700, color: fly.color }}>{fly.score}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontFamily: "Barlow Condensed", fontSize: 14, color: "#4a6a8a", textAlign: "center", padding: "8px 0" }}>No sites forecast flyable this day</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SIDE PANEL */}
          {selectedSite && (
            <SitePanel
              site={selectedSite}
              flyData={selectedFly}
              activeDay={activeDay}
              days={days}
              onClose={() => setSelectedSite(null)}
              onDayChange={setActiveDay}
            />
          )}
        </div>

        {/* FOOTER */}
        <footer style={{ background: "#080c14", borderTop: "1px solid #1a2d4a", padding: "6px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#2a3d5a" }}>
              ⚠ For planning only — always check local club NOTAMs, site guides & current conditions before flying
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[["Windy", "https://windy.com"], ["XCSkies", "https://xcskies.com"], ["Flybubble", "https://flybubble.com/weather"]].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#4a6a8a", textDecoration: "none", borderBottom: "1px solid #1a2d4a" }}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// ─── SITE PANEL ───────────────────────────────────────────────────────────────
function SitePanel({ site, flyData, activeDay, days, onClose, onDayChange }) {
  const fly = flyData?.[activeDay];
  const color = fly ? fly.color : "#4a6a8a";

  return (
    <div className="fade-in" style={{ width: 320, maxWidth: "100%", background: "#0a1220", borderLeft: "1px solid #1a2d4a", overflow: "auto", flexShrink: 0 }}>
      {/* Panel header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a2d4a", background: "#080c14", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "Barlow Condensed", fontWeight: 900, fontSize: 20, color: "#e0eeff", letterSpacing: 0.5 }}>{site.name}</div>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#4a6a8a", marginTop: 2 }}>
              {site.region} · {site.altitude_m}m ASL
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#1a2d4a", border: "none", color: "#6a9abf", width: 28, height: 28, borderRadius: 4, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
          {[
            { label: site.site_type.toUpperCase(), col: "#6a9abf" },
            { label: site.pg_rating.toUpperCase(), col: "#ffd700" },
            { label: `ASPECT: ${compassDir(site.aspect)}`, col: "#00e5ff" },
            { label: `${site.wind_range_min}–${site.wind_range_max}km/h`, col: "#00e5ff" },
          ].map(badge => (
            <span key={badge.label} style={{ fontFamily: "JetBrains Mono", fontSize: 8, color: badge.col, background: `${badge.col}11`, border: `1px solid ${badge.col}33`, borderRadius: 3, padding: "2px 6px" }}>{badge.label}</span>
          ))}
        </div>
      </div>

      {/* Day selector */}
      <div style={{ display: "flex", borderBottom: "1px solid #1a2d4a" }}>
        {days.map((day, i) => {
          const f = flyData?.[i];
          const c = f ? f.color : "#4a6a8a";
          return (
            <button key={i} onClick={() => onDayChange(i)}
              style={{ flex: 1, padding: "8px 4px", background: "none", border: "none", borderBottom: `2px solid ${i === activeDay ? c : "transparent"}`, cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontFamily: "Barlow Condensed", fontSize: 11, fontWeight: 700, color: i === activeDay ? c : "#4a6a8a", letterSpacing: 0.5 }}>{day.label.slice(0, 3).toUpperCase()}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: c, marginTop: 2 }}>{f ? f.score : "—"}</div>
            </button>
          );
        })}
      </div>

      {fly ? (
        <div style={{ padding: 16 }}>
          {/* Big score */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${color}18`, border: `3px solid ${color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 20px ${color}44` }}>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{fly.score}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 8, color }}>/ 100</div>
            </div>
            <div>
              <div style={{ fontFamily: "Barlow Condensed", fontWeight: 900, fontSize: 22, color, letterSpacing: 1 }}>{fly.label.toUpperCase()}</div>
              <div style={{ fontFamily: "Barlow Condensed", fontSize: 14, color: fly.xc.color, marginTop: 2 }}>✈ {fly.xc.label}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#4a6a8a", marginTop: 2 }}>Confidence: MEDIUM (1/3 sources)</div>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "Barlow Condensed", fontSize: 12, color: "#4a6a8a", letterSpacing: 1, marginBottom: 8 }}>FLYABILITY BREAKDOWN</div>
            {[
              { label: "Wind Direction", score: fly.breakdown.dirScore, value: `${fly.dayData.windDir}° (${compassDir(fly.dayData.windDir)})`, weight: "25%" },
              { label: "Wind Speed", score: fly.breakdown.speedScore, value: `${Math.round(fly.dayData.windSpeed)} km/h`, weight: "20%" },
              { label: "Precipitation", score: fly.breakdown.precipScore, value: `${fly.dayData.precipProb}% prob`, weight: "15%" },
              { label: "Thermal Index", score: fly.breakdown.thermalIdx, value: `CAPE ${Math.round(fly.dayData.cape)} J/kg`, weight: "15%" },
              { label: "Cloud Base", score: fly.breakdown.cloudScore, value: `${fly.dayData.cloudBase}m AGL`, weight: "10%" },
              { label: "Gust Factor", score: fly.breakdown.gustScore, value: `${Math.round(fly.dayData.gustSpeed)} km/h gusts`, weight: "10%" },
              { label: "Visibility", score: fly.breakdown.visScore, value: `${(fly.dayData.visibility / 1000).toFixed(1)}km`, weight: "5%" },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontFamily: "Barlow Condensed", fontSize: 13, fontWeight: 600, color: "#9ab8d8" }}>{item.label}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 8, color: "#2a3d5a" }}>×{item.weight}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#6a9abf" }}>{item.value}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 700, color: scoreColor(item.score), minWidth: 28, textAlign: "right" }}>{Math.round(item.score)}</span>
                  </div>
                </div>
                <div style={{ background: "#1a2d4a", borderRadius: 2, height: 3 }}>
                  <div style={{ width: `${Math.round(item.score)}%`, height: "100%", background: scoreColor(item.score), borderRadius: 2, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Wind rose */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "Barlow Condensed", fontSize: 12, color: "#4a6a8a", letterSpacing: 1, marginBottom: 8 }}>WIND ROSE</div>
            <WindRose windDir={fly.dayData.windDir} siteAspect={site.aspect} windSpeed={fly.dayData.windSpeed} gustSpeed={fly.dayData.gustSpeed} />
          </div>

          {/* Data table */}
          <div>
            <div style={{ fontFamily: "Barlow Condensed", fontSize: 12, color: "#4a6a8a", letterSpacing: 1, marginBottom: 8 }}>DATA SOURCES</div>
            <div style={{ background: "#080c14", borderRadius: 6, overflow: "hidden", border: "1px solid #1a2d4a" }}>
              {[
                { source: "Open-Meteo", wind: `${Math.round(fly.dayData.windSpeed)} km/h ${compassDir(fly.dayData.windDir)}`, rain: `${fly.dayData.precipProb}%`, status: "LIVE" },
                { source: "Met Office", wind: "—", rain: "—", status: "API KEY REQ" },
                { source: "OpenWeatherMap", wind: "—", rain: "—", status: "API KEY REQ" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", padding: "7px 10px", borderTop: i > 0 ? "1px solid #1a2d4a" : "none", alignItems: "center", gap: 8 }}>
                  <div style={{ fontFamily: "Barlow Condensed", fontSize: 12, color: "#9ab8d8", width: 100 }}>{row.source}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#6a9abf", flex: 1 }}>{row.wind}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#6a9abf", width: 30, textAlign: "right" }}>{row.rain}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 8, color: row.status === "LIVE" ? "#00e5ff" : "#2a3d5a", background: row.status === "LIVE" ? "#00e5ff11" : "#1a2d4a", border: `1px solid ${row.status === "LIVE" ? "#00e5ff33" : "#1a2d4a"}`, borderRadius: 3, padding: "1px 4px" }}>{row.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: 32, textAlign: "center", color: "#4a6a8a", fontFamily: "Barlow Condensed", fontSize: 14 }}>
          {loading ? "Loading weather data..." : "No data available"}
        </div>
      )}
    </div>
  );
}

// ─── WIND ROSE ────────────────────────────────────────────────────────────────
function WindRose({ windDir, siteAspect, windSpeed, gustSpeed }) {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 50;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  const toXY = (angleDeg, radius) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const windEnd = toXY(windDir, r * 0.8);
  const aspectEnd = toXY(siteAspect, r * 0.9);
  const gustEnd = toXY(windDir, r * Math.min(0.95, (gustSpeed / (windSpeed || 1)) * 0.8));

  return (
    <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      {/* Background */}
      <circle cx={cx} cy={cy} r={r + 8} fill="#080c14" stroke="#1a2d4a" strokeWidth={1} />
      {/* Rings */}
      {[0.33, 0.66, 1].map(f => (
        <circle key={f} cx={cx} cy={cy} r={r * f} fill="none" stroke="#1a2d4a" strokeWidth={0.5} strokeDasharray="3,3" />
      ))}
      {/* Cross hairs */}
      {[0, 90].map(a => {
        const p1 = toXY(a, r); const p2 = toXY(a + 180, r);
        return <line key={a} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#1a2d4a" strokeWidth={0.5} />;
      })}
      {/* Direction labels */}
      {dirs.map((d, i) => {
        const p = toXY(i * 45, r + 13);
        return <text key={d} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill="#4a6a8a" fontSize={8} fontFamily="JetBrains Mono">{d}</text>;
      })}
      {/* Site aspect arc */}
      <path d={describeArc(cx, cy, r * 0.95, siteAspect - 45, siteAspect + 45)} fill="#ffd70022" stroke="#ffd700" strokeWidth={1.5} />
      {/* Aspect label */}
      <text x={aspectEnd.x} y={aspectEnd.y} textAnchor="middle" dominantBaseline="middle" fill="#ffd700" fontSize={7} fontFamily="JetBrains Mono">★</text>
      {/* Gust ring */}
      <line x1={cx} y1={cy} x2={gustEnd.x} y2={gustEnd.y} stroke="#ff3b3b" strokeWidth={1} strokeDasharray="3,2" opacity={0.6} />
      {/* Wind arrow */}
      <line x1={cx} y1={cy} x2={windEnd.x} y2={windEnd.y} stroke="#00e5ff" strokeWidth={2} />
      <circle cx={windEnd.x} cy={windEnd.y} r={3} fill="#00e5ff" />
      {/* Center */}
      <circle cx={cx} cy={cy} r={4} fill="#00e5ff22" stroke="#00e5ff" strokeWidth={1} />
      {/* Speed label */}
      <text x={cx} y={cy + r + 24} textAnchor="middle" fill="#6a9abf" fontSize={8} fontFamily="JetBrains Mono">{Math.round(windSpeed)}km/h → {Math.round(gustSpeed)}km/h gust</text>
      {/* Legend */}
      <text x={4} y={size - 4} fill="#ffd700" fontSize={7} fontFamily="JetBrains Mono">★ aspect</text>
      <text x={size - 4} y={size - 4} textAnchor="end" fill="#00e5ff" fontSize={7} fontFamily="JetBrains Mono">wind →</text>
    </svg>
  );
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const toRad = d => ((d - 90) * Math.PI) / 180;
  const s = { x: cx + r * Math.cos(toRad(startDeg)), y: cy + r * Math.sin(toRad(startDeg)) };
  const e = { x: cx + r * Math.cos(toRad(endDeg)), y: cy + r * Math.sin(toRad(endDeg)) };
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y} Z`;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function DataPill({ label, value, score }) {
  const col = scoreColor(score);
  return (
    <div style={{ background: "#080c14", border: `1px solid ${col}33`, borderRadius: 3, padding: "2px 6px" }}>
      <div style={{ fontFamily: "JetBrains Mono", fontSize: 7, color: "#4a6a8a" }}>{label}</div>
      <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: col, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function scoreColor(score) {
  if (score >= 75) return "#00e5ff";
  if (score >= 55) return "#ffd700";
  if (score >= 35) return "#ff8c00";
  return "#ff3b3b";
}

function compassDir(deg) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}
