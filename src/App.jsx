import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PartidosProvider } from './context/PartidosContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import CalendarioPage from './pages/calendario/CalendarioPage';
import JugadoresPage from './pages/jugadores/JugadoresPage';
import JugadorPerfilPage from './pages/jugadores/JugadorPerfilPage';
import PartidosPage from './pages/partidos/PartidosPage';
import CrearPartidoPage from './pages/partidos/CrearPartidoPage';
import DetallePartidoPage from './pages/partidos/DetallePartidoPage';
import DisponibilidadPage from './pages/disponibilidad/DisponibilidadPage';
import EstadisticasPage from './pages/estadisticas/EstadisticasPage';
import PerfilPage from './pages/perfil/PerfilPage';
import EquipoPage from './pages/equipo/EquipoPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-nablus-primary animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Verificando sesión...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-nablus-primary animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Cargando Fútbol Nablus...</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/calendario" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/calendario" replace />} />
        <Route path="calendario" element={<CalendarioPage />} />
        <Route path="jugadores" element={<JugadoresPage />} />
        <Route path="jugadores/:id" element={<JugadorPerfilPage />} />
        <Route path="partidos" element={<PartidosPage />} />
        <Route path="partidos/crear" element={<CrearPartidoPage />} />
        <Route path="partidos/:id" element={<DetallePartidoPage />} />
        <Route path="disponibilidad" element={<DisponibilidadPage />} />
        <Route path="estadisticas" element={<EstadisticasPage />} />
        <Route path="equipo" element={<EquipoPage />} />
        <Route path="perfil" element={<PerfilPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/calendario" : "/login"} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PartidosProvider>
          <AppRoutes />
        </PartidosProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
