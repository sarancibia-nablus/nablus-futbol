import { useState, useMemo } from 'react';
import {
  Shield,
  Edit,
  Save,
  Globe,
  Mail,
  Trophy,
  Target,
  CalendarDays,
  Activity,
  Users,
  Camera,
  Star
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { usePartidos } from '../../context/PartidosContext';
import { dbService } from '../../services/dbService';
import ImageCropperModal from '../../components/ui/ImageCropperModal';
import { calculateTeamStats } from '../../services/statsService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const RankingList = ({ title, data, statKey, icon: Icon, colorClass }) => (
  <Card className="p-5 border border-gray-200/90 shadow-sm">
    <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
      <Icon className={`w-4 h-4 ${colorClass}`} />
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
    </div>
    <div className="space-y-3">
      {data.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Aún no hay datos suficientes.</p>
      ) : (
        data.map((item, index) => (
          <div key={item.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-6 text-center font-bold text-gray-400 text-xs">
                #{index + 1}
              </div>
              <Avatar name={item.nombre} src={item.avatar_url} size="sm" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">{item.nombre}</span>
                <span className="text-[10px] text-gray-400 capitalize">{item.posicion_preferida}</span>
              </div>
            </div>
            <span className="text-base font-black font-mono text-gray-900">
              {item.stats?.[statKey] || 0}
            </span>
          </div>
        ))
      )}
    </div>
  </Card>
);

const EquipoPage = () => {
  const { equipo, isAdmin, updateEquipoInfo, jugadores } = useAuth();
  const { partidos } = usePartidos();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: equipo?.nombre || '',
    descripcion: equipo?.descripcion || '',
    sitio_web: equipo?.sitio_web || '',
    email_contacto: equipo?.email_contacto || '',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    await updateEquipoInfo(editForm);
    setIsEditing(false);
  };

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setCropModalOpen(true);
      e.target.value = ''; // Reset input
    }
  };

  const handleCropComplete = async (croppedFile) => {
    const url = await dbService.uploadLogoEquipo(equipo.id, croppedFile);
    if (url) {
      await updateEquipoInfo({ logo_url: url });
    }
    setCropModalOpen(false);
    setImageSrc(null);
  };

  // Cálculo de estadísticas globales
  const teamStats = useMemo(() => calculateTeamStats(jugadores, partidos), [jugadores, partidos]);
  const programados = partidos.filter(p => p.estado === 'programado');
  const proximoPartido = programados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];

  if (!equipo) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-nablus-primary" />
            Mi Equipo y Estadísticas Globales
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Identidad del club y rankings de rendimiento de todo el plantel
          </p>
        </div>

        {isAdmin && !isEditing && (
          <Button variant="secondary" icon={Edit} onClick={() => setIsEditing(true)}>
            Editar Info
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lado izquierdo: Identidad del equipo */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 text-center border border-gray-200/90 shadow-sm relative overflow-hidden">
            {/* Elemento de diseño de fondo */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-nablus-primary/20 to-gray-50 -z-10" />
            
            <div className="flex flex-col items-center mt-4">
              <div className="relative group w-24 h-24 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2 mb-4">
                {equipo.logo_url ? (
                  <img src={equipo.logo_url} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <Shield className="w-12 h-12 text-nablus-primary" />
                )}
                {isAdmin && (
                  <label className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{equipo.nombre}</h2>
              <p className="text-sm text-gray-500 mt-2 whitespace-pre-line leading-relaxed">
                {equipo.descripcion || 'Sin descripción oficial asignada.'}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              {equipo.sitio_web && (
                <a
                  href={equipo.sitio_web.startsWith('http') ? equipo.sitio_web : `https://${equipo.sitio_web}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-nablus-primary hover:text-nablus-primary-dark font-medium transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {equipo.sitio_web.replace(/^https?:\/\//, '')}
                </a>
              )}
              {equipo.email_contacto && (
                <a
                  href={`mailto:${equipo.email_contacto}`}
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {equipo.email_contacto}
                </a>
              )}
            </div>
          </Card>

          {/* Panel de Edición Admin */}
          {isAdmin && isEditing && (
            <Card className="p-5 border border-nablus-primary/30 ring-1 ring-nablus-primary/10 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Edit className="w-4 h-4 text-nablus-primary" />
                Actualizar Datos del Club
              </h3>
              <form onSubmit={handleSave} className="space-y-4">
                <Input
                  label="Nombre del Equipo"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  required
                />
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Descripción
                  </label>
                  <textarea
                    rows="3"
                    className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-nablus-primary focus:border-nablus-primary block p-2.5 outline-none transition-all resize-none shadow-sm"
                    value={editForm.descripcion}
                    onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                  />
                </div>
                <Input
                  label="Sitio Web (Opcional)"
                  value={editForm.sitio_web}
                  placeholder="www.nablus.cl"
                  onChange={(e) => setEditForm({ ...editForm, sitio_web: e.target.value })}
                />
                <Input
                  label="Email de Contacto"
                  type="email"
                  value={editForm.email_contacto}
                  onChange={(e) => setEditForm({ ...editForm, email_contacto: e.target.value })}
                />
                
                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button variant="secondary" type="button" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" icon={Save}>Guardar</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Próximo Partido Card */}
          <Card className="p-5 border border-gray-200/90 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <CalendarDays className="w-4 h-4 text-nablus-primary" />
              Próximo Encuentro
            </h3>
            
            {proximoPartido ? (
              <div className="flex-1 flex flex-col justify-center text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs font-bold text-nablus-primary uppercase tracking-widest mb-2">
                  {new Date(proximoPartido.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="text-xl font-black text-gray-900 mb-1">
                  {proximoPartido.ubicacion || 'Por definir'}
                </div>
                <div className="text-sm font-semibold text-gray-500">
                  Formato: {proximoPartido.formato}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
                <CalendarDays className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-500">Sin partidos programados</p>
              </div>
            )}
          </Card>
        </div>

        {/* Lado derecho: Tablero de Estadísticas y Rankings */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tarjetas de Métricas KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 border border-gray-100 flex flex-col items-center text-center justify-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Partidos</span>
              <span className="text-3xl font-black text-gray-900 mt-1">{teamStats.totals.partidos}</span>
            </Card>

            <Card className="p-4 border border-gray-100 flex flex-col items-center text-center justify-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Goles</span>
              <span className="text-3xl font-black text-gray-900 mt-1">{teamStats.totals.goles}</span>
            </Card>
            
            <Card className="p-4 border border-gray-100 flex flex-col items-center text-center justify-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Asistencias</span>
              <span className="text-3xl font-black text-gray-900 mt-1">{teamStats.totals.asistencias}</span>
            </Card>

            <Card className="p-4 border border-gray-100 flex flex-col items-center text-center justify-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Plantilla</span>
              <span className="text-3xl font-black text-gray-900 mt-1">{jugadores.length}</span>
            </Card>
          </div>
          
          {/* Gráfico Aporte por Posición */}
          <Card className="p-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              Aporte Ofensivo por Posición (Goles vs Asistencias)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamStats.golesPorPosicion} barSize={22}>
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

          {/* Grid de Rankings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <RankingList title="Goleadores Históricos" data={teamStats.topGoleadores} statKey="goles" icon={Target} colorClass="text-nablus-primary" />
            <RankingList title="Top Asistidores" data={teamStats.topAsistidores} statKey="asistencias" icon={Trophy} colorClass="text-emerald-600" />
            <RankingList title="Más Presencias (Partidos)" data={teamStats.masPartidos} statKey="partidos" icon={Users} colorClass="text-blue-600" />
            <RankingList title="Máximos MVPs" data={teamStats.topMVPs} statKey="mvps" icon={Star} colorClass="text-amber-500" />
          </div>

        </div>
      </div>

      <ImageCropperModal
        isOpen={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false);
          setImageSrc(null);
        }}
        imageSrc={imageSrc}
        onCropComplete={handleCropComplete}
        title="Recortar Logo del Equipo"
      />
    </div>
  );
};

export default EquipoPage;
