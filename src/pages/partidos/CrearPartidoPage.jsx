import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Link, Users, Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { Input, Select } from '../../components/ui/Input';
import { formatosPartido } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { usePartidos } from '../../context/PartidosContext';

const CrearPartidoPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, jugadores, equipo } = useAuth();
  const { createPartido } = usePartidos();

  // Protect route if user is not admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center max-w-md mx-auto">
        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900">Acceso Restringido</h2>
          <p className="text-sm text-gray-500 mt-2">
            Solo el Capitán del equipo Nablus tiene permisos para programar y crear nuevos partidos.
          </p>
          <Button onClick={() => navigate('/partidos')}>Volver a la lista de partidos</Button>
        </Card>
      </div>
    );
  }

  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: '19:00',
    ubicacion: 'Cancha Sporting Valparaíso',
    ubicacion_url: 'https://maps.google.com/?q=Sporting+Valparaiso',
    formato: '7v7',
    invitados: jugadores.map((j) => j.id), // por defecto todos seleccionados
  });

  const [selectAll, setSelectAll] = useState(true);

  const toggleJugador = (id) => {
    setForm((prev) => ({
      ...prev,
      invitados: prev.invitados.includes(id)
        ? prev.invitados.filter((i) => i !== id)
        : [...prev.invitados, id],
    }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setForm((prev) => ({ ...prev, invitados: [] }));
    } else {
      setForm((prev) => ({ ...prev, invitados: jugadores.map((j) => j.id) }));
    }
    setSelectAll(!selectAll);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const nuevo = await createPartido({
        equipo_id: equipo?.id, // ID real de Supabase (UUID)
        fecha: `${form.fecha}T${form.hora}:00`,
        ubicacion: form.ubicacion,
        ubicacion_url: form.ubicacion_url,
        estado: 'programado',
        formato: form.formato,
        created_by: user.id,
        jugadores: form.invitados.map((jugadorId) => ({
          jugador_id: jugadorId,
          equipo_partido: null,
          estado_invitacion: jugadorId === user.id ? 'confirmado' : 'pendiente',
        })),
      });

      if (nuevo && nuevo.id) {
        navigate(`/partidos/${nuevo.id}`);
      }
    } catch (error) {
      console.error('Error al crear el partido:', error);
      // En una app real, mostraríamos un toast de error aquí
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/partidos')}>
        Volver a partidos
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Programar Nuevo Partido</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Ingresa la fecha, cancha y convoca a los miembros del equipo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            Detalles del Encuentro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha del partido"
              type="date"
              icon={Calendar}
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              required
            />
            <Input
              label="Hora de inicio"
              type="time"
              value={form.hora}
              onChange={(e) => setForm({ ...form, hora: e.target.value })}
              required
            />
            <Input
              label="Nombre de la Cancha / Complejo"
              icon={MapPin}
              placeholder="Ej: Complejo Deportivo Nablus"
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
              required
            />
            <Input
              label="Link Google Maps (Opcional)"
              icon={Link}
              placeholder="https://maps.google.com/..."
              value={form.ubicacion_url}
              onChange={(e) => setForm({ ...form, ubicacion_url: e.target.value })}
            />
            <Select
              label="Formato de Juego"
              options={formatosPartido}
              value={form.formato}
              onChange={(e) => setForm({ ...form, formato: e.target.value })}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Convocatoria de Jugadores
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {form.invitados.length} de {jugadores.length} jugadores convocados
              </p>
            </div>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-bold text-nablus-primary hover:text-nablus-primary-dark transition-colors"
            >
              {selectAll ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {jugadores.map((jugador) => {
              const selected = form.invitados.includes(jugador.id);
              return (
                <button
                  key={jugador.id}
                  type="button"
                  onClick={() => toggleJugador(jugador.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left border ${
                    selected
                      ? 'bg-purple-50/60 border-purple-200'
                      : 'bg-white border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      selected
                        ? 'bg-nablus-primary border-nablus-primary text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selected && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <Avatar name={jugador.nombre} src={jugador.avatar_url} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{jugador.nombre}</p>
                    <p className="text-[11px] text-gray-400 capitalize">{jugador.posicion_preferida}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => navigate('/partidos')}>
            Cancelar
          </Button>
          <Button type="submit" icon={Plus} loading={isSubmitting}>
            {isSubmitting ? 'Programando...' : 'Crear partido y convocar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CrearPartidoPage;
