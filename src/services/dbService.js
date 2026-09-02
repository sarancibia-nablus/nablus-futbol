import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { jugadoresMock, partidosMock, equipoMock, disponibilidadMock } from '../data/mockData';

const LOCAL_STORAGE_KEY_JUGADORES = 'nablus_db_jugadores';
const LOCAL_STORAGE_KEY_PARTIDOS = 'nablus_db_partidos';
const LOCAL_STORAGE_KEY_EQUIPO = 'nablus_db_equipo';
const LOCAL_STORAGE_KEY_DISP = 'nablus_db_disp';

/**
 * Servicio de Base de Datos para Supabase y persistencia real
 */
export const dbService = {
  // 1. Equipos
  async getEquipo() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('equipos').select('*').limit(1).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Error querying equipos from Supabase:', err);
      }
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_EQUIPO);
    return local ? JSON.parse(local) : { id: 'eq_nablus', nombre: 'Nablus FC', email_contacto: 'contacto@nablus.cl' };
  },

  async updateEquipo(id, updates) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('equipos')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Error updating equipo in Supabase:', err);
      }
    }
    const current = await this.getEquipo();
    const updated = { ...current, ...updates };
    localStorage.setItem(LOCAL_STORAGE_KEY_EQUIPO, JSON.stringify(updated));
    return updated;
  },

  async uploadLogoEquipo(equipoId, file) {
    if (!isSupabaseConfigured) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipoId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos_equipos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('logos_equipos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading logo:', err);
      return null;
    }
  },

  // 2. Jugadores / Users
  async getJugadores() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('nombre', { ascending: true });
        if (!error && Array.isArray(data)) {
          return data;
        }
      } catch (err) {
        console.warn('Error querying users from Supabase:', err);
      }
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_JUGADORES);
    return local ? JSON.parse(local) : [];
  },

  async updateUser(id, updates) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Error updating user in Supabase:', err);
      }
    }
    const current = await this.getJugadores();
    const updated = current.map((j) => (j.id === id ? { ...j, ...updates } : j));
    localStorage.setItem(LOCAL_STORAGE_KEY_JUGADORES, JSON.stringify(updated));
    return updated.find((j) => j.id === id);
  },

  async deleteJugador(id) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Error deleting user in Supabase:', err);
      }
    }
    const current = await this.getJugadores();
    const updated = current.filter((j) => j.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_JUGADORES, JSON.stringify(updated));
    return true;
  },

  async uploadAvatar(file, userId) {
    if (!isSupabaseConfigured) throw new Error("Supabase no configurado");
    
    // Generar un nombre único para evitar caché
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Subir archivo al bucket fotos_perfil
    const { error: uploadError } = await supabase.storage
      .from('fotos_perfil')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage
      .from('fotos_perfil')
      .getPublicUrl(filePath);

    // Actualizar la tabla users
    return await this.updateUser(userId, {
      avatar_path: filePath,
      avatar_url: publicUrlData.publicUrl
    });
  },

  // 3. Partidos
  async getPartidos() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('partidos')
          .select(`
            *,
            partido_jugadores (*),
            partido_eventos (*)
          `)
          .order('fecha', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map((p) => ({
            ...p,
            fecha: `${p.fecha}T${p.hora}`,
            ubicacion: p.lugar,
            ubicacion_url: p.mapa_url,
            jugadores: p.partido_jugadores || [],
            eventos: p.partido_eventos || [],
          }));
        }
      } catch (err) {
        console.warn('Error querying partidos from Supabase:', err);
      }
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_PARTIDOS);
    return local ? JSON.parse(local) : [];
  },

  async createPartido(partidoData) {
    if (isSupabaseConfigured) {
      try {
        const { jugadores, eventos, equipo_id, fecha, ubicacion, ubicacion_url, ...partidoFields } = partidoData;
        
        // Transformar al esquema real de Supabase
        const dbPayload = {
          ...partidoFields,
          fecha: fecha ? fecha.split('T')[0] : new Date().toISOString().split('T')[0],
          hora: fecha && fecha.includes('T') ? fecha.split('T')[1] : '19:00:00',
          lugar: ubicacion || 'Cancha',
          mapa_url: ubicacion_url || null,
        };

        const { data: partido, error } = await supabase
          .from('partidos')
          .insert([dbPayload])
          .select()
          .single();

        if (!error && partido) {
          if (jugadores && jugadores.length > 0) {
            const rows = jugadores.map((j) => ({
              partido_id: partido.id,
              jugador_id: j.jugador_id,
              equipo_partido: j.equipo_partido,
              estado_invitacion: j.estado_invitacion || 'pendiente',
            }));
            await supabase.from('partido_jugadores').insert(rows);
          }
          return { ...partido, jugadores: jugadores || [], eventos: [] };
        }
      } catch (err) {
        console.warn('Error creating partido in Supabase:', err);
      }
    }

    const partidos = await this.getPartidos();
    const nuevo = {
      ...partidoData,
      id: 'p_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [nuevo, ...partidos];
    localStorage.setItem(LOCAL_STORAGE_KEY_PARTIDOS, JSON.stringify(updated));
    return nuevo;
  },

  async updatePartido(id, updates) {
    if (isSupabaseConfigured) {
      try {
        const { jugadores, eventos, equipo_id, fecha, ubicacion, ubicacion_url, ...partidoFields } = updates;
        
        // Transformar solo los campos que vengan en updates
        const dbPayload = { ...partidoFields };
        if (fecha) {
          dbPayload.fecha = fecha.split('T')[0];
          if (fecha.includes('T')) dbPayload.hora = fecha.split('T')[1];
        }
        if (ubicacion !== undefined) dbPayload.lugar = ubicacion;
        if (ubicacion_url !== undefined) dbPayload.mapa_url = ubicacion_url;

        if (Object.keys(dbPayload).length > 0) {
          await supabase.from('partidos').update(dbPayload).eq('id', id);
        }
        if (jugadores) {
          for (const j of jugadores) {
            const payload = {
              partido_id: id,
              jugador_id: j.jugador_id,
            };
            if (j.equipo_partido !== undefined) payload.equipo_partido = j.equipo_partido;
            if (j.estado_invitacion !== undefined) payload.estado_invitacion = j.estado_invitacion;

            await supabase
              .from('partido_jugadores')
              .upsert(payload, { onConflict: 'partido_id,jugador_id' });
          }
        }
      } catch (err) {
        console.warn('Error updating partido in Supabase:', err);
      }
    }

    const partidos = await this.getPartidos();
    const updated = partidos.map((p) => {
      if (p.id === id) {
        const pUpdated = { ...p, ...updates };
        // Merging jugadores properly for local storage
        if (updates.jugadores && p.jugadores) {
          pUpdated.jugadores = p.jugadores.map(existingJugador => {
            const match = updates.jugadores.find(u => u.jugador_id === existingJugador.jugador_id);
            return match ? { ...existingJugador, ...match } : existingJugador;
          });
          // Add any new players that weren't in the existing array
          const newPlayers = updates.jugadores.filter(u => !p.jugadores.some(e => e.jugador_id === u.jugador_id));
          pUpdated.jugadores = [...pUpdated.jugadores, ...newPlayers];
        }
        return pUpdated;
      }
      return p;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY_PARTIDOS, JSON.stringify(updated));
    return updates;
  },

  async addEvento(partidoId, evento) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('partido_eventos')
          .insert([{
            partido_id: partidoId,
            jugador_id: evento.jugador_id,
            tipo: evento.tipo,
            minuto: evento.minuto,
          }])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Error adding event in Supabase:', err);
      }
    }
    return { ...evento, id: 'ev_' + Date.now() };
  },

  async removeEvento(eventoId) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('partido_eventos').delete().eq('id', eventoId);
      } catch (err) {
        console.warn('Error removing event in Supabase:', err);
      }
    }
    return true;
  },

  // 4. Disponibilidad
  async getAllDisponibilidades() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('disponibilidad').select('*');
        if (!error && Array.isArray(data)) return data;
      } catch (err) {
        console.warn('Error querying all disponibilidad in Supabase:', err);
      }
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_DISP);
    return local ? JSON.parse(local) : [];
  },

  async getDisponibilidad(jugadorId) {
    if (isSupabaseConfigured && jugadorId) {
      try {
        const { data, error } = await supabase
          .from('disponibilidad')
          .select('*')
          .eq('jugador_id', jugadorId);
        if (!error && Array.isArray(data)) return data;
      } catch (err) {
        console.warn('Error querying disponibilidad in Supabase:', err);
      }
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_DISP);
    const all = local ? JSON.parse(local) : [];
    return all.filter((d) => !jugadorId || d.jugador_id === jugadorId);
  },

  async saveDisponibilidad(jugadorId, slots = []) {
    if (isSupabaseConfigured && jugadorId) {
      try {
        await supabase.from('disponibilidad').delete().eq('jugador_id', jugadorId);
        if (slots.length > 0) {
          const rows = slots.map((s) => ({
            jugador_id: jugadorId,
            dia_semana: s.dia_semana,
            hora_inicio: s.hora_inicio,
            hora_fin: s.hora_fin,
            tipo: 'semanal',
          }));
          await supabase.from('disponibilidad').insert(rows);
        }
      } catch (err) {
        console.warn('Error saving disponibilidad in Supabase:', err);
      }
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_DISP);
    const current = local ? JSON.parse(local) : [];
    const filtered = current.filter((d) => d.jugador_id !== jugadorId);
    const updated = [...filtered, ...slots.map((s) => ({ ...s, jugador_id: jugadorId }))];
    localStorage.setItem(LOCAL_STORAGE_KEY_DISP, JSON.stringify(updated));
    return true;
  },

  // 5. Función de Inicialización / Semilla
  async seedInitialData() {
    if (isSupabaseConfigured) {
      try {
        // Insert equipo
        await supabase.from('equipos').upsert([equipoMock], { onConflict: 'id' });
        // Insert users
        await supabase.from('users').upsert(jugadoresMock, { onConflict: 'id' });
        // Insert partidos
        for (const p of partidosMock) {
          const { jugadores, eventos, ...partidoFields } = p;
          await supabase.from('partidos').upsert([partidoFields], { onConflict: 'id' });
          if (jugadores && jugadores.length > 0) {
            const rows = jugadores.map((j) => ({
              partido_id: p.id,
              jugador_id: j.jugador_id,
              equipo_partido: j.equipo_partido,
              estado_invitacion: j.estado_invitacion,
            }));
            await supabase.from('partido_jugadores').upsert(rows, { onConflict: 'partido_id,jugador_id' });
          }
          if (eventos && eventos.length > 0) {
            await supabase.from('partido_eventos').upsert(eventos, { onConflict: 'id' });
          }
        }
      } catch (err) {
        console.error('Error seeding Supabase:', err);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_EQUIPO, JSON.stringify(equipoMock));
    localStorage.setItem(LOCAL_STORAGE_KEY_JUGADORES, JSON.stringify(jugadoresMock));
    localStorage.setItem(LOCAL_STORAGE_KEY_PARTIDOS, JSON.stringify(partidosMock));
    localStorage.setItem(LOCAL_STORAGE_KEY_DISP, JSON.stringify(disponibilidadMock));
    return true;
  },

  async clearData() {
    localStorage.removeItem(LOCAL_STORAGE_KEY_JUGADORES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_PARTIDOS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_EQUIPO);
    localStorage.removeItem(LOCAL_STORAGE_KEY_DISP);
    return true;
  }
};
