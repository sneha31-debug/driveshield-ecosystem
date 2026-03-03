import { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, ReferenceLine, Legend
} from 'recharts';
import './PredictiveRisk.css';

/* ─── Data generators ────────────────────────────────────────── */
function gen7Days() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d, i) => ({
        day: d,
        noAction: Math.round(28 + i * 4.5 + Math.sin(i) * 4),
        withCoaching: Math.round(28 - i * 0.8 + Math.sin(i) * 2),
        upper: Math.round(32 + i * 5.5 + Math.sin(i) * 5),
        lower: Math.round(24 + i * 3.5 + Math.sin(i) * 3),
    }));
}

function gen30Days() {
    return Array.from({ length: 30 }, (_, i) => ({
        day: `D${i + 1}`,
        noAction: Math.round(25 + i * 1.6 + Math.sin(i * 0.4) * 6),
        withCoaching: Math.round(25 - i * 0.4 + Math.sin(i * 0.4) * 3),
        upper: Math.round(29 + i * 2.1 + Math.sin(i * 0.4) * 7),
        lower: Math.round(21 + i * 1.1 + Math.sin(i * 0.4) * 4),
    }));
}

/* ─── Intervention drivers — matches reference bottom panel ───── */
const INTERVENTIONS = [
    {
        name: 'David Kim', id: 'D003', risk: 52,
        action: 'Multi-day coaching',
        priority: 'Critical',
    },
    {
        name: 'Marcus Rivera', id: 'D007', risk: 44,
        action: 'Speed behaviour session',
        priority: 'High',
    },
    {
        name: 'Sara Patel', id: 'D009', risk: 38,
        action: 'Route reassignment',
        priority: 'Medium',
    },
    {
        name: 'James Wong', id: 'D011', risk: 31,
        action: 'Fatigue monitoring',
        priority: 'Medium',
    },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tt">
            <p className="tt-label">{label}</p>
            {payload.filter(p => p.name !== 'upper' && p.name !== 'lower').map(p => (
                <p key={p.name} style={{ color: p.color, margin: '2px 0', fontSize: 11 }}>
                    {p.name === 'noAction' ? 'No Intervention' : 'With Coaching'}: <b>{p.value}%</b>
                </p>
            ))}
        </div>
    );
};

export default function PredictiveRisk() {
    const [range, setRange] = useState('7');
    const [started, setStarted] = useState(new Set());
    const data = useMemo(() => range === '7' ? gen7Days() : gen30Days(), [range]);

    const last = data[data.length - 1];
    const noActionProb = last.noAction;
    const coachingProb = last.withCoaching;
    const reduction = noActionProb - coachingProb;

    return (
        <div className="predictive-risk-page">

            {/* ── KPI row — matches reference exactly ── */}
            <div className="grid-4">
                <div className="card card-sm stat-card">
                    <span className="stat-label">Accident Prob. (No Action)</span>
                    <span className="stat-value" style={{ color: 'var(--red)' }}>
                        {noActionProb}%
                    </span>
                    <span className="stat-delta delta-down">↑ Rising trajectory</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Accident Prob. (With Coaching)</span>
                    <span className="stat-value" style={{ color: 'var(--amber)' }}>
                        {coachingProb}%
                    </span>
                    <span className="stat-delta delta-neu">Without intervention</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Insurance Exposure</span>
                    <span className="stat-value" style={{ color: 'var(--amber)' }}>$42K</span>
                    <span className="stat-delta delta-down">Projected next quarter</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Risk If No Action</span>
                    <span className="stat-value" style={{ color: 'var(--red)' }}>
                        +{reduction}%
                    </span>
                    <span className="stat-delta delta-down">Total risk increase</span>
                </div>
            </div>

            {/* ── Forecast chart — smooth grey band + 2 area lines ── */}
            <div className="card">
                <div className="chart-header">
                    <div>
                        <p className="section-title">Accident Probability Forecast</p>
                        <p className="chart-sub">90% confidence bands shown. Calm data, clear decisions.</p>
                    </div>
                    <div className="tab-group">
                        <button className={`tab-btn${range === '7' ? ' active' : ''}`} onClick={() => setRange('7')}>7 Days</button>
                        <button className={`tab-btn${range === '30' ? ' active' : ''}`} onClick={() => setRange('30')}>30 Days</button>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                        <defs>
                            {/* Grey confidence band */}
                            <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(148,163,184,0.12)" />
                                <stop offset="100%" stopColor="rgba(148,163,184,0)" />
                            </linearGradient>
                            {/* No-action (red) gradient */}
                            <linearGradient id="noActGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--red)" stopOpacity={0.18} />
                                <stop offset="100%" stopColor="var(--red)" stopOpacity={0} />
                            </linearGradient>
                            {/* Coaching (green) gradient */}
                            <linearGradient id="coachGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--green)" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 80]} tickFormatter={v => `${v}%`} />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Confidence band (upper/lower as stacked) */}
                        <Area type="monotone" dataKey="upper" stroke="none" fill="url(#bandFill)" name="upper" legendType="none" />
                        <Area type="monotone" dataKey="lower" stroke="none" fill="var(--bg-deep)" name="lower" legendType="none" />

                        {/* Main forecast lines */}
                        <Area type="monotone" dataKey="noAction" stroke="var(--red)" strokeWidth={2.5} fill="url(#noActGrad)" name="No Intervention" dot={false} />
                        <Area type="monotone" dataKey="withCoaching" stroke="var(--green)" strokeWidth={2.5} fill="url(#coachGrad)" name="With Coaching" dot={false} />

                        <ReferenceLine y={60} stroke="var(--amber)" strokeDasharray="4 2"
                            label={{ value: '60% Risk Threshold', fill: 'var(--amber)', fontSize: 10, position: 'insideTopRight' }} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* ── Interventions — driver cards matching reference ── */}
            <div className="card">
                <div className="interventions-header">
                    <p className="section-title">🎯 Recommended Interventions</p>
                    <span className="badge badge-moderate">{INTERVENTIONS.length} pending</span>
                </div>
                <div className="interventions-list">
                    {INTERVENTIONS.map((d, i) => {
                        const isStarted = started.has(d.id);
                        return (
                            <div key={i} className={`intervention-card ${isStarted ? 'intervention-card--done' : ''}`}>
                                <div className="ic-left">
                                    <div className="ic-avatar">{d.name.charAt(0)}</div>
                                    <div>
                                        <p className="ic-name">{d.name}</p>
                                        <p className="ic-action">{d.action}</p>
                                    </div>
                                </div>
                                <div className="ic-right">
                                    <div className="ic-risk-wrap">
                                        <span className="ic-risk" style={{
                                            color: d.risk >= 50 ? 'var(--red)' : d.risk >= 35 ? 'var(--amber)' : 'var(--green)'
                                        }}>
                                            {d.risk}%
                                        </span>
                                        <span className="ic-risk-label">Risk</span>
                                    </div>
                                    <span className={`badge ${d.priority === 'Critical' ? 'badge-critical' : d.priority === 'High' ? 'badge-moderate' : 'badge-info'}`}>
                                        {d.priority}
                                    </span>
                                    <button
                                        className={`start-btn ${isStarted ? 'start-btn--done' : ''}`}
                                        onClick={() => setStarted(prev => new Set([...prev, d.id]))}
                                    >
                                        {isStarted ? '✓ Started' : 'Start Now'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Insurance exposure bars ── */}
            <div className="card">
                <p className="section-title">Forecasted Insurance Exposure</p>
                <div className="exposure-bars">
                    {[
                        { label: 'Current Week', val: 55, amount: '$9,200' },
                        { label: 'Next Week', val: 68, amount: '$12,800' },
                        { label: 'This Quarter', val: 82, amount: '$42,000' },
                    ].map(e => (
                        <div key={e.label} className="exposure-row">
                            <span className="exp-label">{e.label}</span>
                            <div className="exp-bar-wrap">
                                <div className="exp-bar-track">
                                    <div className="exp-bar-fill" style={{
                                        width: `${e.val}%`,
                                        background: e.val > 75 ? 'var(--red)' : 'var(--amber)'
                                    }} />
                                </div>
                            </div>
                            <span className="exp-amount">{e.amount}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
