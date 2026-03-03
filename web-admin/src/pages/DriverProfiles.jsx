import { useState } from 'react';
import {
    RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import './DriverProfiles.css';

const DRIVERS = [
    {
        id: 'D001', name: 'Ravi Sharma', score: 94, status: 'safe',
        insight: 'Consistently safe across all routes. Minor fatigue risk on Friday evenings.',
        confidence: 91,
        dna: { speed: 88, braking: 92, fatigue: 76, consistency: 95, alertness: 90 },
        trend: { speed: 'up', braking: 'up', fatigue: 'down', consistency: 'neu', alertness: 'up' },
        trips: 142, weeklyRisk: [20, 18, 22, 17, 24, 19, 21],
        vehicle: 'DL-01-AB-1234', shift: 'Morning', hoursToday: '4.5h',
    },
    {
        id: 'D002', name: 'Priya Nair', score: 71, status: 'moderate',
        insight: 'Risk spikes after 5 continuous driving hours. Braking pattern deteriorates in evening peak.',
        confidence: 68,
        dna: { speed: 74, braking: 61, fatigue: 58, consistency: 72, alertness: 68 },
        trend: { speed: 'neu', braking: 'down', fatigue: 'down', consistency: 'up', alertness: 'neu' },
        trips: 98, weeklyRisk: [48, 52, 45, 61, 58, 55, 62],
        vehicle: 'KA-05-CD-7890', shift: 'Evening', hoursToday: '3.2h',
    },
    {
        id: 'D003', name: 'Karan Mehta', score: 43, status: 'critical',
        insight: 'High over-speed frequency. Risk spikes after 6 continuous driving hours. Immediate coaching recommended.',
        confidence: 38,
        dna: { speed: 28, braking: 42, fatigue: 35, consistency: 40, alertness: 45 },
        trend: { speed: 'down', braking: 'down', fatigue: 'down', consistency: 'down', alertness: 'neu' },
        trips: 67, weeklyRisk: [72, 68, 78, 82, 75, 85, 90],
        vehicle: 'MH-12-EF-3456', shift: 'Night', hoursToday: '6.1h',
    },
    {
        id: 'D004', name: 'Anjali Singh', score: 88, status: 'safe',
        insight: 'Strong compliance on speed limits. Slight fatigue risk on long-haul Pune routes.',
        confidence: 85,
        dna: { speed: 90, braking: 86, fatigue: 80, consistency: 88, alertness: 92 },
        trend: { speed: 'up', braking: 'neu', fatigue: 'up', consistency: 'up', alertness: 'up' },
        trips: 113, weeklyRisk: [28, 25, 30, 27, 22, 26, 24],
        vehicle: 'MH-14-IJ-5678', shift: 'Morning', hoursToday: '5.0h',
    },
    {
        id: 'D005', name: 'Deepak Rao', score: 65, status: 'moderate',
        insight: 'Continuous driving without breaks exceeding 4 hours twice this week.',
        confidence: 62,
        dna: { speed: 70, braking: 68, fatigue: 45, consistency: 64, alertness: 60 },
        trend: { speed: 'neu', braking: 'up', fatigue: 'down', consistency: 'neu', alertness: 'neu' },
        trips: 89, weeklyRisk: [50, 55, 48, 60, 52, 58, 55],
        vehicle: 'GJ-01-GH-2345', shift: 'Afternoon', hoursToday: '4.8h',
    },
    {
        id: 'D006', name: 'Meena Patel', score: 91, status: 'safe',
        insight: 'Excellent all-round driver. Top performer in fleet this month.',
        confidence: 93,
        dna: { speed: 93, braking: 90, fatigue: 88, consistency: 96, alertness: 94 },
        trend: { speed: 'up', braking: 'up', fatigue: 'up', consistency: 'up', alertness: 'up' },
        trips: 157, weeklyRisk: [15, 18, 14, 16, 13, 17, 12],
        vehicle: 'KA-09-KL-9012', shift: 'Morning', hoursToday: '3.8h',
    },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STATUS_CLS = { safe: 'badge-safe', moderate: 'badge-moderate', critical: 'badge-critical' };
const TREND_ARROW = {
    up: { arrow: '↑', cls: 'delta-up' },
    down: { arrow: '↓', cls: 'delta-down' },
    neu: { arrow: '→', cls: 'delta-neu' },
};
const DNA_KEYS = ['speed', 'braking', 'fatigue', 'consistency', 'alertness'];
const DNA_LABELS = { speed: 'Speed Control', braking: 'Braking Pattern', fatigue: 'Fatigue Risk', consistency: 'Consistency', alertness: 'Alertness' };

/* Mini inline SVG sparkline for the list panel */
function Sparkline({ data, color }) {
    const W = 60, H = 24, pad = 2;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (W - pad * 2);
        const y = H - pad - ((v - min) / range) * (H - pad * 2);
        return `${x},${y}`;
    });
    return (
        <svg width={W} height={H} style={{ flexShrink: 0 }}>
            <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

export default function DriverProfiles() {
    const [selected, setSelected] = useState(DRIVERS[0]);
    const [search, setSearch] = useState('');

    const filtered = DRIVERS.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.id.toLowerCase().includes(search.toLowerCase())
    );

    const radarData = DNA_KEYS.map(k => ({ subject: DNA_LABELS[k], value: selected.dna[k] }));
    const weeklyData = selected.weeklyRisk.map((v, i) => ({ day: DAYS[i], risk: v }));
    const barColor = selected.score >= 80 ? 'var(--green)' : selected.score >= 60 ? 'var(--amber)' : 'var(--red)';
    const sparkColor = s => s === 'safe' ? 'var(--green)' : s === 'moderate' ? 'var(--amber)' : 'var(--red)';

    return (
        <div className="driver-profiles-page">
            {/* Left: Driver List */}
            <div className="driver-list-panel card">
                {/* Fleet stats strip — matches reference topbar */}
                <div className="dp-fleet-stats">
                    {[
                        { label: 'Driving', value: 6, color: 'var(--teal-light)' },
                        { label: 'At Risk', value: 2, color: 'var(--amber)' },
                        { label: 'Critical', value: 1, color: 'var(--red)' },
                        { label: 'Safe', value: 3, color: 'var(--green)' },
                        { label: 'Idle', value: 4, color: 'var(--text-muted)' },
                    ].map(s => (
                        <div key={s.label} className="dp-fleet-stat">
                            <span className="dp-fs-val" style={{ color: s.color }}>{s.value}</span>
                            <span className="dp-fs-lbl">{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="list-search-wrap">
                    <input
                        className="list-search"
                        placeholder="🔍  Search driver or ID…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="driver-list">
                    {filtered.map(d => (
                        <button
                            key={d.id}
                            className={`driver-list-item${selected.id === d.id ? ' active' : ''}`}
                            onClick={() => setSelected(d)}
                        >
                            <div className="dli-avatar">{d.name.charAt(0)}</div>
                            <div className="dli-info">
                                <p className="dli-name">{d.name}</p>
                                <p className="dli-id">{d.id} · {d.shift}</p>
                            </div>
                            <div className="dli-right">
                                <Sparkline data={d.weeklyRisk} color={sparkColor(d.status)} />
                                <span className={`badge ${STATUS_CLS[d.status]}`}>{d.score}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Profile Detail */}
            <div className="driver-detail-panel">
                {/* Header card */}
                <div className="card driver-detail-header">
                    <div className="ddh-left">
                        <div className="ddh-avatar">{selected.name.charAt(0)}</div>
                        <div>
                            <h2 className="ddh-name">{selected.name}</h2>
                            <p className="ddh-id">{selected.id} · {selected.vehicle}</p>
                            <span className={`badge ${STATUS_CLS[selected.status]}`}>
                                {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div className="ddh-stats">
                        <div className="stat-card">
                            <span className="stat-label">Safety Score</span>
                            <span className="stat-value" style={{ color: barColor }}>{selected.score}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Total Trips</span>
                            <span className="stat-value">{selected.trips}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Hours Today</span>
                            <span className="stat-value" style={{ color: 'var(--amber)' }}>{selected.hoursToday}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Confidence</span>
                            <span className="stat-value" style={{ color: 'var(--teal)' }}>{selected.confidence}%</span>
                        </div>
                    </div>
                </div>

                <div className="grid-2">
                    {/* Risk DNA Radar */}
                    <div className="card">
                        <p className="section-title">Risk DNA</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                <Radar dataKey="value" stroke={barColor} fill={barColor} fillOpacity={0.18} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Weekly Risk Trend */}
                    <div className="card">
                        <p className="section-title">Weekly Risk Score Trend</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                                <Line type="monotone" dataKey="risk" stroke={barColor} strokeWidth={2.5} dot={{ fill: barColor, r: 3 }} name="Risk Score" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Metric Trends */}
                <div className="card">
                    <p className="section-title">Metric Trends</p>
                    <div className="dna-metrics">
                        {DNA_KEYS.map(k => {
                            const t = TREND_ARROW[selected.trend[k]];
                            return (
                                <div key={k} className="dna-row">
                                    <span className="dna-label">{DNA_LABELS[k]}</span>
                                    <div className="dna-bar-wrap">
                                        <div className="dna-bar-track">
                                            <div
                                                className="dna-bar-fill"
                                                style={{
                                                    width: `${selected.dna[k]}%`,
                                                    background: selected.dna[k] >= 70 ? 'var(--green)' : selected.dna[k] >= 50 ? 'var(--amber)' : 'var(--red)'
                                                }}
                                            />
                                        </div>
                                        <span className="dna-value">{selected.dna[k]}</span>
                                    </div>
                                    <span className={`dna-trend ${t.cls}`}>{t.arrow}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Confidence Meter + AI Insight */}
                <div className="grid-2">
                    <div className="card">
                        <p className="section-title">Driver Confidence Meter</p>
                        <p className="confidence-note">Used for insurance & compliance discussions</p>
                        <div className="confidence-track">
                            <div
                                className="confidence-fill"
                                style={{
                                    width: `${selected.confidence}%`,
                                    background: selected.confidence >= 75
                                        ? 'linear-gradient(90deg, var(--teal), var(--green))'
                                        : selected.confidence >= 50
                                            ? 'linear-gradient(90deg, var(--amber), #f97316)'
                                            : 'linear-gradient(90deg, var(--red), #dc2626)'
                                }}
                            />
                        </div>
                        <div className="confidence-labels">
                            <span>Low Risk</span>
                            <span className="confidence-value">{selected.confidence}/100</span>
                            <span>High Confidence</span>
                        </div>
                    </div>
                    <div className="card ai-insight-card">
                        <p className="section-title">🤖 AI Insight</p>
                        <blockquote className="ai-quote">"{selected.insight}"</blockquote>
                    </div>
                </div>
            </div>
        </div>
    );
}
