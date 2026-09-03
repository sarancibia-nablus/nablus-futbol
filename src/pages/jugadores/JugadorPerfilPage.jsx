import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, AlertTriangle, Star, Calendar, Award, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { posiciones } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { usePartidos } from '../../context/PartidosContext';
import { calculatePlayerStats } from '../../services/statsService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { decodeId } from '../../utils/hash';

const posicionBadge = {
  arquero: 'danger',
  defensa: 'info',
  mediocampo: 'success',
  delantero: 'primary',
};

const JugadorPerfilPage = () => {
  const { id: encodedId } = useParams();
  const navigate = useNavigate();
  const { jugadores } = useAuth();
  const { partidos } = usePartidos();

  const id = decodeId(encodedId);
  // Fallback a encodedId por si es el UUID original (retrocompatibilidad o links viejos)
  const jugador = jugadores.find((j) => j.id === id) || jugadores.find((j) => j.id === encodedId);

  // Compute live stats directly from real database matches and events
  const playerStats = useMemo(() => {
    if (!jugador) return null;
    return calculatePlayerStats(jugador.id, partidos);
  }, [jugador, partidos]);

  if (!jugador) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 font-medium">Jugador no encontrado</p>
        <Button variant="ghost" onClick={() => navigate('/jugadores')} className="mt-4">
          Volver a la lista
        </Button>
      </div>
    );
  }

  const pos = posiciones.find((p) => p.value === jugador.posicion_preferida);
  const partidosJugador = partidos.filter((p) =>
    p.jugadores?.some((j) => j.jugador_id === jugador.id && j.estado_invitacion === 'confirmado')
  );

  const statsData = [
    { name: 'Goles', value: playerStats?.goles || 0, color: '#A493DC' },
    { name: 'Asistencias', value: playerStats?.asistencias || 0, color: '#10B981' },
    { name: 'T. Amarillas', value: playerStats?.tarjetas_amarillas || 0, color: '#FBBF24' },
    { name: 'T. Rojas', value: playerStats?.tarjetas_rojas || 0, color: '#EF4444' },
  ];

  const edad = jugador.fecha_nacimiento
    ? Math.floor((new Date() - new Date(jugador.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000))
    : '-';

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/jugadores')}>
        Volver a la lista
      </Button>

      {/* Header Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar name={jugador.nombre} src={jugador.avatar_url} size="xl" />
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900">{jugador.nombre}</h1>
              {jugador.es_admin && <Badge variant="primary">Administrador</Badge>}
            </div>
            <p className="text-sm text-gray-500">{jugador.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <Badge variant={posicionBadge[jugador.posicion_preferida] || 'neutral'}>
                {pos?.label || jugador.posicion_preferida}
              </Badge>
              <span className="text-xs text-gray-500">{edad} años</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Partidos', value: playerStats?.partidos || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Goles', value: playerStats?.goles || 0, icon: Target, color: 'text-nablus-primary', bg: 'bg-purple-50' },
          { label: 'Asistencias', value: playerStats?.asistencias || 0, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tarjetas', value: (playerStats?.tarjetas_amarillas || 0) + (playerStats?.tarjetas_rojas || 0), icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'MVPs', value: playerStats?.mvps || 0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Efectividad', value: `${playerStats?.efectividad || 0}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 text-center">
            <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <span className="text-2xl font-extrabold font-mono text-gray-900">{stat.value}</span>
            <span className="text-xs text-gray-400 block mt-0.5">{stat.label}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Distribución */}
        <Card className="p-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            Distribución de Acciones
          </h2>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statsData.filter((d) => d.value > 0).map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {statsData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-gray-600 font-medium">
                  {d.name}: {d.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Historial de Partidos */}
        <Card className="p-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            Historial de Partidos
          </h2>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {partidosJugador.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Sin partidos registrados</p>
            ) : (
              partidosJugador.map((partido) => {
                const formatFecha = (f) =>
                  new Date(f).toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                return (
                  <div
                    key={partido.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/partidos/${partido.id}`)}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{partido.ubicacion}</p>
                      <p className="text-xs text-gray-400 capitalize">{formatFecha(partido.fecha)}</p>
                    </div>
                    {partido.estado === 'finalizado' && (
                      <span className="font-mono font-bold text-sm bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-gray-800">
                        {partido.resultado_equipo_a} - {partido.resultado_equipo_b}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JugadorPerfilPage;
