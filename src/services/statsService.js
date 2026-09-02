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

  const playerStatsBase = {
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

  return playerStatsBase;
};

export const calculatePlayerOverall = (stats, posicion_preferida = 'mediocampo') => {
  // Base rating
  let ovr = 70;
  const p = stats.partidos || 1; // avoid division by zero

  const gp = stats.goles / p;
  const ap = stats.asistencias / p;
  const mp = stats.mvps / p;

  let sho = 50;
  let pas = 50;
  let dri = 50;
  let def = 50;
  let phy = 50;
  let pac = 70; // Ritmo base

  // Positional weighting
  if (posicion_preferida === 'delantero') {
    ovr += (gp * 12) + (ap * 4) + (mp * 5);
    sho = 65 + (gp * 25);
    pas = 55 + (ap * 15);
    def = 30 + (stats.victorias / p * 10);
    phy = 60 + (stats.partidos * 0.5);
    dri = 65 + (mp * 20);
  } else if (posicion_preferida === 'mediocampo') {
    ovr += (gp * 7) + (ap * 9) + (mp * 6);
    sho = 55 + (gp * 20);
    pas = 65 + (ap * 25);
    def = 55 + (stats.victorias / p * 15);
    phy = 65 + (stats.partidos * 0.5);
    dri = 65 + (mp * 15);
  } else if (posicion_preferida === 'defensa') {
    ovr += (gp * 4) + (mp * 10) + (stats.victorias / p * 8);
    sho = 40 + (gp * 30);
    pas = 55 + (ap * 20);
    def = 70 + (stats.victorias / p * 20);
    phy = 75 + (stats.partidos * 0.5);
    dri = 50 + (mp * 15);
  } else if (posicion_preferida === 'arquero') {
    ovr += (mp * 15) + (stats.victorias / p * 10);
    // Para arqueros se usan DIV, HAN, KIC, REF, SPD, POS pero mapearemos a la carta base
    sho = 30; // KIC
    pas = 60; // HAN
    def = 75 + (stats.victorias / p * 15); // DIV/REF
    phy = 70 + (stats.partidos * 0.5); 
    dri = 75 + (mp * 15); // POS
  }

  // Penalty por indisciplina
  ovr -= (stats.tarjetas_amarillas / p * 3) + (stats.tarjetas_rojas / p * 7);

  // Normalizar máximos
  const clamp = (val) => Math.min(Math.max(Math.round(val), 40), 99);

  return {
    ovr: clamp(ovr),
    pac: clamp(pac),
    sho: clamp(sho),
    pas: clamp(pas),
    dri: clamp(dri),
    def: clamp(def),
    phy: clamp(phy),
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

export const calculatePersonalStats = (jugadorId, jugadores = [], partidos = []) => {
  const allTeamStats = calculateTeamStats(jugadores, partidos);
  const myStats = allTeamStats.playersWithStats.find(j => j.id === jugadorId)?.stats || calculatePlayerStats(jugadorId, []);

  // Radar Data Normalization based on max of the team
  const maxGoles = Math.max(...allTeamStats.playersWithStats.map((j) => j.stats.goles), 1);
  const maxAsistencias = Math.max(...allTeamStats.playersWithStats.map((j) => j.stats.asistencias), 1);
  const maxPartidosVal = Math.max(...allTeamStats.playersWithStats.map((j) => j.stats.partidos), 1);
  const maxMvps = Math.max(...allTeamStats.playersWithStats.map((j) => j.stats.mvps), 1);

  const personalRadarData = [
    { stat: 'Goles', value: Math.round(((myStats.goles || 0) / maxGoles) * 100) },
    { stat: 'Asistencias', value: Math.round(((myStats.asistencias || 0) / maxAsistencias) * 100) },
    { stat: 'Partidos', value: Math.round(((myStats.partidos || 0) / maxPartidosVal) * 100) },
    { stat: 'MVPs', value: Math.round(((myStats.mvps || 0) / maxMvps) * 100) },
    {
      stat: 'Disciplina',
      value: Math.max(
        10,
        100 - (myStats.tarjetas_amarillas * 15 + myStats.tarjetas_rojas * 35)
      ),
    },
  ];

  const profile = jugadores.find(j => j.id === jugadorId);
  const media = calculatePlayerOverall(myStats, profile?.posicion_preferida);

  return {
    stats: myStats,
    media,
    radarData: personalRadarData,
    maximosEquipo: {
      goles: maxGoles,
      asistencias: maxAsistencias,
      partidos: maxPartidosVal,
      mvps: maxMvps,
    }
  };
};
