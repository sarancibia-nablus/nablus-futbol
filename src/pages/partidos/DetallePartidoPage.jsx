import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ExternalLink,
  Users,
  Star,
  Shuffle,
  Edit,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Save,
  Trophy,
  AlertTriangle,
  Download,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { usePartidos } from '../../context/PartidosContext';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../../utils/calendarExport';

const estadoBadge = {
  programado: { variant: 'info', label: 'Programado' },
  en_curso: { variant: 'warning', label: 'En curso' },
  finalizado: { variant: 'success', label: 'Finalizado' },
  cancelado: { variant: 'danger', label: 'Cancelado' },
};

const invitacionBadge = {
  confirmado: { variant: 'success', label: 'Confirmado' },
  pendiente: { variant: 'warning', label: 'Pendiente' },
  rechazado: { variant: 'danger', label: 'Rechazado' },
};

const eventoEmoji = {
  gol: '⚽ Gol',
  asistencia: '👟 Asistencia',
  tarjeta_amarilla: '🟨 Tarjeta Amarilla',
  tarjeta_roja: '🟥 Tarjeta Roja',
};

const DetallePartidoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, jugadores: allJugadores } = useAuth();
  const {
    getPartidoById,
    updatePartido,
    addEvento,
    removeEvento,
    updateJugadorInvitacion,
  } = usePartidos();

  const partido = getPartidoById(id);

  // Modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEquiposModalOpen, setIsEquiposModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Form State para edición de partido
  const [editForm, setEditForm] = useState({
    estado: partido?.estado || 'programado',
    resultado_equipo_a: partido?.resultado_equipo_a ?? 0,
    resultado_equipo_b: partido?.resultado_equipo_b ?? 0,
    mvp_id: partido?.mvp_id || '',
    ubicacion: partido?.ubicacion || '',
    ubicacion_url: partido?.ubicacion_url || '',
  });

  // Form State para agregar evento
  const [nuevoEvento, setNuevoEvento] = useState({
    jugador_id: '',
    tipo: 'gol',
    minuto: 1,
  });

  if (!partido) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 font-medium">Partido no encontrado</p>
        <Button variant="ghost" onClick={() => navigate('/partidos')} className="mt-4">
          Volver a partidos
        </Button>
      </div>
    );
  }

  const formatFecha = (f) =>
    new Date(f).toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const formatHora = (f) =>
    new Date(f).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  const getJugador = (jugadorId) => allJugadores.find((j) => j.id === jugadorId);

  const mvp = getJugador(partido.mvp_id);

  // Jugadores clasificados
  const equipoA = (partido.jugadores || [])
    .filter((j) => j.equipo_partido === 'equipo_a')
    .map((j) => ({ ...j, jugador: getJugador(j.jugador_id) }));

  const equipoB = (partido.jugadores || [])
    .filter((j) => j.equipo_partido === 'equipo_b')
    .map((j) => ({ ...j, jugador: getJugador(j.jugador_id) }));

  const sinEquipo = (partido.jugadores || [])
    .filter((j) => !j.equipo_partido)
    .map((j) => ({ ...j, jugador: getJugador(j.jugador_id) }));

  // Armar equipos al azar de los confirmados
  const handleShuffleEquipos = () => {
    const confirmados = (partido.jugadores || []).filter(
      (j) => j.estado_invitacion === 'confirmado'
    );
    const shuffled = [...confirmados].sort(() => 0.5 - Math.random());

    const updatedJugadores = (partido.jugadores || []).map((j) => {
      const index = shuffled.findIndex((s) => s.jugador_id === j.jugador_id);
      if (index !== -1) {
        return {
          ...j,
          equipo_partido: index % 2 === 0 ? 'equipo_a' : 'equipo_b',
        };
      }
      return { ...j, equipo_partido: null };
    });

    updatePartido(partido.id, { jugadores: updatedJugadores });
  };

  const handleSaveEditPartido = (e) => {
    e.preventDefault();
    
    const golesA = parseInt(editForm.resultado_equipo_a) || 0;
    const golesB = parseInt(editForm.resultado_equipo_b) || 0;
    const totalGolesMarcador = golesA + golesB;
    
    const golesEventos = (partido.eventos || []).filter(ev => ev.tipo === 'gol').length;

    // Si hay goles en el marcador pero no se han registrado todos en los eventos
    if (totalGolesMarcador > 0 && golesEventos < totalGolesMarcador) {
      setIsConfirmModalOpen(true);
      return; // Detener guardado para pedir confirmación
    }

    ejecutarGuardado();
  };

  const ejecutarGuardado = () => {
    updatePartido(partido.id, {
      estado: editForm.estado,
      resultado_equipo_a: parseInt(editForm.resultado_equipo_a) || 0,
      resultado_equipo_b: parseInt(editForm.resultado_equipo_b) || 0,
      mvp_id: editForm.mvp_id || null,
      ubicacion: editForm.ubicacion,
      ubicacion_url: editForm.ubicacion_url,
    });
    setIsEditModalOpen(false);
    setIsConfirmModalOpen(false);
  };

  const handleAddEvento = (e) => {
    e.preventDefault();
    if (!nuevoEvento.jugador_id) return;
    addEvento(partido.id, {
      jugador_id: nuevoEvento.jugador_id,
      tipo: nuevoEvento.tipo,
      minuto: parseInt(nuevoEvento.minuto) || 1,
    });
    setIsEventModalOpen(false);
    setNuevoEvento({ jugador_id: '', tipo: 'gol', minuto: 1 });
  };

  // Check current user status
  const currentUserRecord = partido.jugadores?.find((j) => j.jugador_id === user?.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top action navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/partidos')}>
          Volver a partidos
        </Button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="secondary"
              icon={Edit}
              onClick={() => {
                setEditForm({
                  estado: partido.estado,
                  resultado_equipo_a: partido.resultado_equipo_a ?? 0,
                  resultado_equipo_b: partido.resultado_equipo_b ?? 0,
                  mvp_id: partido.mvp_id || '',
                  ubicacion: partido.ubicacion || '',
                  ubicacion_url: partido.ubicacion_url || '',
                });
                setIsEditModalOpen(true);
              }}
            >
              Editar Partido y Resultado
            </Button>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant={estadoBadge[partido.estado]?.variant || 'neutral'}>
                {estadoBadge[partido.estado]?.label || partido.estado}
              </Badge>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                Formato {partido.formato}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {formatFecha(partido.fecha)}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-nablus-primary" />
                {formatHora(partido.fecha)} hrs
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {partido.ubicacion}
                {partido.ubicacion_url && (
                  <a
                    href={partido.ubicacion_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-nablus-primary hover:text-nablus-primary-dark ml-1"
                    title="Abrir en Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <a
                href={generateGoogleCalendarUrl(partido)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-200"
              >
                <Calendar className="w-3.5 h-3.5" />
                Google Calendar
              </a>
              <button
                onClick={() => downloadIcsFile(partido)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-200"
              >
                <Download className="w-3.5 h-3.5" />
                Archivo .ics
              </button>
            </div>
          </div>

          {/* Marcador / Score */}
          <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-200 self-start lg:self-auto">
            <div className="text-center min-w-[70px]">
              <span className="text-xs font-bold uppercase text-gray-400">Equipo A</span>
              <div className="text-3xl font-black font-mono text-gray-900 mt-1">
                {partido.resultado_equipo_a ?? '-'}
              </div>
            </div>
            <span className="text-2xl font-light text-gray-400">:</span>
            <div className="text-center min-w-[70px]">
              <span className="text-xs font-bold uppercase text-gray-400">Equipo B</span>
              <div className="text-3xl font-black font-mono text-gray-900 mt-1">
                {partido.resultado_equipo_b ?? '-'}
              </div>
            </div>
          </div>
        </div>

        {/* User Quick Confirmation Alert if Pending */}
        {currentUserRecord && partido.estado === 'programado' && (
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Tu estado para este partido:</span>
              <Badge variant={invitacionBadge[currentUserRecord.estado_invitacion]?.variant || 'neutral'}>
                {invitacionBadge[currentUserRecord.estado_invitacion]?.label || currentUserRecord.estado_invitacion}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {currentUserRecord.estado_invitacion !== 'confirmado' && (
                <Button
                  size="sm"
                  variant="primary"
                  icon={CheckCircle2}
                  onClick={() => updateJugadorInvitacion(partido.id, user.id, 'confirmado')}
                >
                  Confirmar mi asistencia
                </Button>
              )}
              {currentUserRecord.estado_invitacion !== 'rechazado' && (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={XCircle}
                  onClick={() => updateJugadorInvitacion(partido.id, user.id, 'rechazado')}
                >
                  Rechazar
                </Button>
              )}
            </div>
          </div>
        )}

        {/* MVP Card */}
        {mvp && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Jugador del Partido (MVP)
              </span>
              <p className="text-sm font-bold text-gray-900">{mvp.nombre}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Armado de Equipos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-nablus-primary" />
            Alineaciones y Formación de Equipos
          </h2>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Shuffle}
                onClick={handleShuffleEquipos}
                title="Distribuye a los confirmados al azar"
              >
                Sortear equipos al azar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEquiposModalOpen(true)}
              >
                Asignar manualmente
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Equipo A */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-nablus-primary" />
                <h3 className="font-bold text-gray-900">Equipo A</h3>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {equipoA.length} jugadores
              </span>
            </div>

            <div className="space-y-2">
              {equipoA.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">Sin jugadores asignados</p>
              ) : (
                equipoA.map((j) => (
                  <div
                    key={j.jugador_id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={j.jugador?.nombre} src={j.jugador?.avatar_url} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{j.jugador?.nombre}</p>
                        <span className="text-[11px] text-gray-400 capitalize">
                          {j.jugador?.posicion_preferida}
                        </span>
                      </div>
                    </div>
                    {/* Eventos acumulados */}
                    <div className="flex items-center gap-1">
                      {partido.eventos
                        ?.filter((e) => e.jugador_id === j.jugador_id)
                        .map((e) => (
                          <span
                            key={e.id}
                            className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200"
                            title={`${e.tipo} min ${e.minuto}'`}
                          >
                            {e.tipo === 'gol' && '⚽'}
                            {e.tipo === 'asistencia' && '👟'}
                            {e.tipo === 'tarjeta_amarilla' && '🟨'}
                            {e.tipo === 'tarjeta_roja' && '🟥'}
                          </span>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Equipo B */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <h3 className="font-bold text-gray-900">Equipo B</h3>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {equipoB.length} jugadores
              </span>
            </div>

            <div className="space-y-2">
              {equipoB.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">Sin jugadores asignados</p>
              ) : (
                equipoB.map((j) => (
                  <div
                    key={j.jugador_id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={j.jugador?.nombre} src={j.jugador?.avatar_url} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{j.jugador?.nombre}</p>
                        <span className="text-[11px] text-gray-400 capitalize">
                          {j.jugador?.posicion_preferida}
                        </span>
                      </div>
                    </div>
                    {/* Eventos acumulados */}
                    <div className="flex items-center gap-1">
                      {partido.eventos
                        ?.filter((e) => e.jugador_id === j.jugador_id)
                        .map((e) => (
                          <span
                            key={e.id}
                            className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200"
                            title={`${e.tipo} min ${e.minuto}'`}
                          >
                            {e.tipo === 'gol' && '⚽'}
                            {e.tipo === 'asistencia' && '👟'}
                            {e.tipo === 'tarjeta_amarilla' && '🟨'}
                            {e.tipo === 'tarjeta_roja' && '🟥'}
                          </span>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sin equipo / Banca */}
        {sinEquipo.length > 0 && (
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Jugadores Invitados / Pendientes de asignación ({sinEquipo.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {sinEquipo.map((j) => (
                <div
                  key={j.jugador_id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={j.jugador?.nombre} size="xs" />
                    <span className="text-xs font-medium text-gray-800 truncate">
                      {j.jugador?.nombre}
                    </span>
                  </div>
                  <Badge variant={invitacionBadge[j.estado_invitacion]?.variant || 'neutral'}>
                    {invitacionBadge[j.estado_invitacion]?.label || j.estado_invitacion}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Eventos / Timeline del Partido */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Eventos y Minuto a Minuto
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Goles, asistencias, amonestaciones y expulsiones
            </p>
          </div>
          {isAdmin && (
            <Button size="sm" icon={Plus} onClick={() => setIsEventModalOpen(true)}>
              Registrar evento
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {(!partido.eventos || partido.eventos.length === 0) ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              No se han registrado eventos en este partido todavía.
            </p>
          ) : (
            [...partido.eventos]
              .sort((a, b) => a.minuto - b.minuto)
              .map((evento) => {
                const jugador = getJugador(evento.jugador_id);
                return (
                  <div
                    key={evento.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono font-bold text-gray-400 w-10 text-right">
                        {evento.minuto}'
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {eventoEmoji[evento.tipo]}
                      </span>
                      <span className="text-sm text-gray-700 font-medium">{jugador?.nombre}</span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => removeEvento(partido.id, evento.id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                        title="Eliminar evento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </Card>

      {/* Modal: Editar Estado, Resultado y MVP */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Partido y Resultado"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button form="form-edit-partido" type="submit" icon={Save}>
              Guardar cambios
            </Button>
          </div>
        }
      >
        <form id="form-edit-partido" onSubmit={handleSaveEditPartido} className="space-y-4">
          <Select
            label="Estado del partido"
            value={editForm.estado}
            onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
            options={[
              { value: 'programado', label: 'Programado' },
              { value: 'en_curso', label: 'En curso (Jugándose)' },
              { value: 'finalizado', label: 'Finalizado' },
              { value: 'cancelado', label: 'Cancelado' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Goles Equipo A"
              type="number"
              min="0"
              value={editForm.resultado_equipo_a}
              onChange={(e) => setEditForm({ ...editForm, resultado_equipo_a: e.target.value })}
            />
            <Input
              label="Goles Equipo B"
              type="number"
              min="0"
              value={editForm.resultado_equipo_b}
              onChange={(e) => setEditForm({ ...editForm, resultado_equipo_b: e.target.value })}
            />
          </div>

          <Select
            label="Elegir MVP (Mejor Jugador)"
            value={editForm.mvp_id}
            onChange={(e) => setEditForm({ ...editForm, mvp_id: e.target.value })}
            placeholder="-- Ninguno asignado --"
            options={allJugadores.map((j) => ({
              value: j.id,
              label: `${j.nombre} (${j.posicion_preferida})`,
            }))}
          />

          <Input
            label="Ubicación / Cancha"
            value={editForm.ubicacion}
            onChange={(e) => setEditForm({ ...editForm, ubicacion: e.target.value })}
          />

          <Input
            label="Link Google Maps"
            value={editForm.ubicacion_url}
            onChange={(e) => setEditForm({ ...editForm, ubicacion_url: e.target.value })}
          />
        </form>
      </Modal>

      {/* Modal: Confirmar guardado con eventos faltantes */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Faltan Goles en los Eventos"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>
              Revisar eventos
            </Button>
            <Button onClick={ejecutarGuardado} variant="primary">
              Continuar de todas formas
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-gray-700 mb-2">
              El marcador indica que hubo <strong>{(parseInt(editForm.resultado_equipo_a) || 0) + (parseInt(editForm.resultado_equipo_b) || 0)} goles</strong> en total, pero solo has registrado <strong>{(partido.eventos || []).filter(ev => ev.tipo === 'gol').length} goles</strong> en los eventos del partido.
            </p>
            <p className="text-sm text-gray-500">
              ¿Deseas guardar el resultado de todas formas sin registrar los autores de los goles faltantes?
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal: Registrar Evento */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Registrar Evento en el Partido"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsEventModalOpen(false)}>
              Cancelar
            </Button>
            <Button form="form-add-evento" type="submit" icon={Plus}>
              Agregar evento
            </Button>
          </div>
        }
      >
        <form id="form-add-evento" onSubmit={handleAddEvento} className="space-y-4">
          <Select
            label="Jugador involucrado"
            value={nuevoEvento.jugador_id}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, jugador_id: e.target.value })}
            placeholder="Seleccionar jugador"
            options={allJugadores.map((j) => ({
              value: j.id,
              label: `${j.nombre} (${j.posicion_preferida})`,
            }))}
            required
          />

          <Select
            label="Tipo de evento"
            value={nuevoEvento.tipo}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, tipo: e.target.value })}
            options={[
              { value: 'gol', label: '⚽ Gol' },
              { value: 'asistencia', label: '👟 Asistencia' },
              { value: 'tarjeta_amarilla', label: '🟨 Tarjeta Amarilla' },
              { value: 'tarjeta_roja', label: '🟥 Tarjeta Roja' },
            ]}
          />

          <Input
            label="Minuto del evento"
            type="number"
            min="1"
            max="120"
            value={nuevoEvento.minuto}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, minuto: e.target.value })}
            required
          />
        </form>
      </Modal>

      {/* Modal: Asignar Jugadores a Equipos Manualmente */}
      <Modal
        isOpen={isEquiposModalOpen}
        onClose={() => setIsEquiposModalOpen(false)}
        title="Asignación Manual de Equipos"
        size="lg"
        footer={
          <Button onClick={() => setIsEquiposModalOpen(false)}>Listo</Button>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Cambia a cada jugador de equipo o devuélvelo a la banca/sin asignar.
          </p>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {partido.jugadores?.map((j) => {
              const jugador = getJugador(j.jugador_id);
              return (
                <div
                  key={j.jugador_id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={jugador?.nombre} size="xs" />
                    <span className="text-xs font-semibold text-gray-900 truncate">
                      {jugador?.nombre}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateJugadorInvitacion(partido.id, j.jugador_id, undefined, 'equipo_a')
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        j.equipo_partido === 'equipo_a'
                          ? 'bg-nablus-primary text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Equipo A
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateJugadorInvitacion(partido.id, j.jugador_id, undefined, 'equipo_b')
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        j.equipo_partido === 'equipo_b'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Equipo B
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateJugadorInvitacion(partido.id, j.jugador_id, undefined, null)
                      }
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                        !j.equipo_partido
                          ? 'bg-gray-300 text-gray-800'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      Banca
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DetallePartidoPage;
