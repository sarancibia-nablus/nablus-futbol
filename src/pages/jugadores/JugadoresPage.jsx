import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldCheck, Trash2 } from 'lucide-react';
import Table from '../../components/ui/Table';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { posiciones } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { usePartidos } from '../../context/PartidosContext';
import { calculatePlayerStats, calculatePlayerOverall } from '../../services/statsService';

const posicionBadge = {
  arquero: 'danger',
  defensa: 'info',
  mediocampo: 'success',
  delantero: 'primary',
};

const JugadoresPage = () => {
  const navigate = useNavigate();
  const { jugadores, isAdmin, setRole, removeJugador } = useAuth();
  const { partidos } = usePartidos();

  // Combine player profiles with dynamically computed real match stats
  const playersWithStats = useMemo(() => {
    return jugadores.map((j) => {
      const stats = calculatePlayerStats(j.id, partidos);
      const media = calculatePlayerOverall(j, stats);
      return {
        ...j,
        stats,
        media,
      };
    });
  }, [jugadores, partidos]);

  const baseColumns = [
    {
      key: 'nombre',
      header: 'Jugador',
      accessor: 'nombre',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.nombre} src={row.avatar_url} size="sm" />
          <div>
            <p className="font-semibold text-gray-900">{row.nombre}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'posicion',
      header: 'Posición',
      accessor: 'posicion_preferida',
      sortable: true,
      render: (row) => {
        const pos = posiciones.find((p) => p.value === row.posicion_preferida);
        return (
          <Badge variant={posicionBadge[row.posicion_preferida] || 'neutral'}>
            {pos?.label || row.posicion_preferida}
          </Badge>
        );
      },
    },
    {
      key: 'media',
      header: 'OVR',
      accessor: (row) => row.media?.ovr || 50,
      sortable: true,
      render: (row) => (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-900 to-purple-900 text-white font-black text-sm shadow-sm border border-purple-400/30">
            {row.media?.ovr || 50}
          </span>
        </div>
      ),
    },
    {
      key: 'partidos',
      header: 'PJ',
      accessor: (row) => row.stats?.partidos || 0,
      sortable: true,
      render: (row) => (
        <span className="font-mono font-medium text-gray-700">{row.stats?.partidos || 0}</span>
      ),
    },
    {
      key: 'goles',
      header: 'Goles',
      accessor: (row) => row.stats?.goles || 0,
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-nablus-primary-dark">{row.stats?.goles || 0}</span>
      ),
    },
    {
      key: 'asistencias',
      header: 'Asist.',
      accessor: (row) => row.stats?.asistencias || 0,
      sortable: true,
      render: (row) => (
        <span className="font-mono font-medium text-emerald-700">{row.stats?.asistencias || 0}</span>
      ),
    },
    {
      key: 'tarjetas',
      header: 'TA / TR',
      accessor: (row) => row.stats?.tarjetas_amarillas || 0,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-3.5 rounded-[2px] bg-amber-400" />
            <span className="font-mono text-xs text-gray-600">{row.stats?.tarjetas_amarillas || 0}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-3.5 rounded-[2px] bg-rose-500" />
            <span className="font-mono text-xs text-gray-600">{row.stats?.tarjetas_rojas || 0}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'mvps',
      header: 'MVP',
      accessor: (row) => row.stats?.mvps || 0,
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-amber-600">{row.stats?.mvps || 0}</span>
      ),
    },
  ];

  const columns = useMemo(() => {
    const cols = [...baseColumns];
    if (isAdmin) {
      cols.push({
        key: 'admin',
        header: 'Gestión',
        accessor: 'id',
        render: (row) => (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setRole(row.id, !row.es_admin)}
              className={`p-1.5 rounded-lg transition-colors ${
                row.es_admin 
                  ? 'bg-nablus-primary/10 text-nablus-primary hover:bg-nablus-primary/20'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={row.es_admin ? "Quitar Capitán" : "Hacer Capitán"}
            >
              {row.es_admin ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </button>
            <button
              onClick={async () => {
                if (window.confirm(`¿Estás seguro que deseas eliminar a ${row.nombre}? Esto borrará su historial de partidos.`)) {
                  await removeJugador(row.id);
                }
              }}
              className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
              title="Eliminar Jugador"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      });
    }
    return cols;
  }, [isAdmin, setRole, removeJugador]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantel de Jugadores</h1>
          <p className="text-sm text-gray-500 mt-0.5">{jugadores.length} jugadores registrados en Nablus</p>
        </div>
      </div>

      <Table
        columns={columns}
        data={playersWithStats}
        searchPlaceholder="Buscar por nombre o correo..."
        onRowClick={(row) => navigate(`/jugadores/${row.id}`)}
      />
    </div>
  );
};

export default JugadoresPage;
