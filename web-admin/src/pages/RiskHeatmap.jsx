import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './RiskHeatmap.css';

/* ─── Separate data by time-of-day AND day-type ────────────────
   Each combo gives distinct hotspot locations & intensities     */
const HEATMAP_DATA = {
    morning: {
        all: [
            [28.6139, 77.2090, 0.9], [28.6200, 77.2200, 0.7], [28.6050, 77.1950, 0.5],
            [28.6350, 77.2500, 0.8], [28.5900, 77.2100, 0.6], [28.6010, 77.2450, 0.4],
            [28.6250, 77.1800, 0.7], [28.6450, 77.2100, 0.5], [28.5800, 77.2350, 0.9],
        ],
        weekday: [
            [28.6139, 77.2090, 0.9], [28.6220, 77.2180, 0.8], [28.6320, 77.2400, 0.7],
            [28.5950, 77.2050, 0.6], [28.6460, 77.2080, 0.5], [28.6070, 77.2480, 0.6],
        ],
        weekend: [
            [28.6050, 77.1950, 0.5], [28.6350, 77.2500, 0.6], [28.5900, 77.2100, 0.4],
            [28.6250, 77.1800, 0.5], [28.5780, 77.2300, 0.7],
        ],
    },
    evening: {
        all: [
            [28.6139, 77.2090, 0.6], [28.6300, 77.2350, 0.9], [28.6100, 77.2200, 0.8],
            [28.6400, 77.2050, 0.7], [28.5950, 77.2200, 0.5], [28.6200, 77.1900, 0.6],
            [28.6050, 77.2500, 0.9], [28.5850, 77.2150, 0.4], [28.6500, 77.2300, 0.8],
        ],
        weekday: [
            [28.6139, 77.2090, 0.8], [28.6300, 77.2350, 0.9], [28.6400, 77.2050, 0.9],
            [28.5950, 77.2200, 0.7], [28.6050, 77.2500, 0.8], [28.6500, 77.2300, 0.7],
            [28.6200, 77.2100, 0.6],
        ],
        weekend: [
            [28.6100, 77.2200, 0.5], [28.6200, 77.1900, 0.4], [28.5850, 77.2150, 0.6],
            [28.6450, 77.2200, 0.5],
        ],
    },
    night: {
        all: [
            [28.6139, 77.2090, 0.4], [28.6350, 77.2450, 0.5], [28.5900, 77.2050, 0.9],
            [28.6150, 77.2300, 0.8], [28.6420, 77.2180, 0.7], [28.5780, 77.2280, 0.9],
            [28.6280, 77.1850, 0.6], [28.6080, 77.2420, 0.5], [28.6480, 77.2080, 0.8],
        ],
        weekday: [
            [28.5900, 77.2050, 0.8], [28.6150, 77.2300, 0.7], [28.5780, 77.2280, 0.9],
            [28.6480, 77.2080, 0.7],
        ],
        weekend: [
            [28.6350, 77.2450, 0.9], [28.6420, 77.2180, 0.9], [28.6280, 77.1850, 0.8],
            [28.6080, 77.2420, 0.7], [28.6480, 77.2080, 0.9], [28.5900, 77.2050, 0.7],
        ],
    },
};

/* Stats also vary by filter combo */
const STATS = {
    morning: {
        all: { hotspots: 24, overspeed: 11, nightRisk: 7 },
        weekday: { hotspots: 18, overspeed: 9, nightRisk: 3 },
        weekend: { hotspots: 9, overspeed: 4, nightRisk: 1 },
    },
    evening: {
        all: { hotspots: 31, overspeed: 14, nightRisk: 5 },
        weekday: { hotspots: 26, overspeed: 12, nightRisk: 4 },
        weekend: { hotspots: 11, overspeed: 5, nightRisk: 2 },
    },
    night: {
        all: { hotspots: 19, overspeed: 7, nightRisk: 12 },
        weekday: { hotspots: 12, overspeed: 5, nightRisk: 8 },
        weekend: { hotspots: 21, overspeed: 8, nightRisk: 14 },
    },
};

/* ── Inject leaflet.heat via CDN ─────────────────────────────── */
function useLeafletHeat() {
    const [ready, setReady] = useState(!!window.L?.heatLayer);
    useEffect(() => {
        if (window.L?.heatLayer) { setReady(true); return; }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
        script.onload = () => setReady(true);
        document.head.appendChild(script);
    }, []);
    return ready;
}

function HeatLayer({ points }) {
    const map = useMap();
    const heatReady = useLeafletHeat();
    useEffect(() => {
        if (!heatReady || !window.L?.heatLayer) return;
        const layer = window.L.heatLayer(points, {
            radius: 40, blur: 30, maxZoom: 15,
            gradient: { 0.3: '#3b82f6', 0.6: '#f59e0b', 1.0: '#ef4444' },
        }).addTo(map);
        return () => map.removeLayer(layer);
    }, [map, points, heatReady]);
    return null;
}

const ZONE_LABELS = [
    { color: 'var(--red)', label: 'Accident-Prone Zone' },
    { color: 'var(--amber)', label: 'Frequent Overspeed Zone' },
    { color: 'var(--blue)', label: 'Late-night High-Risk Route' },
];

export default function RiskHeatmap() {
    const [timeFilter, setTimeFilter] = useState('evening');
    const [dayFilter, setDayFilter] = useState('all');

    /* Points and stats both driven by BOTH filter values */
    const points = useMemo(() => HEATMAP_DATA[timeFilter][dayFilter], [timeFilter, dayFilter]);
    const stats = useMemo(() => STATS[timeFilter][dayFilter], [timeFilter, dayFilter]);

    return (
        <div className="heatmap-page">
            {/* Controls */}
            <div className="heatmap-controls card">
                <div className="control-group">
                    <span className="control-label">TIME OF DAY</span>
                    <div className="tab-group">
                        {[
                            { key: 'morning', label: '🌅 Morning' },
                            { key: 'evening', label: '🌆 Evening' },
                            { key: 'night', label: '🌙 Night' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                className={`tab-btn${timeFilter === key ? ' active' : ''}`}
                                onClick={() => setTimeFilter(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-group">
                    <span className="control-label">DAY TYPE</span>
                    <div className="tab-group">
                        {[
                            { key: 'all', label: 'All Days' },
                            { key: 'weekday', label: 'Weekdays' },
                            { key: 'weekend', label: 'Weekends' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                className={`tab-btn${dayFilter === key ? ' active' : ''}`}
                                onClick={() => setDayFilter(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="legend-chips">
                    {ZONE_LABELS.map(z => (
                        <span key={z.label} className="legend-chip">
                            <span className="legend-chip-dot" style={{ background: z.color }} />
                            {z.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Map */}
            <div className="map-wrapper card">
                <MapContainer
                    center={[28.6139, 77.2090]}
                    zoom={12}
                    style={{ height: '520px', width: '100%', borderRadius: 'var(--radius-md)' }}
                    zoomControl={true}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />
                    <HeatLayer points={points} />
                </MapContainer>
            </div>

            {/* Stats — update with filter */}
            <div className="grid-3">
                <div className="card card-sm stat-card">
                    <span className="stat-label">Hotspots Identified</span>
                    <span className="stat-value" style={{ color: 'var(--red)' }}>{stats.hotspots}</span>
                    <span className="stat-delta delta-down">
                        {timeFilter === 'night' ? '⚠ High late-night risk' : '↑ Active this period'}
                    </span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Overspeed Zones</span>
                    <span className="stat-value" style={{ color: 'var(--amber)' }}>{stats.overspeed}</span>
                    <span className="stat-delta delta-neu">
                        {dayFilter === 'weekend' ? 'Lower weekday vol.' : 'Stable'}
                    </span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Night-Risk Routes</span>
                    <span className="stat-value" style={{ color: 'var(--blue)' }}>{stats.nightRisk}</span>
                    <span className={`stat-delta ${timeFilter === 'night' ? 'delta-down' : 'delta-up'}`}>
                        {timeFilter === 'night' ? '↑ Peak now' : '↓ Reduced in daylight'}
                    </span>
                </div>
            </div>
        </div>
    );
}
