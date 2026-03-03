import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './RiskHeatmap.css';

/* Simulated heatmap data points [lat, lng, intensity] */
const HEATMAP_DATA = {
    morning: [
        [28.6139, 77.2090, 0.9], [28.6200, 77.2200, 0.7], [28.6050, 77.1950, 0.5],
        [28.6350, 77.2500, 0.8], [28.5900, 77.2100, 0.6], [28.6010, 77.2450, 0.4],
        [28.6250, 77.1800, 0.7], [28.6450, 77.2100, 0.5], [28.5800, 77.2350, 0.9],
    ],
    evening: [
        [28.6139, 77.2090, 0.6], [28.6300, 77.2350, 0.9], [28.6100, 77.2200, 0.8],
        [28.6400, 77.2050, 0.7], [28.5950, 77.2200, 0.5], [28.6200, 77.1900, 0.6],
        [28.6050, 77.2500, 0.9], [28.5850, 77.2150, 0.4], [28.6500, 77.2300, 0.8],
    ],
    night: [
        [28.6139, 77.2090, 0.4], [28.6350, 77.2450, 0.5], [28.5900, 77.2050, 0.9],
        [28.6150, 77.2300, 0.8], [28.6420, 77.2180, 0.7], [28.5780, 77.2280, 0.9],
        [28.6280, 77.1850, 0.6], [28.6080, 77.2420, 0.5], [28.6480, 77.2080, 0.8],
    ],
};

/* Inject leaflet.heat via CDN dynamically */
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

    const points = HEATMAP_DATA[timeFilter];

    return (
        <div className="heatmap-page">
            {/* Controls */}
            <div className="heatmap-controls card">
                <div className="control-group">
                    <span className="control-label">Time of Day</span>
                    <div className="tab-group">
                        {['morning', 'evening', 'night'].map(t => (
                            <button key={t} className={`tab-btn${timeFilter === t ? ' active' : ''}`} onClick={() => setTimeFilter(t)}>
                                {t === 'morning' ? '🌅 Morning' : t === 'evening' ? '🌆 Evening' : '🌙 Night'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="control-group">
                    <span className="control-label">Day Type</span>
                    <div className="tab-group">
                        {['all', 'weekday', 'weekend'].map(d => (
                            <button key={d} className={`tab-btn${dayFilter === d ? ' active' : ''}`} onClick={() => setDayFilter(d)}>
                                {d === 'all' ? 'All Days' : d === 'weekday' ? 'Weekdays' : 'Weekends'}
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

            {/* Stats */}
            <div className="grid-3">
                <div className="card card-sm stat-card">
                    <span className="stat-label">Hotspots Identified</span>
                    <span className="stat-value" style={{ color: 'var(--red)' }}>24</span>
                    <span className="stat-delta delta-down">↑ 3 new this week</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Overspeed Zones</span>
                    <span className="stat-value" style={{ color: 'var(--amber)' }}>11</span>
                    <span className="stat-delta delta-neu">Stable</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Night-Risk Routes</span>
                    <span className="stat-value" style={{ color: 'var(--blue)' }}>7</span>
                    <span className="stat-delta delta-up">↓ 2 cleared this week</span>
                </div>
            </div>
        </div>
    );
}
