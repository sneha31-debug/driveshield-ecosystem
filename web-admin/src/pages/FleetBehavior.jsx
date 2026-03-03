import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Cell, Legend
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
    { behavior: 'Rapid Acceleration', incidents: 12, color: 'var(--amber)' },
    { behavior: 'Tailgating', incidents: 9, color: 'var(--red)' },
    { behavior: 'Sharp Cornering', incidents: 7, color: 'var(--amber)' },
    { behavior: 'Low Fuel Ignored', incidents: 4, color: 'var(--blue)' },
];

const VEHICLE_DATA = [
    { type: 'Heavy Truck', risk: 72 },
    { type: 'Light Van', risk: 55 },
    { type: 'SUV', risk: 48 },
    { type: 'Motorbike', risk: 66 },
    { type: 'Sedan', risk: 38 },
];

const SHIFT_DATA = [
    { shift: 'Morning (6-12)', safe: 78, risk: 22 },
    { shift: 'Afternoon (12-6)', safe: 70, risk: 30 },
    { shift: 'Evening (6-10)', safe: 58, risk: 42 },
    { shift: 'Night (10-6)', safe: 40, risk: 60 },
];

const BEFORE_AFTER = [
    { metric: 'Over-speeding', before: 62, after: 31 },
    { metric: 'Harsh Braking', before: 44, after: 18 },
    { metric: 'Fatigue Events', before: 38, after: 14 },
    { metric: 'Route Deviation', before: 20, after: 8 },
];

const ROUTE_DATA = [
    { route: 'NH-48', risk: 68 },
    { route: 'Outer Ring', risk: 74 },
    { route: 'BRTS Ahd.', risk: 55 },
    { route: 'SH-1 Pune', risk: 42 },
    { route: 'Hosur Rd.', risk: 38 },
];

export default function FleetBehavior() {
    const [tab, setTab] = useState('vehicle');

    const breakdownData =
        tab === 'vehicle' ? VEHICLE_DATA.map(d => ({ label: d.type, value: d.risk })) :
            tab === 'route' ? ROUTE_DATA.map(d => ({ label: d.route, value: d.risk })) :
                SHIFT_DATA.map(d => ({ label: d.shift, value: d.risk }));

    return (
        <div className="fleet-behavior-page">
            {/* KPI */}
            <div className="grid-4">
                <div className="card card-sm stat-card">
                    <span className="stat-label">Total Incidents This Week</span>
                    <span className="stat-value" style={{ color: 'var(--red)' }}>197</span>
                    <span className="stat-delta delta-down">↑ 8% vs last week</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Most Risky Shift</span>
                    <span className="stat-value" style={{ color: 'var(--amber)', fontSize: 20 }}>Night</span>
                    <span className="stat-delta delta-down">60% risk rate</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Riskiest Vehicle Type</span>
                    <span className="stat-value" style={{ color: 'var(--amber)', fontSize: 20 }}>Trucks</span>
                    <span className="stat-delta delta-down">72 avg risk score</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Post-Coaching Improvement</span>
                    <span className="stat-value" style={{ color: 'var(--green)' }}>−47%</span>
                    <span className="stat-delta delta-up">↑ incidents reduced</span>
                </div>
            </div>

            {/* Top behaviors chart */}
            <div className="card">
                <p className="section-title">Top 10 Risky Behaviors — Fleet Wide</p>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={TOP_BEHAVIORS} layout="vertical" margin={{ top: 0, right: 12, left: 80, bottom: 0 }}>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis dataKey="behavior" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                        <Bar dataKey="incidents" radius={[0, 4, 4, 0]} name="Incidents">
                            {TOP_BEHAVIORS.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Breakdown + Before/After */}
            <div className="grid-2">
                <div className="card">
                    <div className="breakdown-header">
                        <p className="section-title">Risk Breakdown By</p>
                        <div className="tab-group">
                            {['vehicle', 'route', 'shift'].map(t => (
                                <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="breakdown-bars">
                        {breakdownData.map((d, i) => (
                            <div key={i} className="breakdown-row">
                                <span className="bd-label">{d.label}</span>
                                <div className="bd-bar-track">
                                    <div
                                        className="bd-bar-fill"
                                        style={{
                                            width: `${d.value}%`,
                                            background: d.value >= 65 ? 'var(--red)' : d.value >= 50 ? 'var(--amber)' : 'var(--green)'
                                        }}
                                    />
                                </div>
                                <span className="bd-value">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <p className="section-title">📊 Before vs After Coaching</p>
                    <p className="coaching-note">Showing improvement post-intervention across 6 coached drivers</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={BEFORE_AFTER} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="before" name="Before Coaching" fill="var(--red)" radius={[3, 3, 0, 0]} opacity={0.8} />
                            <Bar dataKey="after" name="After Coaching" fill="var(--green)" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
