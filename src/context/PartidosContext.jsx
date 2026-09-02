import { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { useAuth } from './AuthContext';

const PartidosContext = createContext(null);

export const PartidosProvider = ({ children }) => {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Load real matches from database when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setPartidos([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchPartidos = async () => {
      setLoading(true);
      try {
        const data = await dbService.getPartidos();
        if (isMounted) {
          setPartidos(data || []);
        }
      } catch (err) {
        console.error('Error fetching partidos:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPartidos();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const getPartidoById = (id) => {
    return partidos.find((p) => p.id === id);
  };

  const createPartido = async (nuevoPartido) => {
    const created = await dbService.createPartido(nuevoPartido);
    setPartidos((prev) => [created, ...prev]);
    return created;
  };

  const updatePartido = async (id, updatedFields) => {
    setPartidos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...updatedFields };
        }
        return p;
      })
    );
    await dbService.updatePartido(id, updatedFields);
  };

  const addEvento = async (partidoId, evento) => {
    const savedEvento = await dbService.addEvento(partidoId, evento);
    setPartidos((prev) =>
      prev.map((p) => {
        if (p.id === partidoId) {
          const eventosActualizados = [...(p.eventos || []), savedEvento];

          let resA = p.resultado_equipo_a;
          let resB = p.resultado_equipo_b;
          if (evento.tipo === 'gol') {
            const jugador = p.jugadores?.find((j) => j.jugador_id === evento.jugador_id);
            if (jugador?.equipo_partido === 'equipo_a') {
              resA = (resA || 0) + 1;
            } else if (jugador?.equipo_partido === 'equipo_b') {
              resB = (resB || 0) + 1;
            }
          }

          const updatedPartido = {
            ...p,
            eventos: eventosActualizados,
            resultado_equipo_a: resA,
            resultado_equipo_b: resB,
          };

          dbService.updatePartido(partidoId, {
            resultado_equipo_a: resA,
            resultado_equipo_b: resB,
          });

          return updatedPartido;
        }
        return p;
      })
    );
  };

  const removeEvento = async (partidoId, eventoId) => {
    await dbService.removeEvento(eventoId);
    setPartidos((prev) =>
      prev.map((p) => {
        if (p.id === partidoId) {
          const eventoAEliminar = p.eventos?.find((e) => e.id === eventoId);
          const eventosActualizados = (p.eventos || []).filter((e) => e.id !== eventoId);

          let resA = p.resultado_equipo_a;
          let resB = p.resultado_equipo_b;
          if (eventoAEliminar?.tipo === 'gol') {
            const jugador = p.jugadores?.find((j) => j.jugador_id === eventoAEliminar.jugador_id);
            if (jugador?.equipo_partido === 'equipo_a' && resA > 0) {
              resA = resA - 1;
            } else if (jugador?.equipo_partido === 'equipo_b' && resB > 0) {
              resB = resB - 1;
            }
          }

          const updatedPartido = {
            ...p,
            eventos: eventosActualizados,
            resultado_equipo_a: resA,
            resultado_equipo_b: resB,
          };

          dbService.updatePartido(partidoId, {
            resultado_equipo_a: resA,
            resultado_equipo_b: resB,
          });

          return updatedPartido;
        }
        return p;
      })
    );
  };

  const updateJugadorInvitacion = async (partidoId, jugadorId, estado, equipoPartido) => {
    setPartidos((prev) =>
      prev.map((p) => {
        if (p.id === partidoId) {
          const jugadoresActualizados = (p.jugadores || []).map((j) => {
            if (j.jugador_id === jugadorId) {
              return {
                ...j,
                ...(estado !== undefined ? { estado_invitacion: estado } : {}),
                ...(equipoPartido !== undefined ? { equipo_partido: equipoPartido } : {}),
              };
            }
            return j;
          });
          return { ...p, jugadores: jugadoresActualizados };
        }
        return p;
      })
    );

    await dbService.updatePartido(partidoId, {
      jugadores: [{
        jugador_id: jugadorId,
        estado_invitacion: estado,
        equipo_partido: equipoPartido,
      }]
    });
  };

  return (
    <PartidosContext.Provider
      value={{
        partidos,
        loading,
        getPartidoById,
        createPartido,
        updatePartido,
        addEvento,
        removeEvento,
        updateJugadorInvitacion,
      }}
    >
      {children}
    </PartidosContext.Provider>
  );
};

export const usePartidos = () => {
  const ctx = useContext(PartidosContext);
  if (!ctx) throw new Error('usePartidos debe usarse dentro de PartidosProvider');
  return ctx;
};
