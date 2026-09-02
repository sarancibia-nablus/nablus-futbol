import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  List,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from 'lucide-react';
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

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const CalendarioPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { partidos, updateJugadorInvitacion } = usePartidos();

  const [vista, setVista] = useState('mes'); // 'mes' | 'lista'
  const [filtro, setFiltro] = useState('todos'); // 'todos' | 'mis_partidos'

  // Current month state for the calendar grid
  const [currentDate, setCurrentDate] = useState(() => {
    // If there are matches, default to the date of the first upcoming match or now
    return new Date();
  });

  // Determine participation status for user
  const getUserParticipation = (partido) => {
    const record = partido.jugadores?.find((j) => j.jugador_id === user?.id);
    if (!record) return { status: 'no_convocado', label: 'No convocado', variant: 'neutral' };
    if (record.estado_invitacion === 'confirmado')
      return { status: 'confirmado', label: 'Participas (Confirmado)', variant: 'success' };
    if (record.estado_invitacion === 'pendiente')
      return { status: 'pendiente', label: 'Invitación pendiente', variant: 'warning' };
    if (record.estado_invitacion === 'rechazado')
      return { status: 'rechazado', label: 'Rechazaste', variant: 'danger' };
    return { status: 'desconocido', label: 'Sin estado', variant: 'neutral' };
  };

  const partidosFiltrados = useMemo(() => {
    return partidos
      .filter((p) => {
        if (filtro === 'mis_partidos') {
          return p.jugadores?.some(
            (j) => j.jugador_id === user?.id && j.estado_invitacion !== 'rechazado'
          );
        }
        return true;
      })
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [partidos, filtro, user?.id]);

  // Calendar Grid Computations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const nombreMes = new Intl.DateTimeFormat('es-CL', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Build days matrix for the month
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Dom, 1 = Lun...
    // Convert to Monday = 0, Sunday = 6
    const startingDay = (firstDayIndex + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month filler days
    for (let i = startingDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const dateObj = new Date(year, month - 1, dayNum);
      cells.push({
        date: dateObj,
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateKey: dateObj.toISOString().split('T')[0],
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      cells.push({
        date: dateObj,
        dayNumber: i,
        isCurrentMonth: true,
        dateKey: dateObj.toISOString().split('T')[0],
      });
    }

    // Next month filler days to complete grid (multiples of 7)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const dateObj = new Date(year, month + 1, i);
      cells.push({
        date: dateObj,
        dayNumber: i,
        isCurrentMonth: false,
        dateKey: dateObj.toISOString().split('T')[0],
      });
    }

    return cells;
  }, [year, month]);

  // Index matches by YYYY-MM-DD
  const matchesByDate = useMemo(() => {
    const map = {};
    partidosFiltrados.forEach((p) => {
      const dateKey = new Date(p.fecha).toISOString().split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(p);
    });
    return map;
  }, [partidosFiltrados]);

  const todayKey = new Date().toISOString().split('T')[0];

  const formatFechaCompleta = (fechaStr) => {
    const d = new Date(fechaStr);
    return d.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatHora = (fechaStr) => {
    const d = new Date(fechaStr);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-nablus-primary" />
            Calendario de Partidos
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Cronograma oficial y disponibilidad de partidos del plantel Nablus
          </p>
        </div>

        {/* View Toggle & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Switcher: Mes vs Lista */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setVista('mes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                vista === 'mes'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Mes completo
            </button>
            <button
              onClick={() => setVista('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                vista === 'lista'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>
          </div>

          {/* Filter: Todos vs Mis Partidos */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filtro === 'todos'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Todos ({partidos.length})
            </button>
            <button
              onClick={() => setFiltro('mis_partidos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filtro === 'mis_partidos'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Mis partidos
            </button>
          </div>
        </div>
      </div>

      {/* VISTA 1: MES COMPLETO (GRID) */}
      {vista === 'mes' && (
        <Card className="p-5 border border-gray-200/90 shadow-sm overflow-hidden">
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-gray-900 capitalize tracking-tight">
                {nombreMes}
              </h2>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hoy
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {DIAS_SEMANA.map((dia) => (
              <div
                key={dia}
                className="py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Calendar Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell) => {
              const dayMatches = matchesByDate[cell.dateKey] || [];
              const isToday = cell.dateKey === todayKey;

              return (
                <div
                  key={cell.dateKey + cell.dayNumber}
                  className={`min-h-[120px] sm:min-h-[135px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? isToday
                        ? 'bg-nablus-primary/5 border-nablus-primary/40 ring-1 ring-nablus-primary/20'
                        : 'bg-white border-gray-200/80 hover:border-gray-300'
                      : 'bg-gray-50/60 border-gray-100 opacity-40'
                  }`}
                >
                  {/* Cell Top: Day number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-nablus-primary text-white shadow-sm'
                          : cell.isCurrentMonth
                          ? 'text-gray-800'
                          : 'text-gray-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {dayMatches.length > 0 && (
                      <span className="text-[10px] font-bold text-nablus-primary-dark bg-nablus-primary/15 px-1.5 py-0.2 rounded-full">
                        {dayMatches.length} {dayMatches.length === 1 ? 'partido' : 'partidos'}
                      </span>
                    )}
                  </div>

                  {/* Cell Body: Matches in this day */}
                  <div className="space-y-1.5 my-1 flex-1">
                    {dayMatches.map((partido) => {
                      const participacion = getUserParticipation(partido);
                      const isPending = participacion.status === 'pendiente';

                      return (
                        <div
                          key={partido.id}
                          onClick={() => navigate(`/partidos/${partido.id}`)}
                          className="group p-2 rounded-xl bg-gray-50 hover:bg-white border border-gray-200/80 hover:border-nablus-primary/60 shadow-subtle transition-all cursor-pointer text-left"
                        >
                          {/* Time & Format */}
                          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {formatHora(partido.fecha)}
                            </span>
                            <span className="text-[10px] text-gray-500 bg-gray-200/70 px-1 rounded">
                              {partido.formato}
                            </span>
                          </div>

                          {/* Location & Status */}
                          <div className="text-[11px] font-medium text-gray-800 truncate mt-1">
                            {partido.ubicacion}
                          </div>

                          {/* Badges / Actions */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1 justify-between">
                            <Badge
                              variant={estadoBadge[partido.estado]?.variant || 'neutral'}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {estadoBadge[partido.estado]?.label || partido.estado}
                            </Badge>

                            {/* User participation icon */}
                            {participacion.status === 'confirmado' && (
                              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5" title="Asistencia confirmada">
                                <CheckCircle2 className="w-3 h-3" />
                              </span>
                            )}
                            {participacion.status === 'rechazado' && (
                              <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5" title="Rechazado">
                                <XCircle className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          {/* Quick confirm button if pending inside cell */}
                          {isPending && partido.estado === 'programado' && (
                            <div className="mt-1.5 pt-1 border-t border-gray-200/60 flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateJugadorInvitacion(partido.id, user.id, 'confirmado');
                                }}
                                className="flex-1 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold text-center transition-colors"
                              >
                                Confirmar
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Cell Bottom Empty placeholder */}
                  {dayMatches.length === 0 && <div className="h-4" />}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* VISTA 2: LISTA CRONOLÓGICA (TIMELINE) */}
      {vista === 'lista' && (
        <div className="space-y-4">
          {partidosFiltrados.length === 0 ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center">
              <CalendarDays className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-700">No hay partidos programados</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                {isAdmin
                  ? 'Como Capitán, puedes programar un nuevo encuentro para Nablus FC.'
                  : 'El Capitán del equipo aún no ha programado partidos.'}
              </p>
              {isAdmin && (
                <Button icon={Plus} onClick={() => navigate('/partidos/crear')} className="mt-4" size="sm">
                  Crear partido
                </Button>
              )}
            </Card>
          ) : (
            partidosFiltrados.map((partido) => {
              const participacion = getUserParticipation(partido);
              const isPending = participacion.status === 'pendiente';
              const confirmadosCount =
                partido.jugadores?.filter((j) => j.estado_invitacion === 'confirmado').length || 0;
              const totalCount = partido.jugadores?.length || 0;

              return (
                <Card
                  key={partido.id}
                  hover
                  className="p-6 transition-all border border-gray-200/90 hover:border-nablus-primary/60"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left: Date block + Details */}
                    <div className="flex items-start gap-4">
                      {/* Date Block */}
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center shrink-0">
                        <span className="text-[10px] font-bold uppercase text-gray-400">
                          {new Date(partido.fecha).toLocaleDateString('es-CL', { month: 'short' })}
                        </span>
                        <span className="text-xl font-extrabold text-gray-900 leading-none">
                          {new Date(partido.fecha).getDate()}
                        </span>
                      </div>

                      {/* Match Info */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Estado del partido */}
                          <Badge variant={estadoBadge[partido.estado]?.variant || 'neutral'}>
                            {estadoBadge[partido.estado]?.label || partido.estado}
                          </Badge>
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                            {partido.formato}
                          </span>

                          {/* DISTINTIVO DE PARTICIPACIÓN DEL USUARIO */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${
                              participacion.status === 'confirmado'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : participacion.status === 'pendiente'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                                : participacion.status === 'rechazado'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            {participacion.status === 'confirmado' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            {participacion.status === 'pendiente' && (
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            {participacion.status === 'rechazado' && (
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            {participacion.label}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 capitalize">
                          {formatFechaCompleta(partido.fecha)}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {formatHora(partido.fecha)} hrs
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {partido.ubicacion}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            {confirmadosCount}/{totalCount} confirmados
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick actions / Score */}
                    <div className="flex flex-wrap items-center gap-3 justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                      {/* If finished, show score */}
                      {partido.estado === 'finalizado' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 mr-2">
                          <span className="text-xs text-gray-400 font-medium">Resultado:</span>
                          <span className="font-mono font-bold text-base text-gray-900">
                            {partido.resultado_equipo_a} - {partido.resultado_equipo_b}
                          </span>
                        </div>
                      )}

                      {/* Quick confirm / reject buttons if pending */}
                      {isPending && partido.estado === 'programado' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateJugadorInvitacion(partido.id, user.id, 'confirmado')
                            }
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirmar asistencia
                          </button>
                          <button
                            onClick={() =>
                              updateJugadorInvitacion(partido.id, user.id, 'rechazado')
                            }
                            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}

                      {/* Ver detalle button */}
                      <Button
                        variant="secondary"
                        size="sm"
                        iconRight={ArrowRight}
                        onClick={() => navigate(`/partidos/${partido.id}`)}
                      >
                        Ver detalle
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarioPage;

