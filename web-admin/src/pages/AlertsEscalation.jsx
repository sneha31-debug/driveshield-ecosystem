import { useState } from 'react';
import './AlertsEscalation.css';

const ALL_ALERTS = [
    {
        id: 'A001', severity: 'critical', driver: 'Karan Mehta', vehicle: 'MH-12-EF-3456',
        event: 'Speed limit exceeded — 97 km/h in 60 km/h zone',
        location: 'Outer Ring Rd, Thane', time: '2 min ago',
        escalation: { notify: true, 'auto-message': true, lock: true }, active: true,
    },
    {
        id: 'A002', severity: 'critical', driver: 'Ravi Sharma', vehicle: 'DL-01-AB-1234',
        event: 'Impact detected — G-force 8.2G at intersection',
        location: 'NH-48, Gurgaon', time: '7 min ago',
        escalation: { notify: true, 'auto-message': true, lock: false }, active: true,
    },
    {
        id: 'A003', severity: 'warning', driver: 'Priya Nair', vehicle: 'KA-05-CD-7890',
        event: 'Harsh braking detected ×3 in last 30 minutes',
        location: 'Ring Rd, Noida', time: '12 min ago',
        escalation: { notify: true, 'auto-message': false, lock: false }, active: true,
    },
    {
        id: 'A004', severity: 'warning', driver: 'Deepak Rao', vehicle: 'GJ-01-GH-2345',
        event: 'Continuous driving — 4h 15m without rest break',
        location: 'BRTS Corridor, Ahmedabad', time: '18 min ago',
        escalation: { notify: true, 'auto-message': true, lock: false }, active: true,
    },
    {
        id: 'A005', severity: 'inform', driver: 'Anjali Singh', vehicle: 'MH-14-IJ-5678',
        event: 'Route deviation detected — 2.1 km from planned path',
        location: 'SH-1 → Pune', time: '35 min ago',
        escalation: { notify: true, 'auto-message': false, lock: false }, active: false,
    },
    {
        id: 'A006', severity: 'inform', driver: 'Meena Patel', vehicle: 'KA-09-KL-9012',
        event: 'Low fuel alert — 12% remaining',
        location: 'Hosur Rd, Bengaluru', time: '1h 2m ago',
        escalation: { notify: false, 'auto-message': false, lock: false }, active: false,
    },
];

const SEV_META = {
    critical: { label: 'Critical', cls: 'badge-critical', icon: '🔴', color: 'var(--red)' },
    warning: { label: 'Warning', cls: 'badge-moderate', icon: '🟡', color: 'var(--amber)' },
    inform: { label: 'Inform', cls: 'badge-info', icon: '🔵', color: 'var(--blue)' },
};

const ESC_KEYS = ['notify', 'auto-message', 'lock'];
const ESC_META = {
    'notify': { label: 'Notify Manager', icon: '📣' },
    'auto-message': { label: 'Auto-message Driver', icon: '💬' },
    'lock': { label: 'Lock Trip Start', icon: '🔒' },
};

export default function AlertsEscalation() {
    const [severityFilter, setSeverityFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [dismissed, setDismissed] = useState(new Set());
    // escalation toggles keyed by alertId → key → bool
    const [escToggles, setEscToggles] = useState(() => {
        const init = {};
        ALL_ALERTS.forEach(a => { init[a.id] = { ...a.escalation }; });
        return init;
    });

    const toggleEsc = (alertId, key) => {
        setEscToggles(prev => ({
            ...prev,
            [alertId]: { ...prev[alertId], [key]: !prev[alertId][key] },
        }));
    };

    const visible = ALL_ALERTS.filter(a => {
        if (dismissed.has(a.id)) return false;
        if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
        if (search && !a.driver.toLowerCase().includes(search.toLowerCase()) &&
            !a.event.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const critical = ALL_ALERTS.filter(a => a.severity === 'critical').length;
    const warning = ALL_ALERTS.filter(a => a.severity === 'warning').length;
    const inform = ALL_ALERTS.filter(a => a.severity === 'inform').length;
    const fatigue = Math.round((dismissed.size / ALL_ALERTS.length) * 100);

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

            {/* Filters + Search */}
            <div className="alerts-toolbar card">
                <div className="tab-group">
                    {['all', 'critical', 'warning', 'inform'].map(f => (
                        <button key={f} className={`tab-btn${severityFilter === f ? ' active' : ''}`} onClick={() => setSeverityFilter(f)}>
                            {f === 'all' ? 'All' : SEV_META[f].icon + ' ' + SEV_META[f].label}
                        </button>
                    ))}
                </div>
                <input
                    className="alert-search"
                    placeholder="🔍  Search by driver or event…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <span className="alert-count">{visible.length} alert{visible.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Alert list */}
            <div className="card alerts-panel">
                <div className="alerts-list">
                    {visible.length === 0 && <p className="no-alerts">No alerts for this filter ✓</p>}
                    {visible.map(a => {
                        const m = SEV_META[a.severity];
                        const esc = escToggles[a.id];
                        return (
                            <div key={a.id} className={`alert-row alert-row--${a.severity}`}>
                                <div className="alert-sev-bar" style={{ background: m.color }} />
                                <div className="alert-content">
                                    <div className="alert-top">
                                        <span className={`badge ${m.cls}`}>{m.icon} {m.label}</span>
                                        <span className="alert-driver">👤 {a.driver}</span>
                                        <span className="alert-vehicle">{a.vehicle}</span>
                                        {a.active && (
                                            <span className="live-badge" style={{ marginLeft: 'auto' }}>
                                                <span className="pulse-dot" />Live
                                            </span>
                                        )}
                                    </div>
                                    <p className="alert-event">{a.event}</p>
                                    <div className="alert-meta">
                                        <span>📍 {a.location}</span>
                                        <span>⏱ {a.time}</span>
                                    </div>

                                    {/* Interactive escalation toggles */}
                                    <div className="escalation-chips">
                                        {ESC_KEYS.map(key => (
                                            <button
                                                key={key}
                                                className={`esc-chip ${esc[key] ? 'esc-chip--on' : 'esc-chip--off'}`}
                                                onClick={() => toggleEsc(a.id, key)}
                                                title={esc[key] ? 'Click to disable' : 'Click to enable'}
                                            >
                                                {ESC_META[key].icon} {ESC_META[key].label}
                                                <span className="esc-status">{esc[key] ? '✓' : '○'}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    className="dismiss-btn"
                                    onClick={() => setDismissed(prev => new Set([...prev, a.id]))}
                                >
                                    Dismiss
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
