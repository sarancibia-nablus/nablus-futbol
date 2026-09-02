import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, ChevronDown, Check } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

const Topbar = () => {
  const { user, equipo, jugadores, isAdmin, switchUser, seedDatabase } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/80 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 shadow-subtle">
      {/* Title / Brand context */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {equipo?.nombre || 'Nablus Fútbol'}
        </span>
        <span className="text-gray-300">•</span>
        {/* Role badge */}
        <Badge variant={isAdmin ? 'primary' : 'neutral'} className="text-[11px]">
          {isAdmin ? 'Modo Capitán' : 'Modo Jugador'}
        </Badge>
      </div>

      {/* User profile and Switcher */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl hover:bg-gray-100/80 border border-transparent hover:border-gray-200 transition-all duration-150 text-left group"
          title="Ver perfil o cambiar usuario"
        >
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-800 group-hover:text-nablus-primary-dark transition-colors">
              {user?.nombre || 'Mi Perfil'}
            </span>
            <span className="text-[11px] text-gray-400 capitalize">
              {user?.posicion_preferida || 'Jugador'} {isAdmin ? '• Capitán' : '• Plantel'}
            </span>
          </div>
          <Avatar name={user?.nombre || 'Capitán'} src={user?.avatar_url} size="sm" />
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
        </button>

        {/* Dropdown for role switcher & profile */}
        {menuOpen && (
          <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-scale-in">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Miembros del Plantel
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto py-1">
              {jugadores.map((j) => (
                <button
                  key={j.id}
                  onClick={() => {
                    switchUser(j.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                    j.id === user?.id
                      ? 'bg-nablus-primary/10 text-nablus-primary-dark font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Avatar name={j.nombre} src={j.avatar_url} size="xs" />
                    <div>
                      <div className="font-semibold">{j.nombre}</div>
                      <div className="text-[10px] text-gray-400 capitalize">
                        {j.posicion_preferida} {j.es_admin ? '• Capitán' : '• Jugador'}
                      </div>
                    </div>
                  </div>
                  {j.id === user?.id && <Check className="w-3.5 h-3.5 text-nablus-primary" />}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-1 mt-1 px-2 space-y-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/perfil');
                }}
                className="w-full text-center py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Ir a Mi Perfil
              </button>
              {jugadores.length === 0 && (
                <button
                  onClick={async () => {
                    await seedDatabase();
                    setMenuOpen(false);
                  }}
                  className="w-full text-center py-1.5 text-xs font-bold text-nablus-primary-dark bg-nablus-primary/10 hover:bg-nablus-primary/20 rounded-lg transition-colors"
                >
                  Poblar datos iniciales
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;

