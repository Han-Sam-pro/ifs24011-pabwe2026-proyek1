import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { CalendarRange, Compass, LayoutDashboard, LogOut, UserRound, Users, WifiOff } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Beranda', icon: LayoutDashboard, end: true },
  { to: '/rencana', label: 'Rencana Perjalanan', icon: CalendarRange },
  { to: '/pengguna', label: 'Pengguna', icon: Users },
  { to: '/profil', label: 'Profil', icon: UserRound },
];

function useBackendStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    let alive = true;
    const ping = () => api.get('/health').then(() => alive && setOnline(true)).catch(() => alive && setOnline(false));
    ping();
    const timer = setInterval(ping, 20000);
    return () => { alive = false; clearInterval(timer); };
  }, []);
  return online;
}

export default function Layout() {
  const online = useBackendStatus();
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><Compass size={22} /></span>
          <div>
            <p className="brand-name">RoamPlan</p>
            <p className="brand-sub">Smart Trip Planner</p>
          </div>
        </div>
        <nav className="nav" aria-label="Menu utama">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={20} aria-hidden="true" /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="user-box">
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-email">@{user?.username}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}><LogOut size={16} /> Keluar</button>
        </div>
      </aside>

      <div className="main">
        {!online && (
          <div className="banner" role="alert">
            <WifiOff size={18} /> Server backend tidak merespons. Data mungkin tidak terbarui; sistem mencoba menghubungi ulang otomatis.
          </div>
        )}
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
