import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CommandCenter from './pages/CommandCenter';
import RiskHeatmap from './pages/RiskHeatmap';
import DriverProfiles from './pages/DriverProfiles';
import PredictiveRisk from './pages/PredictiveRisk';
import AlertsEscalation from './pages/AlertsEscalation';
import TripExplorer from './pages/TripExplorer';
import FleetBehavior from './pages/FleetBehavior';

const PAGE_META = {
  '/': { title: 'Command Center', subtitle: 'Fleet-wide risk intelligence at a glance' },
  '/heatmap': { title: 'AI Risk Heatmap', subtitle: 'Geographic risk visualization across your fleet' },
  '/drivers': { title: 'Driver Risk Profiles', subtitle: 'Individual risk DNA and behavioral insight' },
  '/forecast': { title: 'Predictive Risk Forecast', subtitle: 'AI-powered accident probability & exposure modelling' },
  '/alerts': { title: 'Smart Alerts & Escalation', subtitle: 'Real-time alerts with automated escalation rules' },
  '/trips': { title: 'Trip Intelligence Explorer', subtitle: 'Dive deep into individual trip data' },
  '/fleet': { title: 'Fleet Behavior Analytics', subtitle: 'Behavioral patterns and coaching effectiveness' },
};

function AppLayout({ path, children }) {
  const meta = PAGE_META[path] ?? { title: 'DriveShield', subtitle: '' };
  return (
    <>
      <Header title={meta.title} subtitle={meta.subtitle} />
      <main className="page-content fade-in">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="main-area">
          <Routes>
            <Route path="/" element={<AppLayout path="/"><CommandCenter /></AppLayout>} />
            <Route path="/heatmap" element={<AppLayout path="/heatmap"><RiskHeatmap /></AppLayout>} />
            <Route path="/drivers" element={<AppLayout path="/drivers"><DriverProfiles /></AppLayout>} />
            <Route path="/forecast" element={<AppLayout path="/forecast"><PredictiveRisk /></AppLayout>} />
            <Route path="/alerts" element={<AppLayout path="/alerts"><AlertsEscalation /></AppLayout>} />
            <Route path="/trips" element={<AppLayout path="/trips"><TripExplorer /></AppLayout>} />
            <Route path="/fleet" element={<AppLayout path="/fleet"><FleetBehavior /></AppLayout>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
