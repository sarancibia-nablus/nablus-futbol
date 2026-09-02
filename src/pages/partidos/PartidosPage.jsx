import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, Filter, ArrowRight, Trophy } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { usePartidos } from '../../context/PartidosContext';

const estadoBadge = {
  programado: { variant: 'info', label: 'Programado' },
  en_curso: { variant: 'warning', label: 'En curso' },
  finalizado: { variant: 'success', label: 'Finalizado' },
  cancelado: { variant: 'danger', label: 'Cancelado' },
};

const PartidosPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { partidos } = usePartidos();
  const [filtro, setFiltro] = useState('todos');

  const filtrados = filtro === 'todos'
    ? partidos
    : partidos.filter((p) => p.estado === filtro);

  const formatFecha = (f) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatHora = (f) => {
    const d = new Date(f);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Partidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{partidos.length} partidos en el registro</p>
        </div>
        {isAdmin && (
          <Button icon={Plus} onClick={() => navigate('/partidos/crear')}>
            Crear nuevo partido
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {['todos', 'programado', 'en_curso', 'finalizado', 'cancelado'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filtro === f
                ? 'bg-nablus-primary text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'todos' ? 'Todos los estados' : estadoBadge[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Lista de partidos */}
      <div className="space-y-3.5">
        {filtrados.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <Trophy className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-700">Aún no hay partidos registrados</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              {isAdmin
                ? 'Como Capitán, puedes programar y convocar al próximo partido de Nablus FC.'
                : 'El Capitán del equipo aún no ha programado nuevos partidos.'}
            </p>
            {isAdmin && (
              <Button icon={Plus} onClick={() => navigate('/partidos/crear')} className="mt-4" size="sm">
                Crear primer partido
              </Button>
            )}
          </Card>
        ) : (
          filtrados.map((partido) => {
            const confirmados =
              partido.jugadores?.filter((j) => j.estado_invitacion === 'confirmado').length || 0;
            const totalInvitados = partido.jugadores?.length || 0;

            return (
              <Card
                key={partido.id}
                hover
                className="p-5 cursor-pointer border border-gray-200 hover:border-nablus-primary/60 transition-all"
                onClick={() => navigate(`/partidos/${partido.id}`)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Badge variant={estadoBadge[partido.estado]?.variant || 'neutral'}>
                        {estadoBadge[partido.estado]?.label || partido.estado}
                      </Badge>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {partido.formato}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 capitalize">
                      {formatFecha(partido.fecha)}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatHora(partido.fecha)} hrs
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {partido.ubicacion}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {confirmados}/{totalInvitados} confirmados
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end lg:self-auto">
                    {partido.estado === 'finalizado' && (
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                        <span className="text-xs text-gray-400">Resultado:</span>
                        <span className="font-mono font-bold text-base text-gray-900">
                          {partido.resultado_equipo_a} - {partido.resultado_equipo_b}
                        </span>
                      </div>
                    )}
                    <Button variant="secondary" size="sm" iconRight={ArrowRight}>
                      Detalles y Eventos
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PartidosPage;
