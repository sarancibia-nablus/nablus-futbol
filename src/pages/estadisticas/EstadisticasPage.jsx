import { useMemo } from 'react';
import { Target, Trophy, AlertTriangle, Star, Users, Shield } from 'lucide-react';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { posiciones } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { usePartidos } from '../../context/PartidosContext';
import { calculateTeamStats } from '../../services/statsService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

const posicionBadge = {
  arquero: 'danger',
  defensa: 'info',
  mediocampo: 'success',
  delantero: 'primary',
};

const EstadisticasPage = () => {
  const { jugadores } = useAuth();
  const { partidos } = usePartidos();

  // Dynamic statistics computed live from real match events & records
  const teamStats = useMemo(() => {
    return calculateTeamStats(jugadores, partidos);
  }, [jugadores, partidos]);

  const topGoleadores = teamStats.topGoleadores;
  const topAsistidores = teamStats.topAsistidores;
  const topMVPs = teamStats.topMVPs;
  const masPartidos = teamStats.masPartidos;
  const totalStats = teamStats.totals;
  const golesPorPosicion = teamStats.golesPorPosicion;
  const mejorJugador = teamStats.mejorJugador;
  const radarData = teamStats.radarData;

  const RankingList = ({ title, data, statKey, icon: Icon, colorClass }) => (
    <Card className="p-5">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="space-y-2">
        {data.map((jugador, idx) => (
          <div
            key={jugador.id}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors"
          >
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                idx === 0
                  ? 'bg-amber-100 text-amber-800'
                  : idx === 1
                  ? 'bg-gray-200 text-gray-700'
                  : idx === 2
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-white text-gray-400 border border-gray-200'
              }`}
            >
              {idx + 1}
            </span>
            <Avatar name={jugador.nombre} src={jugador.avatar_url} size="xs" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{jugador.nombre}</p>
              <span className="text-[10px] text-gray-400 capitalize">
                {jugador.posicion_preferida}
              </span>
            </div>
            <span className="text-base font-bold font-mono text-gray-900">
              {jugador.stats?.[statKey] || 0}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas y Rankings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Métricas acumuladas del plantel de Nablus Fútbol
        </p>
      </div>

      {/* Totales Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Goles totales', value: totalStats.goles, icon: Target, color: 'text-nablus-primary', bg: 'bg-purple-50' },
          { label: 'Asistencias', value: totalStats.asistencias, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'T. Amarillas', value: totalStats.amarillas, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'T. Rojas', value: totalStats.rojas, icon: Shield, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Plantel', value: jugadores.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'MVPs otorgados', value: totalStats.mvps, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 text-center">
            <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <span className="text-2xl font-extrabold font-mono text-gray-900">{stat.value}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block mt-0.5">
              {stat.label}
            </span>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            Aporte por Posición (Goles vs Asistencias)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={golesPorPosicion} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="posicion" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="goles" fill="#A493DC" radius={[4, 4, 0, 0]} name="Goles" />
                <Bar dataKey="asistencias" fill="#10B981" radius={[4, 4, 0, 0]} name="Asistencias" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            Rendimiento Destacado — {mejorJugador?.nombre}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar
                  dataKey="value"
                  stroke="#A493DC"
                  fill="#A493DC"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Rankings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RankingList title="Goleadores" data={topGoleadores} statKey="goles" icon={Target} colorClass="text-nablus-primary" />
        <RankingList title="Asistidores" data={topAsistidores} statKey="asistencias" icon={Trophy} colorClass="text-emerald-600" />
        <RankingList title="Premios MVP" data={topMVPs} statKey="mvps" icon={Star} colorClass="text-amber-500" />
        <RankingList title="Presencias (PJ)" data={masPartidos} statKey="partidos" icon={Users} colorClass="text-blue-600" />
      </div>
    </div>
  );
};

export default EstadisticasPage;
