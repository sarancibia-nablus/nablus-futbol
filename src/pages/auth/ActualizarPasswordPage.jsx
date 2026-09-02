import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, CheckCircle2, Save } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const ActualizarPasswordPage = () => {
  const navigate = useNavigate();
  const { changePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    
    const result = await changePassword(password);

    if (result.success) {
      setSuccess(true);
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al actualizar la contraseña.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-nablus-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10 animate-fade-in-up">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-gray-800 to-gray-900 text-white mb-4 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Actualizar Contraseña</h2>
          <p className="mt-2 text-sm text-gray-500">
            Ingresa tu nueva contraseña para acceder a tu cuenta.
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-xl border-gray-100/60 backdrop-blur-sm bg-white/90">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-shake">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">¡Contraseña actualizada!</h3>
              <p className="text-sm text-gray-500">
                Tu contraseña ha sido cambiada exitosamente. Ya puedes acceder al sistema.
              </p>
              <div className="pt-4">
                <Button variant="primary" onClick={() => navigate('/dashboard')} className="w-full">
                  Ir al Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Nueva Contraseña"
                type="password"
                icon={Lock}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirmar Contraseña"
                type="password"
                icon={Lock}
                placeholder="Vuelve a escribir tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button type="submit" className="w-full" size="lg" loading={loading} icon={Save}>
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ActualizarPasswordPage;
