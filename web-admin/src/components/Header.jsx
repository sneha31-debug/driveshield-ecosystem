import './Header.css';

export default function Header({ title, subtitle }) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

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
                <div className="header-avatar">FM</div>
            </div>
        </header>
    );
}
