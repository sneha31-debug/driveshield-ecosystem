import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
    { to: '/', icon: '⌂', label: 'Command Center' },
    { to: '/heatmap', icon: '🗺', label: 'Risk Heatmap' },
    { to: '/drivers', icon: '👤', label: 'Driver Profiles' },
    { to: '/forecast', icon: '📈', label: 'Predictive Risk' },
    { to: '/alerts', icon: '🚨', label: 'Alerts' },
    { to: '/trips', icon: '🚗', label: 'Trip Explorer' },
    { to: '/fleet', icon: '📊', label: 'Fleet Analytics' },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">DS</div>
                <div className="brand-text">
                    <span className="brand-name">DriveShield</span>
                    <span className="brand-role">Fleet Manager</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <p className="nav-section-label">Navigation</p>
                {NAV_ITEMS.map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `nav-item${isActive ? ' nav-item--active' : ''}`
                        }
                    >
                        <span className="nav-icon">{icon}</span>
                        <span className="nav-label">{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="fleet-status">
                    <span className="pulse-dot" />
                    <span>Fleet Live</span>
                </div>
            </div>
        </aside>
    );
}
