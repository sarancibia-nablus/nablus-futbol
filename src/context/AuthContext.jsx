import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbService } from '../services/dbService';

const LOCAL_STORAGE_AUTH_USER = 'nablus_auth_user_id';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [jugadores, setJugadores] = useState([]);
  const [plantel, setPlantel] = useState([]);
  const [invitados, setInvitados] = useState([]);
  const [user, setUser] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load session and real database data on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      setLoading(true);
      try {
        const [fetchedJugadores, fetchedEquipo] = await Promise.all([
          dbService.getJugadores(),
          dbService.getEquipo(),
        ]);

        if (isMounted) {
          const allJugadores = fetchedJugadores || [];
          setJugadores(allJugadores);
          setPlantel(allJugadores.filter(j => !j.email?.startsWith('guest_')));
          setInvitados(allJugadores.filter(j => j.email?.startsWith('guest_')));
          setEquipo(fetchedEquipo || null);

          // 1. Check Supabase session first
          if (isSupabaseConfigured) {
            const { data: sessionData } = await supabase.auth.getSession();
            const currentAuthUser = sessionData?.session?.user;

            if (currentAuthUser) {
              // Fetch user profile from public.users
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', currentAuthUser.id)
                .maybeSingle();

              const resolvedUser = profile || (fetchedJugadores || []).find(
                (j) => j.id === currentAuthUser.id || j.email?.toLowerCase() === currentAuthUser.email?.toLowerCase()
              ) || {
                id: currentAuthUser.id,
                email: currentAuthUser.email,
                nombre: currentAuthUser.user_metadata?.nombre || currentAuthUser.email.split('@')[0],
                posicion_preferida: currentAuthUser.user_metadata?.posicion_preferida || 'mediocampo',
                es_admin: Boolean(currentAuthUser.user_metadata?.es_admin || currentAuthUser.email.includes('sarancibia')),
              };

              setUser(resolvedUser);
              setIsAuthenticated(true);
              localStorage.setItem(LOCAL_STORAGE_AUTH_USER, resolvedUser.id);
              setLoading(false);
              return;
            }
          }

          // 2. Check local stored authenticated user ID
          const storedUserId = localStorage.getItem(LOCAL_STORAGE_AUTH_USER);
          if (storedUserId && fetchedJugadores && fetchedJugadores.length > 0) {
            const matched = fetchedJugadores.find((j) => j.id === storedUserId);
            if (matched) {
              setUser(matched);
              setIsAuthenticated(true);
              setLoading(false);
              return;
            }
          }

          // If no active session found:
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error inicializando autenticación:', err);
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // Supabase auth state listener
    let authListener = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user && isMounted) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const activeUser = profile || {
            id: session.user.id,
            email: session.user.email,
            nombre: session.user.user_metadata?.nombre || session.user.email.split('@')[0],
            posicion_preferida: session.user.user_metadata?.posicion_preferida || 'mediocampo',
            es_admin: Boolean(session.user.user_metadata?.es_admin || session.user.email.includes('sarancibia')),
          };

          setUser(activeUser);
          setIsAuthenticated(true);
          localStorage.setItem(LOCAL_STORAGE_AUTH_USER, activeUser.id);
        } else if (event === 'SIGNED_OUT' && isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem(LOCAL_STORAGE_AUTH_USER);
        }
      });
      authListener = data.subscription;
    }

    return () => {
      isMounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  // Is current logged in user an admin / capitan?
  const isAdmin = Boolean(user?.es_admin);
  const isCapitan = isAdmin;

  // Quick switch user (for captain testing squad profiles)
  const switchUser = (userId) => {
    const target = jugadores.find((j) => j.id === userId);
    if (target) {
      setUser(target);
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_AUTH_USER, target.id);
    }
  };

  const seedDatabase = async () => {
    setLoading(true);
    await dbService.seedInitialData();
    const [fetchedJugadores, fetchedEquipo] = await Promise.all([
      dbService.getJugadores(),
      dbService.getEquipo(),
    ]);
    setJugadores(fetchedJugadores || []);
    setPlantel((fetchedJugadores || []).filter(j => !j.email?.startsWith('guest_')));
    setInvitados((fetchedJugadores || []).filter(j => j.email?.startsWith('guest_')));
    setEquipo(fetchedEquipo || null);
    if (fetchedJugadores && fetchedJugadores.length > 0) {
      setUser(fetchedJugadores[0]);
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_AUTH_USER, fetchedJugadores[0].id);
    }
    setLoading(false);
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setLoading(false);
        let msg = error.message;
        if (error.message.includes('Invalid login credentials')) {
          msg = 'Correo o contraseña incorrectos. Por favor verifica tus credenciales.';
        } else if (error.message.includes('Email not confirmed')) {
          msg = 'Tu correo está pendiente de confirmación.';
        }
        return { success: false, error: msg };
      }

      if (data?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const activeProfile = profile || {
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.user_metadata?.nombre || cleanEmail.split('@')[0],
          posicion_preferida: data.user.user_metadata?.posicion_preferida || 'mediocampo',
          es_admin: Boolean(data.user.user_metadata?.es_admin || cleanEmail.includes('sarancibia')),
        };

        setUser(activeProfile);
        setIsAuthenticated(true);
        localStorage.setItem(LOCAL_STORAGE_AUTH_USER, activeProfile.id);
      }
      setLoading(false);
      return { success: true };
    }

    // Direct squad email login fallback
    const all = await dbService.getJugadores();
    const found = all.find((j) => j.email?.toLowerCase() === cleanEmail);
    if (found) {
      setUser(found);
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_AUTH_USER, found.id);
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
  };

  // Register / Sign Up
  const register = async (email, password, metadata = {}) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const isCapitanRole = cleanEmail.includes('sarancibia') || Boolean(metadata.es_admin);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            nombre: metadata.nombre || cleanEmail.split('@')[0],
            posicion_preferida: metadata.posicion_preferida || 'mediocampo',
            fecha_nacimiento: metadata.fecha_nacimiento || null,
            es_admin: isCapitanRole,
          },
        },
      });

      if (error) {
        setLoading(false);
        let msg = error.message;
        if (error.message.includes('User already registered')) {
          msg = 'Este correo ya se encuentra registrado. Por favor ve a Iniciar sesión.';
        }
        return { success: false, error: msg };
      }

      if (data.user) {
        const newProfile = {
          id: data.user.id,
          email: cleanEmail,
          nombre: metadata.nombre || cleanEmail.split('@')[0],
          posicion_preferida: metadata.posicion_preferida || 'mediocampo',
          fecha_nacimiento: metadata.fecha_nacimiento || null,
          avatar_url: null,
          es_admin: isCapitanRole,
        };

        setUser(newProfile);
        setIsAuthenticated(true);
        localStorage.setItem(LOCAL_STORAGE_AUTH_USER, newProfile.id);
      }
      setLoading(false);
      return { success: true };
    }

    // Offline / Local registration
    const newPlayer = {
      id: 'u_' + Date.now(),
      email: cleanEmail,
      nombre: metadata.nombre || cleanEmail.split('@')[0],
      posicion_preferida: metadata.posicion_preferida || 'mediocampo',
      fecha_nacimiento: metadata.fecha_nacimiento || '1995-01-01',
      avatar_url: null,
      es_admin: isCapitanRole,
    };
    const updated = [...jugadores, newPlayer];
    setJugadores(updated);
    setPlantel(updated.filter(j => !j.email?.startsWith('guest_')));
    setInvitados(updated.filter(j => j.email?.startsWith('guest_')));
    setUser(newPlayer);
    setIsAuthenticated(true);
    localStorage.setItem(LOCAL_STORAGE_AUTH_USER, newPlayer.id);
    await dbService.updateUser(newPlayer.id, newPlayer);
    setLoading(false);
    return { success: true };
  };

  // Reset Password
  const resetPassword = async (email) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin + '/actualizar-password',
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
    return { success: true, message: 'Enlace enviado a ' + email };
  };

  // Change Password
  const changePassword = async (newPassword) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
    return { success: true };
  };

  // Logout
  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_STORAGE_AUTH_USER);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update Profile
  const updateUserProfile = async (updatedData) => {
    if (!user) return { success: false };
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    await dbService.updateUser(user.id, updatedData);
    setJugadores((prev) => {
      const next = prev.map((j) => (j.id === updatedUser.id ? { ...j, ...updatedData } : j));
      setPlantel(next.filter(j => !j.email?.startsWith('guest_')));
      setInvitados(next.filter(j => j.email?.startsWith('guest_')));
      return next;
    });
    return { success: true };
  };

  // Update Equipo
  const updateEquipoInfo = async (updatedData) => {
    if (!equipo) return { success: false };
    const updatedEquipo = { ...equipo, ...updatedData };
    setEquipo(updatedEquipo);
    await dbService.updateEquipo(equipo.id, updatedData);
    return { success: true };
  };

  // Set Role (Capitán can promote/demote members)
  const setRole = async (userId, es_admin) => {
    await dbService.updateUser(userId, { es_admin });
    setJugadores((prev) => {
      const next = prev.map((j) => (j.id === userId ? { ...j, es_admin } : j));
      setPlantel(next.filter(j => !j.email?.startsWith('guest_')));
      setInvitados(next.filter(j => j.email?.startsWith('guest_')));
      return next;
    });
    if (user?.id === userId) {
      setUser((prev) => ({ ...prev, es_admin }));
    }
    return { success: true };
  };

  // Remove Jugador (Admin)
  const removeJugador = async (userId) => {
    await dbService.deleteJugador(userId);
    setJugadores((prev) => {
      const next = prev.filter((j) => j.id !== userId);
      setPlantel(next.filter(j => !j.email?.startsWith('guest_')));
      setInvitados(next.filter(j => j.email?.startsWith('guest_')));
      return next;
    });
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isCapitan,
        equipo,
        jugadores,
        plantel,
        invitados,
        isAuthenticated,
        loading,
        login,
        register,
        resetPassword,
        changePassword,
        logout,
        switchUser,
        updateUserProfile,
        updateEquipoInfo,
        setRole,
        removeJugador,
        seedDatabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
