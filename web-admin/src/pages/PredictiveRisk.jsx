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
        noAction: Math.round(42 + i * 4 + Math.sin(i) * 6),
        withCoaching: Math.round(42 + i * 1.2 + Math.sin(i) * 3),
        low: Math.round(38 + i * 3 + Math.sin(i) * 4),
        high: Math.round(46 + i * 5 + Math.sin(i) * 8),
    }));
}

function gen30Days() {
    return Array.from({ length: 30 }, (_, i) => ({
        day: `D${i + 1}`,
        noAction: Math.round(38 + i * 1.4 + Math.sin(i * 0.4) * 10),
        withCoaching: Math.round(38 - i * 0.3 + Math.sin(i * 0.4) * 4),
        low: Math.round(32 + i * 1.0 + Math.sin(i * 0.4) * 7),
        high: Math.round(44 + i * 1.8 + Math.sin(i * 0.4) * 13),
    }));
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tt">
            <p className="tt-label">{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color, margin: '2px 0', fontSize: 11 }}>
                    {p.name}: <b>{p.value}%</b>
                </p>
            ))}
        </div>
    );
};

export default function PredictiveRisk() {
    const [range, setRange] = useState('7');
    const data = useMemo(() => range === '7' ? gen7Days() : gen30Days(), [range]);

    const last = data[data.length - 1];
    const reduction = last.noAction - last.withCoaching;

    return (
        <div className="predictive-risk-page">
            {/* KPI row */}
            <div className="grid-4">
                <div className="card card-sm stat-card">
                    <span className="stat-label">Accident Probability (No Action)</span>
                    <span className="stat-value" style={{ color: 'var(--red)' }}>{last.noAction}%</span>
                    <span className="stat-delta delta-down">↑ Rising trajectory</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">With Coaching Intervention</span>
                    <span className="stat-value" style={{ color: 'var(--green)' }}>{last.withCoaching}%</span>
                    <span className="stat-delta delta-up">↓ Projected reduction</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Risk Reduction Potential</span>
                    <span className="stat-value" style={{ color: 'var(--teal)' }}>{reduction}pp</span>
                    <span className="stat-delta delta-up">with active coaching</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Insurance Exposure</span>
                    <span className="stat-value" style={{ color: 'var(--amber)' }}>₹2.4L</span>
                    <span className="stat-delta delta-down">↑ 12% vs last month</span>
                </div>
            </div>

            {/* Main forecast chart */}
            <div className="card">
                <div className="chart-header">
                    <div>
                        <p className="section-title">Accident Probability Forecast</p>
                        <p className="chart-sub">Confidence-band projections — no fear, just data.</p>
                    </div>
                    <div className="tab-group">
                        <button className={`tab-btn${range === '7' ? ' active' : ''}`} onClick={() => setRange('7')}>7 Days</button>
                        <button className={`tab-btn${range === '30' ? ' active' : ''}`} onClick={() => setRange('30')}>30 Days</button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="noActionGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--red)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="var(--red)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="coachGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--green)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.08} />
                                <stop offset="95%" stopColor="var(--amber)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                        {/* Confidence band */}
                        <Area type="monotone" dataKey="high" stroke="none" fill="url(#bandGrad)" name="Upper bound" legendType="none" />
                        <Area type="monotone" dataKey="low" stroke="none" fill="var(--bg-deep)" name="Lower bound" legendType="none" />
                        {/* Main lines */}
                        <Area type="monotone" dataKey="noAction" stroke="var(--red)" strokeWidth={2.5} fill="url(#noActionGrad)" name="No Intervention" dot={false} />
                        <Area type="monotone" dataKey="withCoaching" stroke="var(--green)" strokeWidth={2.5} fill="url(#coachGrad)" name="With Coaching" dot={false} />
                        <ReferenceLine y={70} stroke="var(--red)" strokeDasharray="4 2" label={{ value: 'High Risk Threshold', fill: 'var(--red)', fontSize: 10 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Exposure + recommendations */}
            <div className="grid-2">
                <div className="card">
                    <p className="section-title">Forecasted Insurance Exposure</p>
                    <div className="exposure-bars">
                        {[
                            { label: 'Current Week', val: 68, amount: '₹58,000' },
                            { label: 'Next Week', val: 74, amount: '₹72,000' },
                            { label: 'Next Month', val: 82, amount: '₹2,40,000' },
                        ].map(e => (
                            <div key={e.label} className="exposure-row">
                                <span className="exp-label">{e.label}</span>
                                <div className="exp-bar-wrap">
                                    <div className="exp-bar-track">
                                        <div className="exp-bar-fill" style={{ width: `${e.val}%`, background: e.val > 75 ? 'var(--red)' : 'var(--amber)' }} />
                                    </div>
                                </div>
                                <span className="exp-amount">{e.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card">
                    <p className="section-title">🎯 AI-Recommended Interventions</p>
                    <div className="interventions">
                        {[
                            { priority: 'Critical', action: 'Mandatory rest break for Karan Mehta after 4h driving', impact: '−18% risk' },
                            { priority: 'High', action: 'Speed coaching session for D002, D005 this week', impact: '−12% risk' },
                            { priority: 'Medium', action: 'Late-night route reassignment for 3 drivers', impact: '−8% risk' },
                        ].map((r, i) => (
                            <div key={i} className="intervention-row">
                                <span className={`badge ${r.priority === 'Critical' ? 'badge-critical' : r.priority === 'High' ? 'badge-moderate' : 'badge-info'}`}>{r.priority}</span>
                                <p className="intervention-action">{r.action}</p>
                                <span className="intervention-impact">{r.impact}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
