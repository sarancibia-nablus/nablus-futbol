import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Trophy,
  Users,
  Clock,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import NablusLogo from '../shared/NablusLogo';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/calendario', label: 'Calendario', icon: CalendarDays },
  { path: '/partidos', label: 'Partidos', icon: Trophy },
  { path: '/equipo', label: 'Mi Equipo', icon: Shield },
  { path: '/jugadores', label: 'Jugadores', icon: Users },
  { path: '/disponibilidad', label: 'Disponibilidad', icon: Clock },
  { path: '/estadisticas', label: 'Estadísticas', icon: BarChart3 },
];

const bottomItems = [
  { path: '/perfil', label: 'Mi Perfil', icon: User },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, equipo } = useAuth();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 
                  flex flex-col transition-all duration-300 z-40 shadow-subtle
                  ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 h-16 border-b border-gray-100 shrink-0 overflow-hidden ${collapsed ? 'justify-center px-2' : ''}`}>
        {equipo?.logo_url ? (
          <img src={equipo.logo_url} alt={equipo?.nombre || 'Equipo'} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 shadow-sm border border-gray-200/50" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-nablus-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm border border-nablus-primary/20">
            <Shield className="w-4.5 h-4.5 text-nablus-primary" />
          </div>
        )}
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-gray-900 truncate text-sm leading-tight">
              {equipo?.nombre || 'Fútbol Nablus'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full ${isActive(item.path) ? 'sidebar-link-active' : 'sidebar-link'} ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1.5 bg-gray-50/50">
        {bottomItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full ${isActive(item.path) ? 'sidebar-link-active' : 'sidebar-link'} ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
        <button
          onClick={logout}
          className={`w-full sidebar-link text-gray-500 hover:text-red-600 hover:bg-red-50 ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-gray-200 
                   flex items-center justify-center text-gray-400 hover:text-nablus-primary hover:border-nablus-primary
                   shadow-sm transition-all duration-150 z-50"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
};

export default Sidebar;
