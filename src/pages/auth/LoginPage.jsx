import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Calendar, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import NablusLogo from '../../components/shared/NablusLogo';
import { useAuth } from '../../context/AuthContext';
import { posiciones } from '../../data/mockData';

const LoginPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [posicion, setPosicion] = useState('mediocampo');
  const [fechaNacimiento, setFechaNacimiento] = useState('1992-04-15');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.success) {
          navigate('/calendario');
        } else {
          setError(result.error || 'Error al iniciar sesión');
        }
      } else if (mode === 'register') {
        if (!nombre.trim()) {
          setError('Por favor ingresa tu nombre completo');
          setLoading(false);
          return;
        }
        const isCapitan = email.toLowerCase().includes('sarancibia') || email.toLowerCase().includes('admin');
        const result = await register(email, password, {
          nombre,
          posicion_preferida: posicion,
          fecha_nacimiento: fechaNacimiento,
          es_admin: isCapitan,
        });
        if (result.success) {
          navigate('/calendario');
        } else {
          setError(result.error || 'Error al registrar la cuenta');
        }
      } else if (mode === 'forgot') {
        const result = await resetPassword(email);
        if (result.success) {
          setSuccessMsg('Se ha enviado un enlace de recuperación a tu correo electrónico.');
        } else {
          setError(result.error || 'No se pudo enviar el correo de recuperación');
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 relative">
      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-subtle flex items-center justify-center mb-3">
            <NablusLogo className="h-9 w-auto" showText={false} variant="primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fútbol Nablus</h1>
          <p className="text-sm text-gray-500 mt-1">Plataforma interna de gestión deportiva</p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-card p-7">
          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl mb-6 border border-gray-200/80">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Registrarme
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recuperar contraseña</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Ingresa tu correo para recibir las instrucciones de restablecimiento.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <Input
                  label="Nombre completo"
                  type="text"
                  icon={User}
                  placeholder="Ej: Nicolás Morales"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Posición"
                    options={posiciones}
                    value={posicion}
                    onChange={(e) => setPosicion(e.target.value)}
                  />
                  <Input
                    label="F. Nacimiento"
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <Input
              label="Correo electrónico"
              type="email"
              icon={Mail}
              placeholder="tu@nablus.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {mode !== 'forgot' && (
              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                  }}
                  className="text-xs font-semibold text-nablus-primary-dark hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium animate-shake">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2" iconRight={ArrowRight}>
              {mode === 'login'
                ? 'Ingresar al sistema'
                : mode === 'register'
                ? 'Completar registro'
                : 'Enviar enlace de recuperación'}
            </Button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-900 pt-2 block"
              >
                Volver a Iniciar sesión
              </button>
            )}
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <span className="text-[11px] text-gray-400">
              Acceso seguro con autenticación de Supabase • Fútbol Nablus
            </span>
          </div>
        </div>
      </div>

      {/* Overlay de Carga Leve */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-fade-in">
          <div className="w-10 h-10 border-4 border-nablus-primary/20 border-t-nablus-primary rounded-full animate-spin"></div>
          <span className="mt-3 text-sm font-semibold text-nablus-primary-dark">Conectando...</span>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
