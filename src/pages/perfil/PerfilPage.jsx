import { useState } from 'react';
import { User, Mail, Calendar, Shield, Save, CheckCircle2, Lock, ShieldCheck, Users, AlertCircle, Camera, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { posiciones } from '../../data/mockData';
import { dbService } from '../../services/dbService';
import imageCompression from 'browser-image-compression';

const PerfilPage = () => {
  const { user, isAdmin, jugadores, updateUserProfile, changePassword, setRole } = useAuth();

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    fecha_nacimiento: user?.fecha_nacimiento || '',
    posicion_preferida: user?.posicion_preferida || 'mediocampo',
    avatar_url: user?.avatar_url || '',
    passwordActual: '',
    passwordNuevo: '',
    passwordConfirm: '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [roleChangeMsg, setRoleChangeMsg] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSavedSuccess(false);
    setPasswordError('');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      // Comprimir la imagen antes de subir (Máx 500KB, max 800px)
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      
      // Subir a Supabase Storage y actualizar tabla
      const updatedUser = await dbService.uploadAvatar(compressedFile, user.id);
      
      // Actualizar el estado del formulario y forzar re-render de context si es necesario
      setFormData(prev => ({ ...prev, avatar_url: updatedUser.avatar_url }));
      
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (error) {
      console.error('Error al subir foto:', error);
      alert(`Hubo un error al subir la foto: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);

    await updateUserProfile({
      nombre: formData.nombre,
      email: formData.email,
      fecha_nacimiento: formData.fecha_nacimiento,
      posicion_preferida: formData.posicion_preferida,
      avatar_url: formData.avatar_url || null,
    });

    setLoadingProfile(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!formData.passwordNuevo) {
      setPasswordError('Ingresa una nueva contraseña');
      return;
    }

    if (formData.passwordNuevo !== formData.passwordConfirm) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (formData.passwordNuevo.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoadingPass(true);
    const result = await changePassword(formData.passwordNuevo);
    setLoadingPass(false);

    if (result.success) {
      setPasswordSuccess(true);
      setFormData((prev) => ({ ...prev, passwordActual: '', passwordNuevo: '', passwordConfirm: '' }));
      setTimeout(() => setPasswordSuccess(false), 4000);
    } else {
      setPasswordError(result.error || 'Error al actualizar contraseña');
    }
  };

  const handleToggleRole = async (targetUser) => {
    const newRole = !targetUser.es_admin;
    await setRole(targetUser.id, newRole);
    setRoleChangeMsg(
      `Rol de ${targetUser.nombre} actualizado a: ${newRole ? 'Administrador' : 'Jugador'}`
    );
    setTimeout(() => setRoleChangeMsg(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Administra tu información personal, posición, credenciales y permisos
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>¡Tu información de perfil ha sido actualizada con éxito!</span>
        </div>
      )}

      {/* Formulario de Perfil */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        {/* Card Foto y Resumen */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar name={formData.nombre || user?.nombre} src={formData.avatar_url} size="xl" />
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-bold text-gray-900">{formData.nombre || 'Tu Nombre'}</h2>
                <Badge variant={isAdmin ? 'primary' : 'neutral'}>
                  {isAdmin ? 'Capitán' : 'Jugador'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{formData.email}</p>
              <div className="pt-2">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Foto de Perfil</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={isUploadingPhoto ? Loader2 : Camera}
                    className={isUploadingPhoto ? 'animate-pulse' : ''}
                    onClick={() => document.getElementById('avatar-upload').click()}
                  >
                    {isUploadingPhoto ? 'Subiendo...' : 'Subir Foto'}
                  </Button>
                  {isUploadingPhoto && <span className="text-xs text-gray-500 font-medium">Optimizando y subiendo...</span>}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Datos Personales y Deportivos */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-nablus-primary" />
            Información personal y deportiva
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre completo"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              icon={User}
              required
            />
            <Input
              label="Correo electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />
            <Input
              label="Fecha de nacimiento"
              name="fecha_nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              icon={Calendar}
              required
            />
            <Select
              label="Posición de juego preferida"
              name="posicion_preferida"
              value={formData.posicion_preferida}
              onChange={handleChange}
              options={posiciones}
            />
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <Button type="submit" icon={Save} loading={loadingProfile}>
              Guardar información
            </Button>
          </div>
        </Card>
      </form>

      {/* Seguridad / Contraseña */}
      <form onSubmit={handlePasswordSubmit}>
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-nablus-primary" />
            Cambiar contraseña
          </h2>

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Contraseña actualizada correctamente en Supabase Auth.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nueva contraseña"
              name="passwordNuevo"
              type="password"
              placeholder="••••••••"
              value={formData.passwordNuevo}
              onChange={handleChange}
              icon={Lock}
            />
            <Input
              label="Confirmar nueva contraseña"
              name="passwordConfirm"
              type="password"
              placeholder="••••••••"
              value={formData.passwordConfirm}
              onChange={handleChange}
              icon={Lock}
              error={passwordError}
            />
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <Button type="submit" variant="secondary" loading={loadingPass}>
              Actualizar contraseña
            </Button>
          </div>
        </Card>
      </form>

      {/* PANEL DE GESTIÓN DE ROLES (Exclusivo Capitán) */}
      {isAdmin && (
        <Card className="p-6 border-nablus-primary/30 shadow-subtle">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-nablus-primary" />
                Gestión de Roles del Plantel (Panel del Capitán)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Asigna privilegios de Capitán o Jugador a cada miembro del equipo.
              </p>
            </div>
            <Badge variant="primary">{jugadores.length} miembros</Badge>
          </div>

          {roleChangeMsg && (
            <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-nablus-primary shrink-0" />
              <span>{roleChangeMsg}</span>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {jugadores.map((member) => (
              <div key={member.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={member.nombre} src={member.avatar_url} size="sm" />
                  <div>
                    <div className="font-bold text-sm text-gray-900">{member.nombre}</div>
                    <div className="text-xs text-gray-400">
                      {member.email} • <span className="capitalize">{member.posicion_preferida}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={member.es_admin ? 'primary' : 'neutral'}>
                    {member.es_admin ? 'Capitán' : 'Jugador'}
                  </Badge>

                  {/* Toggle Role Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleRole(member)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      member.es_admin
                        ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        : 'bg-nablus-primary/10 text-nablus-primary-dark border-nablus-primary/30 hover:bg-nablus-primary/20'
                    }`}
                  >
                    {member.es_admin ? 'Degradar a Jugador' : 'Promover a Capitán'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PerfilPage;
