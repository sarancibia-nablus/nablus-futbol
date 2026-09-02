import { useMemo } from 'react';
import { Target, Trophy, AlertTriangle, Star, Activity, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { usePartidos } from '../../context/PartidosContext';
import { calculatePersonalStats } from '../../services/statsService';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const EstadisticasPage = () => {
  const { user, jugadores } = useAuth();
  const { partidos } = usePartidos();

  // Calculate personal stats using the new service function
  const personalData = useMemo(() => {
    return calculatePersonalStats(user?.id, jugadores, partidos);
  }, [user?.id, jugadores, partidos]);

  const { stats, radarData, maximosEquipo } = personalData;

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={user.nombre} src={user.avatar_url} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Estadísticas</h1>
            <p className="text-sm text-gray-500 mt-0.5 capitalize">
              {user.posicion_preferida} • {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Partidos Jugados', value: stats.partidos, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Goles Totales', value: stats.goles, icon: Target, color: 'text-nablus-primary', bg: 'bg-purple-50' },
          { label: 'Asistencias', value: stats.asistencias, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'T. Amarillas', value: stats.tarjetas_amarillas, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'T. Rojas', value: stats.tarjetas_rojas, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Premios MVP', value: stats.mvps, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 text-center border-gray-100 flex flex-col items-center justify-center">
            <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <span className="text-2xl font-extrabold font-mono text-gray-900">{stat.value}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block mt-1">
              {stat.label}
            </span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="p-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            Pentágono de Rendimiento
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar
                  dataKey="value"
                  stroke="#A493DC"
                  fill="#A493DC"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-2 leading-tight">
            * Este gráfico compara tu rendimiento actual frente al registro histórico máximo dentro del equipo.
          </p>
        </Card>

        {/* Detalles e Insights Personales */}
        <div className="space-y-6 flex flex-col">
          <Card className="p-6 flex-1 flex flex-col">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              Resumen de Desempeño
            </h2>
            <div className="flex-1 space-y-4 flex flex-col justify-center">
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">Promedio Goles / Partido</span>
                <span className="font-mono font-bold text-gray-900">
                  {stats.promedio_goles} <span className="text-xs text-gray-400 font-sans">G/P</span>
                </span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">Porcentaje de Victorias</span>
                <span className="font-mono font-bold text-gray-900">
                  {stats.efectividad}%
                </span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">Participación Ofensiva</span>
                <span className="font-mono font-bold text-emerald-600">
                  {stats.goles + stats.asistencias} <span className="text-xs text-gray-400 font-sans">Acciones (G+A)</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estado Disciplinario</span>
                {stats.tarjetas_rojas > 0 ? (
                  <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Alerta Roja</span>
                ) : stats.tarjetas_amarillas > 0 ? (
                  <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">Precaución</span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Limpio</span>
                )}
              </div>

            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPage;
