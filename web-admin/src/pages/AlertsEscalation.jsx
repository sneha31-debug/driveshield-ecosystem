import { useState } from 'react';
import './AlertsEscalation.css';

const ALERTS = [
    {
        id: 'A001', severity: 'critical', driver: 'Karan Mehta', vehicle: 'MH-12-EF-3456',
        event: 'Speed limit exceeded — 97 km/h in 60 km/h zone',
        location: 'Outer Ring Rd, Thane', time: '2 min ago',
        escalation: ['notify', 'auto-message', 'lock'],
        active: true,
    },
    {
        id: 'A002', severity: 'critical', driver: 'Ravi Sharma', vehicle: 'DL-01-AB-1234',
        event: 'Impact detected — G-force 8.2G at intersection',
        location: 'NH-48, Gurgaon', time: '7 min ago',
        escalation: ['notify', 'auto-message'],
        active: true,
    },
    {
        id: 'A003', severity: 'warning', driver: 'Priya Nair', vehicle: 'KA-05-CD-7890',
        event: 'Harsh braking detected ×3 in last 30 minutes',
        location: 'Ring Rd, Noida', time: '12 min ago',
        escalation: ['notify'],
        active: true,
    },
    {
        id: 'A004', severity: 'warning', driver: 'Deepak Rao', vehicle: 'GJ-01-GH-2345',
        event: 'Continuous driving — 4h 15m without rest break',
        location: 'BRTS Corridor, Ahmedabad', time: '18 min ago',
        escalation: ['notify', 'auto-message'],
        active: true,
    },
    {
        id: 'A005', severity: 'inform', driver: 'Anjali Singh', vehicle: 'MH-14-IJ-5678',
        event: 'Route deviation detected — 2.1 km from planned path',
        location: 'SH-1 → Pune', time: '35 min ago',
        escalation: ['notify'],
        active: false,
    },
    {
        id: 'A006', severity: 'inform', driver: 'Meena Patel', vehicle: 'KA-09-KL-9012',
        event: 'Low fuel alert — 12% remaining',
        location: 'Hosur Rd, Bengaluru', time: '1h 2m ago',
        escalation: [],
        active: false,
    },
];

const SEV_META = {
    critical: { label: 'Critical', cls: 'badge-critical', icon: '🔴', color: 'var(--red)' },
    warning: { label: 'Warning', cls: 'badge-moderate', icon: '🟡', color: 'var(--amber)' },
    inform: { label: 'Inform', cls: 'badge-info', icon: '🔵', color: 'var(--blue)' },
};

const ESC_META = {
    notify: { label: 'Notify Manager', icon: '📣' },
    'auto-message': { label: 'Auto-message Driver', icon: '💬' },
    lock: { label: 'Lock Trip Start', icon: '🔒' },
};

export default function AlertsEscalation() {
    const [filter, setFilter] = useState('all');
    const [dismissed, setDismissed] = useState(new Set());

    const visible = ALERTS.filter(a => {
        if (dismissed.has(a.id)) return false;
        if (filter === 'all') return true;
        return a.severity === filter;
    });

    const critical = ALERTS.filter(a => a.severity === 'critical').length;
    const warning = ALERTS.filter(a => a.severity === 'warning').length;
    const inform = ALERTS.filter(a => a.severity === 'inform').length;
    const fatigue = Math.round((dismissed.size / ALERTS.length) * 100);

    return (
        <div className="alerts-page">
            {/* KPI */}
            <div className="grid-4">
                <div className="card card-sm stat-card">
                    <span className="stat-label">🔴 Critical</span>
                    <span className="stat-value" style={{ color: 'var(--red)' }}>{critical}</span>
                    <span className="stat-delta delta-down">Immediate action</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">🟡 Warnings</span>
                    <span className="stat-value" style={{ color: 'var(--amber)' }}>{warning}</span>
                    <span className="stat-delta delta-neu">Monitor closely</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">🔵 Inform</span>
                    <span className="stat-value" style={{ color: 'var(--blue)' }}>{inform}</span>
                    <span className="stat-delta delta-neu">Informational</span>
                </div>
                <div className="card card-sm stat-card">
                    <span className="stat-label">Alert Fatigue Score</span>
                    <span className="stat-value" style={{ color: fatigue > 60 ? 'var(--red)' : 'var(--teal)' }}>{fatigue}%</span>
                    <span className="stat-delta delta-neu">{fatigue > 50 ? '⚠ Team overwhelmed' : '✓ Manageable'}</span>
                </div>
            </div>

            {/* Alert Fatigue banner */}
            {fatigue > 50 && (
                <div className="fatigue-banner">
                    <span>⚡</span>
                    <p>Alert fatigue is elevated. Consider raising severity thresholds or enabling auto-resolution for low-priority alerts to reduce team overload.</p>
                </div>
            )}

            {/* Filters + List */}
            <div className="card alerts-panel">
                <div className="alerts-panel-header">
                    <p className="section-title">Active Alerts — Severity Ladder</p>
                    <div className="tab-group">
                        {['all', 'critical', 'warning', 'inform'].map(f => (
                            <button key={f} className={`tab-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="alerts-list">
                    {visible.length === 0 && <p className="no-alerts">No alerts for this filter ✓</p>}
                    {visible.map(a => {
                        const m = SEV_META[a.severity];
                        return (
                            <div key={a.id} className={`alert-row alert-row--${a.severity}`}>
                                <div className="alert-sev-bar" style={{ background: m.color }} />
                                <div className="alert-content">
                                    <div className="alert-top">
                                        <span className={`badge ${m.cls}`}>{m.icon} {m.label}</span>
                                        <span className="alert-driver">👤 {a.driver}</span>
                                        <span className="alert-vehicle">{a.vehicle}</span>
                                        {a.active && <span className="live-badge" style={{ marginLeft: 'auto' }}><span className="pulse-dot" />Live</span>}
                                    </div>
                                    <p className="alert-event">{a.event}</p>
                                    <div className="alert-meta">
                                        <span>📍 {a.location}</span>
                                        <span>⏱ {a.time}</span>
                                    </div>
                                    {a.escalation.length > 0 && (
                                        <div className="escalation-chips">
                                            {a.escalation.map(e => (
                                                <span key={e} className="esc-chip">{ESC_META[e].icon} {ESC_META[e].label}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button className="dismiss-btn" onClick={() => setDismissed(prev => new Set([...prev, a.id]))}>Dismiss</button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
