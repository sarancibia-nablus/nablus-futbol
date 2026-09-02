/**
 * Servicio de Cálculo de Estadísticas en Tiempo Real
 * Procesa datos relacionales (partidos, jugadores, eventos, alineaciones)
 * para alimentar todos los gráficos, rankings y KPIs del sistema.
 */

export const calculatePlayerStats = (jugadorId, partidos = []) => {
  const finishedMatches = partidos.filter((p) => p.estado === 'finalizado');
  
  let partidosJugados = 0;
  let goles = 0;
  let asistencias = 0;
  let tarjetasAmarillas = 0;
  let tarjetasRojas = 0;
  let mvps = 0;
  let partidosGanados = 0;

  finishedMatches.forEach((partido) => {
    // Check if player participated and was confirmed
    const jugadorRecord = partido.jugadores?.find(
      (j) => j.jugador_id === jugadorId && j.estado_invitacion === 'confirmado'
    );

    if (jugadorRecord) {
      partidosJugados++;

      // Check if player's team won
      const userTeam = jugadorRecord.equipo_partido;
      const resA = partido.resultado_equipo_a || 0;
      const resB = partido.resultado_equipo_b || 0;

      if (
        (userTeam === 'equipo_a' && resA > resB) ||
        (userTeam === 'equipo_b' && resB > resA)
      ) {
        partidosGanados++;
      }
    }

    // Check MVP
    if (partido.mvp_id === jugadorId) {
      mvps++;
    }

    // Check match events
    (partido.eventos || []).forEach((evento) => {
      if (evento.jugador_id === jugadorId) {
        if (evento.tipo === 'gol') goles++;
        if (evento.tipo === 'asistencia') asistencias++;
        if (evento.tipo === 'tarjeta_amarilla') tarjetasAmarillas++;
        if (evento.tipo === 'tarjeta_roja') tarjetasRojas++;
      }
    });
  });

  const efectividad = partidosJugados > 0 
    ? Math.round((partidosGanados / partidosJugados) * 100) 
    : 0;

  const promedioGoles = partidosJugados > 0 
    ? (goles / partidosJugados).toFixed(2) 
    : '0.00';

  return {
    partidos: partidosJugados,
    goles,
    asistencias,
    tarjetas_amarillas: tarjetasAmarillas,
    tarjetas_rojas: tarjetasRojas,
    mvps,
    victorias: partidosGanados,
    efectividad,
    promedio_goles: promedioGoles,
  };
};

export const calculateTeamStats = (jugadores = [], partidos = []) => {
  const playersWithStats = jugadores.map((j) => {
    const calculated = calculatePlayerStats(j.id, partidos);
    return {
      ...j,
      stats: calculated,
    };
  });

  const finishedMatches = partidos.filter((p) => p.estado === 'finalizado');

  const totalGoles = playersWithStats.reduce((sum, j) => sum + j.stats.goles, 0);
  const totalAsistencias = playersWithStats.reduce((sum, j) => sum + j.stats.asistencias, 0);
  const totalAmarillas = playersWithStats.reduce((sum, j) => sum + j.stats.tarjetas_amarillas, 0);
  const totalRojas = playersWithStats.reduce((sum, j) => sum + j.stats.tarjetas_rojas, 0);
  const totalMVPs = playersWithStats.reduce((sum, j) => sum + j.stats.mvps, 0);

  // Top Goleadores
  const topGoleadores = [...playersWithStats]
    .filter((j) => j.stats.goles > 0 || j.stats.partidos > 0)
    .sort((a, b) => b.stats.goles - a.stats.goles || b.stats.partidos - a.stats.partidos)
    .slice(0, 5);

  // Top Asistidores
  const topAsistidores = [...playersWithStats]
    .filter((j) => j.stats.asistencias > 0 || j.stats.partidos > 0)
    .sort((a, b) => b.stats.asistencias - a.stats.asistencias)
    .slice(0, 5);

  // Top MVPs
  const topMVPs = [...playersWithStats]
    .filter((j) => j.stats.mvps > 0)
    .sort((a, b) => b.stats.mvps - a.stats.mvps)
    .slice(0, 5);

  // Más Partidos
  const masPartidos = [...playersWithStats]
    .sort((a, b) => b.stats.partidos - a.stats.partidos)
    .slice(0, 5);

  // Goles por Posición
  const posicionesList = [
    { value: 'delantero', label: 'Delantero' },
    { value: 'mediocampo', label: 'Mediocampo' },
    { value: 'defensa', label: 'Defensa' },
    { value: 'arquero', label: 'Arquero' },
  ];

  const golesPorPosicion = posicionesList.map((pos) => ({
    posicion: pos.label,
    goles: playersWithStats
      .filter((j) => j.posicion_preferida === pos.value)
      .reduce((sum, j) => sum + j.stats.goles, 0),
    asistencias: playersWithStats
      .filter((j) => j.posicion_preferida === pos.value)
      .reduce((sum, j) => sum + j.stats.asistencias, 0),
  }));

  // Mejor Jugador General (algoritmo ponderado)
  const mejorJugador = [...playersWithStats].sort((a, b) => {
    const scoreA =
      a.stats.goles * 4 +
      a.stats.asistencias * 2.5 +
      a.stats.mvps * 6 +
      a.stats.partidos * 1 -
      a.stats.tarjetas_rojas * 4 -
      a.stats.tarjetas_amarillas * 1;
    const scoreB =
      b.stats.goles * 4 +
      b.stats.asistencias * 2.5 +
      b.stats.mvps * 6 +
      b.stats.partidos * 1 -
      b.stats.tarjetas_rojas * 4 -
      b.stats.tarjetas_amarillas * 1;
    return scoreB - scoreA;
  })[0] || playersWithStats[0];

  // Radar Data Normalization
  const maxGoles = Math.max(...playersWithStats.map((j) => j.stats.goles), 1);
  const maxAsistencias = Math.max(...playersWithStats.map((j) => j.stats.asistencias), 1);
  const maxPartidosVal = Math.max(...playersWithStats.map((j) => j.stats.partidos), 1);
  const maxMvps = Math.max(...playersWithStats.map((j) => j.stats.mvps), 1);

  const radarData = mejorJugador
    ? [
        { stat: 'Goles', value: Math.round(((mejorJugador.stats.goles || 0) / maxGoles) * 100) },
        { stat: 'Asistencias', value: Math.round(((mejorJugador.stats.asistencias || 0) / maxAsistencias) * 100) },
        { stat: 'Partidos', value: Math.round(((mejorJugador.stats.partidos || 0) / maxPartidosVal) * 100) },
        { stat: 'MVPs', value: Math.round(((mejorJugador.stats.mvps || 0) / maxMvps) * 100) },
        {
          stat: 'Disciplina',
          value: Math.max(
            10,
            100 -
              (mejorJugador.stats.tarjetas_amarillas * 15 +
                mejorJugador.stats.tarjetas_rojas * 35)
          ),
        },
      ]
    : [];

  return {
    playersWithStats,
    finishedMatchesCount: finishedMatches.length,
    totals: {
      goles: totalGoles,
      asistencias: totalAsistencias,
      amarillas: totalAmarillas,
      rojas: totalRojas,
      mvps: totalMVPs,
      partidos: finishedMatches.length,
    },
    topGoleadores,
    topAsistidores,
    topMVPs,
    masPartidos,
    golesPorPosicion,
    mejorJugador,
    radarData,
  };
};
