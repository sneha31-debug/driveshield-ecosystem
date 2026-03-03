import { useState } from 'react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import './TripExplorer.css';

/* ─── Trip data with speed + braking + risk overlaid ────────── */
const TRIPS = [
    {
        id: 'T001', driver: 'Ravi Sharma', route: 'Delhi → Gurgaon',
        date: 'Mon, 3 Mar', duration: '1h 12m', distance: '42 km',
        score: 92, flag: false,
        events: [
            { time: '08:30 AM', icon: '🟢', label: 'Trip Started', loc: 'Connaught Place Parking' },
            { time: '08:42 AM', icon: '🔵', label: 'Minor brake — signal', loc: 'Regal Cinema Junction' },
            { time: '09:45 AM', icon: '🟢', label: 'Trip Ended Safely', loc: 'Cyber Hub, Gurgaon' },
        ],
        chart: [
            { t: '0m', speed: 0, braking: 0, risk: 10 },
            { t: '6m', speed: 48, braking: 0, risk: 15 },
            { t: '12m', speed: 62, braking: 5, risk: 18 },
            { t: '18m', speed: 58, braking: 0, risk: 14 },
            { t: '24m', speed: 72, braking: 0, risk: 22 },
            { t: '30m', speed: 65, braking: 8, risk: 25 },
            { t: '36m', speed: 60, braking: 0, risk: 18 },
            { t: '42m', speed: 55, braking: 0, risk: 14 },
            { t: '48m', speed: 48, braking: 0, risk: 12 },
            { t: '54m', speed: 42, braking: 0, risk: 10 },
            { t: '60m', speed: 38, braking: 0, risk: 8 },
            { t: '72m', speed: 0, braking: 0, risk: 5 },
        ],
    },
    {
        id: 'T002', driver: 'Karan Mehta', route: 'Thane → Pune',
        date: 'Mon, 3 Mar', duration: '2h 45m', distance: '148 km',
        score: 38, flag: true,
        events: [
            { time: '10:00 AM', icon: '🟢', label: 'Trip Started', loc: 'Thane West Depot' },
            { time: '10:18 AM', icon: '🔴', label: 'Over-speed 97 km/h', loc: 'NH-48 near Khopoli' },
            { time: '10:45 AM', icon: '🟡', label: 'Harsh braking ×2', loc: 'Expressway Toll — Khalapur' },
            { time: '11:14 AM', icon: '🔴', label: 'Over-speed 88 km/h', loc: 'Near Lonavala' },
            { time: '12:45 PM', icon: '🟢', label: 'Trip Ended', loc: 'Hinjewadi IT Park, Pune' },
        ],
        chart: [
            { t: '0m', speed: 0, braking: 0, risk: 10 },
            { t: '15m', speed: 55, braking: 0, risk: 28 },
            { t: '18m', speed: 97, braking: 15, risk: 88 },
            { t: '30m', speed: 82, braking: 0, risk: 55 },
            { t: '45m', speed: 75, braking: 22, risk: 70 },
            { t: '60m', speed: 70, braking: 0, risk: 45 },
            { t: '78m', speed: 88, braking: 12, risk: 80 },
            { t: '90m', speed: 72, braking: 0, risk: 50 },
            { t: '110m', speed: 55, braking: 0, risk: 30 },
            { t: '130m', speed: 48, braking: 5, risk: 22 },
            { t: '145m', speed: 35, braking: 0, risk: 15 },
            { t: '165m', speed: 0, braking: 0, risk: 5 },
        ],
    },
    {
        id: 'T003', driver: 'Priya Nair', route: 'Noida → Delhi',
        date: 'Sun, 2 Mar', duration: '55m', distance: '28 km',
        score: 71, flag: false,
        events: [
            { time: '06:15 PM', icon: '🟢', label: 'Trip Started', loc: 'Sector 62, Noida' },
            { time: '06:27 PM', icon: '🟡', label: 'Harsh braking', loc: 'DND Flyway Toll' },
            { time: '07:10 PM', icon: '🟢', label: 'Trip Ended', loc: 'Lodhi Road, Delhi' },
        ],
        chart: [
            { t: '0m', speed: 0, braking: 0, risk: 10 },
            { t: '8m', speed: 45, braking: 0, risk: 20 },
            { t: '12m', speed: 58, braking: 18, risk: 55 },
            { t: '20m', speed: 65, braking: 0, risk: 30 },
            { t: '28m', speed: 60, braking: 10, risk: 40 },
            { t: '35m', speed: 55, braking: 0, risk: 25 },
            { t: '42m', speed: 70, braking: 0, risk: 32 },
            { t: '50m', speed: 48, braking: 0, risk: 18 },
            { t: '55m', speed: 0, braking: 0, risk: 5 },
        ],
    },
    {
        id: 'T004', driver: 'Meena Patel', route: 'Bengaluru → Mysuru',
        date: 'Sat, 1 Mar', duration: '2h 5m', distance: '145 km',
        score: 96, flag: false,
        events: [
            { time: '07:00 AM', icon: '🟢', label: 'Trip Started', loc: 'Electronic City, Bengaluru' },
            { time: '09:05 AM', icon: '🟢', label: 'Arrived Safely', loc: 'Mysuru Palace Gate' },
        ],
        chart: [
            { t: '0m', speed: 0, braking: 0, risk: 5 },
            { t: '15m', speed: 60, braking: 0, risk: 12 },
            { t: '30m', speed: 80, braking: 2, risk: 15 },
            { t: '45m', speed: 85, braking: 0, risk: 14 },
            { t: '60m', speed: 82, braking: 3, risk: 13 },
            { t: '75m', speed: 78, braking: 0, risk: 12 },
            { t: '90m', speed: 80, braking: 2, risk: 13 },
            { t: '105m', speed: 65, braking: 0, risk: 10 },
            { t: '120m', speed: 40, braking: 0, risk: 7 },
            { t: '125m', speed: 0, braking: 0, risk: 5 },
        ],
    },
];

/* ─── Custom Tooltip ─────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tt">
            <p className="tt-label">@ {label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color, margin: '2px 0', fontSize: 11 }}>
                    {p.name}: <b>{p.value}{p.name === 'Speed' ? ' km/h' : p.name === 'Risk' ? '%' : 'G'}</b>
                </p>
            ))}
        </div>
    );
};

/* ─── Score color helper ─────────────────────────────────────── */
const scoreColor = s => s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--amber)' : 'var(--red)';

/* ─── Trip Detail Panel ──────────────────────────────────────── */
function TripDetail({ trip, isCompare }) {
    const sc = scoreColor(trip.score);
    const hasOverspeed = trip.chart.some(p => p.speed > 80);

    return (
        <div className={`trip-detail card ${isCompare ? 'trip-detail--compare' : ''}`}>
            {/* Header */}
            <div className="td-header">
                <div>
                    <p className="td-driver">{trip.driver}</p>
                    <p className="td-route">📍 {trip.route}</p>
                    <div className="td-meta-row">
                        <span>📅 {trip.date}</span>
                        <span>⏱ {trip.duration}</span>
                        <span>📏 {trip.distance}</span>
                    </div>
                </div>
                <div className="td-score-badge">
                    <span className="td-score" style={{ color: sc }}>{trip.score}</span>
                    <span className="td-score-label">Safety Score</span>
                </div>
            </div>

            {/* Insurance flag */}
            {trip.flag && (
                <div className="flag-banner">
                    <span>⚑ Flagged as Insurance-Relevant Trip</span>
                    <button className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: 11, padding: '4px 10px' }}
                        onClick={() => window.print()}>
                        📄 Export PDF
                    </button>
                </div>
            )}

            {/* Overlay Chart: Speed + Braking + Risk */}
            <div className="chart-section">
                <p className="section-title" style={{ marginBottom: 8 }}>
                    Speed · Braking · Risk Overlay
                </p>
                <div className="chart-legend-row">
                    <span className="cl-item"><span className="cl-line" style={{ background: 'var(--teal)' }} />Speed (km/h)</span>
                    <span className="cl-item"><span className="cl-bar" style={{ background: 'var(--amber)' }} />Braking (G)</span>
                    <span className="cl-item"><span className="cl-line" style={{ background: 'var(--red)' }} />Risk (%)</span>
                    {hasOverspeed && <span className="cl-ref">— Speed limit 80</span>}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={trip.chart} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="t" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="speed" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 110]} />
                        <YAxis yAxisId="risk" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip content={<ChartTooltip />} />
                        {hasOverspeed && (
                            <ReferenceLine yAxisId="speed" y={80} stroke="var(--red)" strokeDasharray="4 2" strokeOpacity={0.5} />
                        )}
                        <Bar yAxisId="speed" dataKey="braking" name="Braking" fill="var(--amber)" opacity={0.7} radius={[2, 2, 0, 0]} />
                        <Line yAxisId="speed" type="monotone" dataKey="speed" name="Speed" stroke="var(--teal)" strokeWidth={2} dot={false} />
                        <Line yAxisId="risk" type="monotone" dataKey="risk" name="Risk" stroke="var(--red)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Event Timeline */}
            <div className="timeline-section">
                <p className="section-title" style={{ marginBottom: 10 }}>Trip Timeline</p>
                <div className="td-timeline">
                    {trip.events.map((ev, i) => (
                        <div key={i} className="timeline-item">
                            <div className="timeline-left">
                                <span className="timeline-icon">{ev.icon}</span>
                                {i < trip.events.length - 1 && <div className="timeline-line" />}
                            </div>
                            <div className="timeline-body">
                                <div className="timeline-top-row">
                                    <span className="timeline-event">{ev.label}</span>
                                    <span className="timeline-time">{ev.time}</span>
                                </div>
                                <span className="timeline-loc">📍 {ev.loc}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function TripExplorer() {
    const [selected, setSelected] = useState(TRIPS[0]);
    const [compare, setCompare] = useState(null);
    const [search, setSearch] = useState('');

    const filtered = TRIPS.filter(t =>
        t.driver.toLowerCase().includes(search.toLowerCase()) ||
        t.route.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="trip-explorer-page">

            {/* Left: Trip List */}
            <div className="trip-list-panel card">
                <p className="section-title">Trip History</p>
                <input
                    className="trip-search"
                    placeholder="🔍  Search driver or route…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <div className="trip-list">
                    {filtered.map(t => {
                        const sc = scoreColor(t.score);
                        const isSelected = selected.id === t.id;
                        const isCompared = compare?.id === t.id;
                        return (
                            <div key={t.id} className={`trip-list-item ${isSelected ? 'active' : ''} ${isCompared ? 'compared' : ''}`}
                                onClick={() => setSelected(t)}>
                                <div className="tli-top">
                                    <span className="tli-driver">{t.driver}</span>
                                    {t.flag && <span className="flag-chip">⚑</span>}
                                    <span className="tli-score" style={{ color: sc }}>{t.score}</span>
                                </div>
                                <p className="tli-route">{t.route}</p>
                                <p className="tli-meta">{t.date} · {t.duration} · {t.distance}</p>
                                <button
                                    className={`compare-btn ${isCompared ? 'compare-btn--on' : ''}`}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setCompare(isCompared ? null : t);
                                    }}
                                >
                                    {isCompared ? '✕ Remove' : '⊞ Compare'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Detail + Compare */}
            <div className="trip-detail-area">
                <div className={compare && compare.id !== selected.id ? 'compare-grid' : ''}>
                    <TripDetail trip={selected} />
                    {compare && compare.id !== selected.id && <TripDetail trip={compare} isCompare />}
                </div>
            </div>

        </div>
    );
}
