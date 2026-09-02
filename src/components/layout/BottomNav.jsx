import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Trophy,
  Users,
  Shield,
  BarChart3,
  User,
  Menu
} from 'lucide-react';
import { useState } from 'react';

const primaryItems = [
  { path: '/calendario', label: 'Inicio', icon: CalendarDays },
  { path: '/partidos', label: 'Partidos', icon: Trophy },
  { path: '/equipo', label: 'Equipo', icon: Shield },
  { path: '/estadisticas', label: 'Mi Rendimiento', icon: BarChart3 },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/80 pb-safe z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {primaryItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                active ? 'text-nablus-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? 'fill-nablus-primary/20' : ''}`} />
              <span className={`text-[10px] font-semibold ${active ? 'text-nablus-primary-dark' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        {/* Profile button */}
        <button
          onClick={() => navigate('/perfil')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
            isActive('/perfil') ? 'text-nablus-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User className={`w-5 h-5 ${isActive('/perfil') ? 'fill-nablus-primary/20' : ''}`} />
          <span className={`text-[10px] font-semibold ${isActive('/perfil') ? 'text-nablus-primary-dark' : ''}`}>
            Perfil
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
