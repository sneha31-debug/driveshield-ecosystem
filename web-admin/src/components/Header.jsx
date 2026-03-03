import { useState, useEffect } from 'react';
import './Header.css';

export default function Header({ title, subtitle }) {
    const [now, setNow] = useState(new Date());
    const [showNotifs, setShowNotifs] = useState(false);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    const NOTIFS = [
        { icon: '🔴', text: 'Karan Mehta exceeded 97 km/h', time: '2m ago' },
        { icon: '🟡', text: 'Priya Nair — harsh braking ×3', time: '8m ago' },
        { icon: '🔵', text: 'Meena Patel completed trip safely', time: '22m ago' },
    ];

    return (
        <header className="top-header">
            <div className="header-left">
                <h1 className="header-title">{title}</h1>
                {subtitle && <p className="header-sub">{subtitle}</p>}
            </div>
            <div className="header-right">
                <div className="header-datetime">
                    <span className="header-time">{timeStr}</span>
                    <span className="header-date">{dateStr}</span>
                </div>

                {/* Notification Bell */}
                <div className="notif-wrap">
                    <button className="notif-bell" onClick={() => setShowNotifs(v => !v)}>
                        🔔
                        <span className="notif-count">3</span>
                    </button>
                    {showNotifs && (
                        <div className="notif-dropdown">
                            <p className="notif-header-label">Recent Alerts</p>
                            {NOTIFS.map((n, i) => (
                                <div key={i} className="notif-item">
                                    <span className="notif-icon">{n.icon}</span>
                                    <div>
                                        <p className="notif-text">{n.text}</p>
                                        <p className="notif-time">{n.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="header-avatar">FM</div>
            </div>
        </header>
    );
}
