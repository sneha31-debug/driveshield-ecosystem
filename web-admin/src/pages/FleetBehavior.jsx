import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Cell, Legend, RadarChart, PolarGrid,
    PolarAngleAxis, Radar
} from 'recharts';
import './FleetBehavior.css';

/* ─── Data ───────────────────────────────────────────────────── */
const TOP_BEHAVIORS = [
    { behavior: 'Over-speeding', incidents: 48, color: 'var(--red)' },
    { behavior: 'Harsh Braking', incidents: 35, color: 'var(--amber)' },
    { behavior: 'Cont. Driving 4h+', incidents: 28, color: 'var(--amber)' },
    { behavior: 'Late-Night Driving', incidents: 22, color: 'var(--blue)' },
    { behavior: 'Phone Usage', incidents: 18, color: 'var(--red)' },
    { behavior: 'Route Deviation', incidents: 14, color: 'var(--teal)' },
    { behavior: 'Rapid Accel.', incidents: 12, color: 'var(--amber)' },
    { behavior: 'Tailgating', incidents: 9, color: 'var(--red)' },
    { behavior: 'Sharp Cornering', incidents: 7, color: 'var(--amber)' },
    { behavior: 'Low Fuel Ignored', incidents: 4, color: 'var(--blue)' },
];

// Stacked bar — safe vs risk per shift
const SHIFT_DATA = [
    { shift: 'Morning (6–12)', safe: 78, risk: 22 },
    { shift: 'Afternoon (12–6)', safe: 70, risk: 30 },
    { shift: 'Evening (6–10)', safe: 58, risk: 42 },
    { shift: 'Night (10–6)', safe: 40, risk: 60 },
];

const VEHICLE_DATA = [
    { type: 'Heavy Truck', risk: 72 },
    { type: 'Light Van', risk: 55 },
    { type: 'SUV', risk: 48 },
    { type: 'Motorbike', risk: 66 },
    { type: 'Sedan', risk: 38 },
];

// Route risk table data
const ROUTE_DATA = [
    { route: 'Outer Ring Rd', zone: 'Thane', risk: 74, incidents: 18, trend: 'up' },
    { route: 'NH-48', zone: 'Gurgaon', risk: 68, incidents: 14, trend: 'up' },
    { route: 'BRTS Corridor', zone: 'Ahmedabad', risk: 55, incidents: 10, trend: 'neu' },
    { route: 'Ring Road', zone: 'Noida', risk: 49, incidents: 8, trend: 'down' },
    { route: 'SH-1', zone: 'Pune', risk: 42, incidents: 5, trend: 'down' },
    { route: 'Hosur Road', zone: 'Bengaluru', risk: 38, incidents: 4, trend: 'down' },
];

const BEFORE_AFTER = [
    { metric: 'Over-speeding', before: 62, after: 31 },
    { metric: 'Harsh Braking', before: 44, after: 18 },
    { metric: 'Fatigue Events', before: 38, after: 14 },
    { metric: 'Route Dev.', before: 20, after: 8 },
];

// Fleet-wide radar for overall health
const RADAR_DATA = [
    { metric: 'Speed', score: 62 },
    { metric: 'Braking', score: 71 },
    { metric: 'Fatigue', score: 55 },
    { metric: 'Consistency', score: 74 },
    { metric: 'Alertness', score: 68 },
    { metric: 'Night Risk', score: 40 },
];

const TREND_ICON = { up: { icon: '↑', cls: 'delta-down' }, down: { icon: '↓', cls: 'delta-up' }, neu: { icon: '→', cls: 'delta-neu' } };

export default function FleetBehavior() {
    const [tab, setTab] = useState('shift');

    return (
        <div className="fleet-behavior-page">

            {/* KPI Bar */}
            <div className="grid-4">
                <div className="card card-sm stat-card">
                    <span className="stat-label">Total Incidents This Week</span>
                    <span className="stat-value" style={{ color: 'var(--red)' }}>197</span>
                    <span className="stat-delta delta-down">↑ 8% vs last week</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Riskiest Shift</span>
                    <span className="stat-value" style={{ color: 'var(--amber)', fontSize: 20 }}>Night</span>
                    <span className="stat-delta delta-down">60% risk rate</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Riskiest Vehicle</span>
                    <span className="stat-value" style={{ color: 'var(--amber)', fontSize: 20 }}>Trucks</span>
                    <span className="stat-delta delta-down">Risk score 72</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Post-Coaching Improvement</span>
                    <span className="stat-value" style={{ color: 'var(--green)' }}>−47%</span>
                    <span className="stat-delta delta-up">Incidents reduced</span>
                </div>
            </div>

            {/* Top behaviors + Fleet Radar */}
            <div className="grid-2">
                <div className="card">
                    <p className="section-title">Top 10 Risky Behaviors — Fleet Wide</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={TOP_BEHAVIORS} layout="vertical" margin={{ top: 0, right: 12, left: 85, bottom: 0 }}>
                            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <YAxis dataKey="behavior" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} width={88} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                            <Bar dataKey="incidents" radius={[0, 4, 4, 0]} name="Incidents">
                                {TOP_BEHAVIORS.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <p className="section-title">Fleet Health Radar</p>
                    <p className="section-sub">Overall behavioral health across all drivers</p>
                    <ResponsiveContainer width="100%" height={260}>
                        <RadarChart data={RADAR_DATA}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                            <Radar dataKey="score" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.18} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Breakdown Tabs */}
            <div className="card">
                <div className="breakdown-header">
                    <p className="section-title">Risk Breakdown By</p>
                    <div className="tab-group">
                        {['shift', 'vehicle', 'route'].map(t => (
                            <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                                {t === 'shift' ? '⏰ Shift' : t === 'vehicle' ? '🚗 Vehicle' : '🗺 Route'}
                            </button>
                        ))}
                    </div>
                </div>

                {tab === 'shift' && (
                    <>
                        <p className="section-sub" style={{ marginBottom: 12 }}>Stacked Safe vs At-Risk trips by shift timing</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={SHIFT_DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="shift" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} unit="%" />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="safe" name="Safe Trips" stackId="a" fill="var(--green)" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="risk" name="At-Risk Trips" stackId="a" fill="var(--red)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </>
                )}

                {tab === 'vehicle' && (
                    <div className="breakdown-bars" style={{ marginTop: 8 }}>
                        {VEHICLE_DATA.map((d, i) => (
                            <div key={i} className="breakdown-row">
                                <span className="bd-label">{d.type}</span>
                                <div className="bd-bar-track">
                                    <div className="bd-bar-fill" style={{
                                        width: `${d.risk}%`,
                                        background: d.risk >= 65 ? 'var(--red)' : d.risk >= 50 ? 'var(--amber)' : 'var(--green)'
                                    }} />
                                </div>
                                <span className="bd-value">{d.risk}</span>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'route' && (
                    <div className="route-table">
                        <div className="route-table-head">
                            <span>Route</span><span>Zone</span><span>Risk Score</span><span>Incidents</span><span>Trend</span>
                        </div>
                        {ROUTE_DATA.map((r, i) => {
                            const t = TREND_ICON[r.trend];
                            return (
                                <div key={i} className="route-table-row">
                                    <span className="rt-route">{r.route}</span>
                                    <span className="rt-zone">{r.zone}</span>
                                    <span className="rt-risk" style={{ color: r.risk >= 65 ? 'var(--red)' : r.risk >= 50 ? 'var(--amber)' : 'var(--green)' }}>
                                        {r.risk}
                                    </span>
                                    <span className="rt-inc">{r.incidents}</span>
                                    <span className={`rt-trend ${t.cls}`}>{t.icon}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Before / After Coaching */}
            <div className="card">
                <p className="section-title">📊 Before vs After Coaching — Improvement Visualization</p>
                <p className="section-sub">6 drivers underwent targeted coaching sessions this week</p>
                <div className="grid-2" style={{ marginTop: 16 }}>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={BEFORE_AFTER} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="before" name="Before Coaching" fill="var(--red)" radius={[3, 3, 0, 0]} opacity={0.85} />
                            <Bar dataKey="after" name="After Coaching" fill="var(--green)" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Improvement summary cards */}
                    <div className="improvement-cards">
                        {BEFORE_AFTER.map((r, i) => {
                            const pct = Math.round(((r.before - r.after) / r.before) * 100);
                            return (
                                <div key={i} className="imp-card">
                                    <span className="imp-metric">{r.metric}</span>
                                    <div className="imp-values">
                                        <span className="imp-before">{r.before}</span>
                                        <span className="imp-arrow">→</span>
                                        <span className="imp-after">{r.after}</span>
                                    </div>
                                    <span className="imp-pct">−{pct}% ✓</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>
    );
}
