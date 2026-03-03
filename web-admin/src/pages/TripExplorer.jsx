import { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Legend
} from 'recharts';
import './TripExplorer.css';

const TRIPS = [
    {
        id: 'T001', driver: 'Ravi Sharma', route: 'Delhi → Gurgaon', date: 'Mon, 3 Mar', duration: '1h 12m', distance: '42 km',
        score: 92, flag: false, events: ['Normal start', 'Minor brake at signal', 'Safe arrival'],
        speedData: [0, 48, 62, 58, 72, 65, 60, 55, 48, 42, 38, 0].map((v, i) => ({ t: `${i * 5}m`, speed: v, brake: v > 65 ? 1 : 0 })),
    },
    {
        id: 'T002', driver: 'Karan Mehta', route: 'Thane → Pune', date: 'Mon, 3 Mar', duration: '2h 45m', distance: '148 km',
        score: 38, flag: true, events: ['Speeding 97 km/h at 18m', 'Harsh brake ×2 at 45m', 'Over-speed 88 km/h at 78m'],
        speedData: [0, 55, 72, 88, 97, 82, 75, 70, 65, 88, 72, 55, 0].map((v, i) => ({ t: `${i * 12}m`, speed: v, brake: v > 75 ? 1 : 0 })),
    },
    {
        id: 'T003', driver: 'Priya Nair', route: 'Noida → Delhi', date: 'Sun, 2 Mar', duration: '55m', distance: '28 km',
        score: 71, flag: false, events: ['Harsh braking at 12m', 'Speed OK', 'Normal arrival'],
        speedData: [0, 45, 58, 65, 60, 55, 70, 62, 48, 35, 0].map((v, i) => ({ t: `${i * 5}m`, speed: v, brake: v > 62 ? 1 : 0 })),
    },
    {
        id: 'T004', driver: 'Meena Patel', route: 'Bengaluru → Mysuru', date: 'Sat, 1 Mar', duration: '2h 5m', distance: '145 km',
        score: 96, flag: false, events: ['Excellent journey', 'No incidents detected'],
        speedData: [0, 60, 80, 85, 82, 78, 80, 75, 70, 65, 55, 40, 0].map((v, i) => ({ t: `${i * 10}m`, speed: v, brake: 0 })),
    },
];

export default function TripExplorer() {
    const [selected, setSelected] = useState(TRIPS[0]);
    const [compare, setCompare] = useState(null);

    const scoreColor = s => s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--amber)' : 'var(--red)';

    return (
        <div className="trip-explorer-page">
            {/* Trip list */}
            <div className="trip-list-panel card">
                <p className="section-title">Trip History</p>
                <div className="trip-list">
                    {TRIPS.map(t => (
                        <div
                            key={t.id}
                            className={`trip-list-item ${selected.id === t.id ? 'active' : ''}`}
                            onClick={() => setSelected(t)}
                        >
                            <div className="tli-top">
                                <span className="tli-driver">{t.driver}</span>
                                {t.flag && <span className="badge badge-critical" style={{ fontSize: 10 }}>⚑ Insurance</span>}
                                <span className="tli-score" style={{ color: scoreColor(t.score) }}>{t.score}</span>
                            </div>
                            <p className="tli-route">{t.route}</p>
                            <div className="tli-meta">
                                <span>{t.date}</span> · <span>{t.duration}</span> · <span>{t.distance}</span>
                            </div>
                            <button
                                className="btn btn-ghost tli-compare-btn"
                                onClick={e => { e.stopPropagation(); setCompare(compare?.id === t.id ? null : t); }}
                            >
                                {compare?.id === t.id ? '✕ Remove' : '⊞ Compare'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail + Compare */}
            <div className="trip-detail-area">
                <div className={compare ? 'grid-2' : ''} style={{ display: compare ? 'grid' : 'flex', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
                    <TripDetail trip={selected} scoreColor={scoreColor} />
                    {compare && compare.id !== selected.id && <TripDetail trip={compare} scoreColor={scoreColor} isCompare />}
                </div>
            </div>
        </div>
    );
}

function TripDetail({ trip, scoreColor, isCompare }) {
    return (
        <div className={`trip-detail card ${isCompare ? 'trip-detail--compare' : ''}`}>
            <div className="td-header">
                <div>
                    <p className="td-driver">{trip.driver}</p>
                    <p className="td-route">{trip.route}</p>
                    <div className="td-meta">
                        <span>{trip.date}</span> · <span>{trip.duration}</span> · <span>{trip.distance}</span>
                    </div>
                </div>
                <div className="td-score-badge">
                    <span className="td-score" style={{ color: scoreColor(trip.score) }}>{trip.score}</span>
                    <span className="td-score-label">Score</span>
                </div>
            </div>

            {trip.flag && (
                <div className="flag-banner">
                    ⚑ Flagged as Insurance-Relevant Trip
                    <button className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: 11, padding: '4px 10px' }}
                        onClick={() => window.print()}>📄 Export PDF</button>
                </div>
            )}

            {/* Speed chart */}
            <p className="section-title" style={{ marginTop: 12 }}>Speed Over Time</p>
            <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trip.speedData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="t" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 110]} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
                    <Line type="monotone" dataKey="speed" stroke="var(--teal)" strokeWidth={2} dot={false} name="Speed (km/h)" />
                </LineChart>
            </ResponsiveContainer>

            {/* Timeline */}
            <p className="section-title" style={{ marginTop: 12 }}>Event Timeline</p>
            <div className="td-timeline">
                {trip.events.map((ev, i) => (
                    <div key={i} className="timeline-item">
                        <div className={`timeline-dot ${i === 0 ? 'dot-start' : i === trip.events.length - 1 ? 'dot-end' : 'dot-event'}`} />
                        <p className="timeline-event">{ev}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
