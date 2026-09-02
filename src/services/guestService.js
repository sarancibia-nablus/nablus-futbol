import { createClient } from '@supabase/supabase-js';

// Usamos la Service Role Key para crear usuarios sin necesidad de confirmación y sin desloguear al admin.
// NOTA: En un entorno de producción estricto, esto debería moverse a una Edge Function.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Como es un entorno Vite, leemos la variable (debe exponerse en .env si es necesario, o podemos inyectarla)
// En .env actual tenemos SUPABASE_SERVICE_ROLE_KEY sin VITE_, así que podemos tener un problema.
// Vamos a requerir que la expongan como VITE_SUPABASE_SERVICE_ROLE_KEY.
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

let adminSupabase = null;
if (supabaseUrl && serviceRoleKey) {
  adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const createGuestUser = async (nombre, posicion_preferida, email = null) => {
  if (!adminSupabase) {
    throw new Error('Falta la configuración de administrador para crear invitados.');
  }

  // Generamos un correo único para el invitado
  const guestEmail = email || `guest_${Date.now()}@nablus.cl`;
  
  // Creamos el usuario directamente en auth.users (el trigger lo pasará a public.users)
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email: guestEmail,
    email_confirm: true,
    user_metadata: {
      nombre,
      posicion_preferida,
      is_guest: true, // Flag para diferenciar
    },
  });

  if (error) {
    throw error;
  }

  return data.user;
};

export const deleteGuestUser = async (userId) => {
  if (!adminSupabase) {
    throw new Error('Falta la configuración de administrador.');
  }
  
  const { error } = await adminSupabase.auth.admin.deleteUser(userId);
  if (error) throw error;
  
  return true;
};
