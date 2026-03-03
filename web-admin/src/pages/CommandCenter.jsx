import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import './CommandCenter.css';

/* ─── Simulated data ─────────────────────────────────────────── */
const DRIVER_TILES = [
    { id: 'D001', name: 'Ravi Sharma', status: 'safe', score: 94, route: 'NH-48 → Gurgaon', speed: 62, trips: 142, incident: 'None today', shift: 'Morning' },
    { id: 'D002', name: 'Priya Nair', status: 'moderate', score: 71, route: 'Ring Road → Noida', speed: 78, trips: 98, incident: 'Harsh braking ×3', shift: 'Evening' },
    { id: 'D003', name: 'Karan Mehta', status: 'critical', score: 43, route: 'Outer Ring → Thane', speed: 97, trips: 67, incident: 'Over-speed 97 km/h', shift: 'Night' },
    { id: 'D004', name: 'Anjali Singh', status: 'safe', score: 88, route: 'SH-1 → Pune', speed: 55, trips: 113, incident: 'None today', shift: 'Morning' },
    { id: 'D005', name: 'Deepak Rao', status: 'moderate', score: 65, route: 'BRTS → Ahmedabad', speed: 82, trips: 89, incident: 'Cont. driving 4h+', shift: 'Afternoon' },
    { id: 'D006', name: 'Meena Patel', status: 'safe', score: 91, route: 'Hosur Rd → Bengaluru', speed: 48, trips: 157, incident: 'None today', shift: 'Morning' },
];

const HIGH_RISK_TRIPS = [
    { driver: 'Karan Mehta', route: 'Outer Ring → Thane', risk: 'Critical', event: 'Over-speed 97 km/h', time: '2m ago' },
    { driver: 'Priya Nair', route: 'Ring Road → Noida', risk: 'Moderate', event: 'Harsh braking ×3', time: '8m ago' },
    { driver: 'Deepak Rao', route: 'BRTS → Ahmedabad', risk: 'Moderate', event: 'Continuous 4h+', time: '15m ago' },
];

function generatePulseData(prev) {
    const base = prev ? prev.slice(1) : [];
    const last = base.length ? base[base.length - 1].risk : 42;
    const newVal = Math.max(20, Math.min(80, last + (Math.random() - 0.5) * 8));
    const point = {
        t: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        risk: Math.round(newVal),
    };
    return [...base, point];
}

const INITIAL_PULSE = Array.from({ length: 15 }, (_, i) => ({
    t: `${i}s`,
    risk: Math.round(30 + Math.sin(i * 0.5) * 14 + Math.random() * 6),
}));

/* ─── Fleet Summary Bar ─────────────────────────────────────── */
function FleetSummaryBar({ drivers }) {
    const onRoad = drivers.length;
    const idle = 4;
    const safe = drivers.filter(d => d.status === 'safe').length;
    const moderate = drivers.filter(d => d.status === 'moderate').length;
    const critical = drivers.filter(d => d.status === 'critical').length;
    const avgScore = Math.round(drivers.reduce((s, d) => s + d.score, 0) / drivers.length);

    return (
        <div className="fleet-summary-bar">
            <div className="fsb-item">
                <span className="fsb-value teal">{onRoad}</span>
                <span className="fsb-label">On Road</span>
            </div>
            <div className="fsb-divider" />
            <div className="fsb-item">
                <span className="fsb-value muted">{idle}</span>
                <span className="fsb-label">Idle</span>
            </div>
            <div className="fsb-divider" />
            <div className="fsb-item">
                <span className="fsb-value green">{safe}</span>
                <span className="fsb-label">Safe</span>
            </div>
            <div className="fsb-divider" />
            <div className="fsb-item">
                <span className="fsb-value amber">{moderate}</span>
                <span className="fsb-label">At Risk</span>
            </div>
            <div className="fsb-divider" />
            <div className="fsb-item">
                <span className="fsb-value red">{critical}</span>
                <span className="fsb-label">Critical</span>
            </div>
            <div className="fsb-divider" />
            <div className="fsb-item">
                <span className="fsb-value teal">{avgScore}</span>
                <span className="fsb-label">Avg Score</span>
            </div>
            <div className="fsb-divider" />
            <div className="fsb-live">
                <span className="pulse-dot" />
                <span>Fleet Live — updating every 30s</span>
            </div>
        </div>
    );
}

/* ─── Risk Gauge ─────────────────────────────────────────────── */
function RiskIndexGauge({ value }) {
    const color = value >= 70 ? 'var(--red)' : value >= 50 ? 'var(--amber)' : 'var(--green)';
    const label = value >= 70 ? 'High Risk' : value >= 50 ? 'Moderate' : 'Healthy';
    const r = 54, circ = 2 * Math.PI * r;
    const filled = (value / 100) * circ;

    return (
        <div className="risk-gauge">
            <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle
                    cx="70" cy="70" r={r} fill="none"
                    stroke={color} strokeWidth="10"
                    strokeDasharray={`${filled} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.6s ease' }}
                />
                <text x="70" y="65" textAnchor="middle" fill={color} fontSize="26" fontWeight="800" fontFamily="Inter">{value}</text>
                <text x="70" y="84" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="Inter">Fleet Risk Index</text>
            </svg>
            <span className={`badge ${value >= 70 ? 'badge-critical' : value >= 50 ? 'badge-moderate' : 'badge-safe'}`}>
                {label}
            </span>
        </div>
    );
}

/* ─── Expandable Driver Tile ─────────────────────────────────── */
function DriverTile({ driver }) {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const statusMap = {
        safe: { cls: 'badge-safe', icon: '🟢', label: 'Safe' },
        moderate: { cls: 'badge-moderate', icon: '🟡', label: 'At Risk' },
        critical: { cls: 'badge-critical', icon: '🔴', label: 'Critical' },
    };
    const s = statusMap[driver.status];

    return (
        <div
            className={`driver-tile driver-tile--${driver.status} ${expanded ? 'expanded' : ''}`}
            onClick={() => setExpanded(v => !v)}
            style={{ cursor: 'pointer' }}
        >
            <div className="driver-tile-top">
                <div className="driver-avatar">{driver.name.charAt(0)}</div>
                <div>
                    <p className="driver-name">{driver.name}</p>
                    <p className="driver-id">{driver.id}</p>
                </div>
                <span className={`badge ${s.cls}`}>{s.icon} {s.label}</span>
                <span className="tile-expand-icon">{expanded ? '▲' : '▼'}</span>
            </div>
            <div className="driver-tile-meta">
                <span>📍 {driver.route}</span>
                <span>⚡ {driver.speed} km/h</span>
                <span className="driver-score">Score: <b>{driver.score}</b></span>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="driver-tile-expanded">
                    <div className="dte-row">
                        <div className="dte-item">
                            <span className="dte-label">Shift</span>
                            <span className="dte-val">{driver.shift}</span>
                        </div>
                        <div className="dte-item">
                            <span className="dte-label">Total Trips</span>
                            <span className="dte-val">{driver.trips}</span>
                        </div>
                        <div className="dte-item">
                            <span className="dte-label">Today's Incident</span>
                            <span className="dte-val" style={{ color: driver.incident === 'None today' ? 'var(--green)' : 'var(--amber)' }}>
                                {driver.incident}
                            </span>
                        </div>
                    </div>
                    <div className="dte-actions">
                        <button
                            className="btn btn-ghost"
                            style={{ fontSize: 11 }}
                            onClick={e => { e.stopPropagation(); navigate('/drivers', { state: { driverId: driver.id } }); }}
                        >
                            📋 View Profile
                        </button>
                        {driver.status === 'critical' && (
                            <button className="btn btn-amber" style={{ fontSize: 11 }} onClick={e => e.stopPropagation()}>
                                ⚠ Intervene Now
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function CommandCenter() {
    const [pulseData, setPulseData] = useState(INITIAL_PULSE);
    const [fleetRisk] = useState(54);

    useEffect(() => {
        const id = setInterval(() => setPulseData(prev => generatePulseData(prev)), 2500);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="command-center">

            {/* ── Fleet Summary Bar ── */}
            <FleetSummaryBar drivers={DRIVER_TILES} />

            {/* ── Row 1: KPI Bar ── */}
            <div className="kpi-bar grid-4">
                <div className="card card-sm stat-card">
                    <span className="stat-label">Total Fleet Vehicles</span>
                    <span className="stat-value" style={{ color: 'var(--teal)' }}>10</span>
                    <span className="stat-delta delta-neu">6 active · 4 idle</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">🟢 Safe Drivers</span>
                    <span className="stat-value" style={{ color: 'var(--green)' }}>3</span>
                    <span className="stat-delta delta-up">↑ Driving normally</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">🟡 At Risk</span>
                    <span className="stat-value" style={{ color: 'var(--amber)' }}>2</span>
                    <span className="stat-delta delta-down">↓ Monitor needed</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">🔴 Critical</span>
                    <span className="stat-value" style={{ color: 'var(--red)' }}>1</span>
                    <span className="stat-delta delta-down">⚠ Intervene now</span>
                </div>
            </div>

            {/* ── Row 2: Gauge + Pulse ── */}
            <div className="grid-2">
                <div className="card gauge-card">
                    <p className="section-title">Fleet Risk Index</p>
                    <div className="gauge-row">
                        <RiskIndexGauge value={fleetRisk} />
                        <div className="gauge-legend">
                            <LegendRow color="var(--green)" label="Healthy" range="0–49" />
                            <LegendRow color="var(--amber)" label="Moderate" range="50–69" />
                            <LegendRow color="var(--red)" label="High Risk" range="70–100" />
                            <div className="divider" />
                            <p className="gauge-note">Weighted across all active drivers. Updated every 30 s.</p>
                        </div>
                    </div>
                </div>

                <div className="card pulse-card">
                    <div className="pulse-header">
                        <p className="section-title">Risk Pulse — Live</p>
                        <span className="live-badge"><span className="pulse-dot" /> Live</span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={pulseData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                            <defs>
                                <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="t" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                                labelStyle={{ color: 'var(--text-muted)' }}
                                itemStyle={{ color: 'var(--teal)' }}
                            />
                            <Area
                                type="monotone" dataKey="risk"
                                stroke="var(--teal)" strokeWidth={2}
                                fill="url(#pulseGrad)" dot={false}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <p className="pulse-caption">Fleet risk index over the last ~35 seconds</p>
                </div>
            </div>

            {/* ── Row 3: Live Driver Tiles ── */}
            <div className="card">
                <div className="section-header">
                    <p className="section-title">Live Driver Status <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— click a tile to expand</span></p>
                    <span className="live-badge"><span className="pulse-dot" /> 6 on road</span>
                </div>
                <div className="drivers-grid">
                    {DRIVER_TILES.map(d => <DriverTile key={d.id} driver={d} />)}
                </div>
            </div>

            {/* ── Row 4: High-risk trips ── */}
            <div className="card">
                <p className="section-title">⚠ High-Risk Trips — Right Now</p>
                <div className="risk-trips-list">
                    {HIGH_RISK_TRIPS.map((t, i) => (
                        <div key={i} className={`risk-trip risk-trip--${t.risk.toLowerCase()}`}>
                            <div className="risk-trip-left">
                                <span className={`badge ${t.risk === 'Critical' ? 'badge-critical' : 'badge-moderate'}`}>{t.risk}</span>
                                <div>
                                    <p className="rt-driver">{t.driver}</p>
                                    <p className="rt-route">{t.route}</p>
                                </div>
                            </div>
                            <div className="risk-trip-right">
                                <p className="rt-event">{t.event}</p>
                                <p className="rt-time">{t.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

function LegendRow({ color, label, range }) {
    return (
        <div className="legend-row">
            <span className="legend-dot" style={{ background: color }} />
            <span className="legend-label">{label}</span>
            <span className="legend-range">{range}</span>
        </div>
    );
}
