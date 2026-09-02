// ===== JUGADORES MOCK =====
export const jugadoresMock = [
  {
    id: '1',
    nombre: 'Sebastián Arancibia',
    email: 'sebastian@nablus.cl',
    fecha_nacimiento: '1992-03-15',
    posicion_preferida: 'mediocampo',
    avatar_url: null,
    equipo_id: '1',
    es_admin: true,
    stats: { goles: 12, asistencias: 8, tarjetas_amarillas: 2, tarjetas_rojas: 0, partidos: 18, mvps: 4 },
  },
  {
    id: '2',
    nombre: 'Carlos Mendoza',
    email: 'carlos@nablus.cl',
    fecha_nacimiento: '1995-07-22',
    posicion_preferida: 'delantero',
    avatar_url: null,
    equipo_id: '1',
    es_admin: false,
    stats: { goles: 22, asistencias: 5, tarjetas_amarillas: 4, tarjetas_rojas: 1, partidos: 20, mvps: 6 },
  },
  {
    id: '3',
    nombre: 'Diego Fuentes',
    email: 'diego@nablus.cl',
    fecha_nacimiento: '1990-11-08',
    posicion_preferida: 'defensa',
    avatar_url: null,
    equipo_id: '1',
    es_admin: false,
    stats: { goles: 3, asistencias: 2, tarjetas_amarillas: 6, tarjetas_rojas: 0, partidos: 19, mvps: 1 },
  },
  {
    id: '4',
    nombre: 'Andrés Rojas',
    email: 'andres@nablus.cl',
    fecha_nacimiento: '1993-01-30',
    posicion_preferida: 'arquero',
    avatar_url: null,
    equipo_id: '1',
    es_admin: false,
    stats: { goles: 0, asistencias: 0, tarjetas_amarillas: 1, tarjetas_rojas: 0, partidos: 20, mvps: 3 },
  },
  {
    id: '5',
    nombre: 'Felipe Torres',
    email: 'felipe@nablus.cl',
    fecha_nacimiento: '1997-05-12',
    posicion_preferida: 'mediocampo',
    avatar_url: null,
    equipo_id: '1',
    es_admin: false,
    stats: { goles: 7, asistencias: 14, tarjetas_amarillas: 3, tarjetas_rojas: 0, partidos: 17, mvps: 2 },
  },
  {
    id: '6',
    nombre: 'Matías Herrera',
    email: 'matias@nablus.cl',
    fecha_nacimiento: '1994-09-18',
    posicion_preferida: 'delantero',
    avatar_url: null,
    equipo_id: '1',
    es_admin: false,
    stats: { goles: 15, asistencias: 3, tarjetas_amarillas: 2, tarjetas_rojas: 0, partidos: 16, mvps: 3 },
  },
  {
    id: '7',
    nombre: 'Nicolás Pérez',
    email: 'nicolas@nablus.cl',
    fecha_nacimiento: '1996-12-05',
    posicion_preferida: 'defensa',
    avatar_url: null,
    equipo_id: '1',
    es_admin: false,
    stats: { goles: 1, asistencias: 4, tarjetas_amarillas: 5, tarjetas_rojas: 1, partidos: 18, mvps: 0 },
  },
  {
    id: '8',
    nombre: 'Tomás Vargas',
    email: 'tomas@nablus.cl',
    fecha_nacimiento: '1991-06-25',
    posicion_preferida: 'mediocampo',
    avatar_url: null,
    equipo_id: '1',
    es_admin: false,
    stats: { goles: 5, asistencias: 11, tarjetas_amarillas: 1, tarjetas_rojas: 0, partidos: 15, mvps: 1 },
  },
  {
    id: '9',
    nombre: 'Joaquín Silva',
    email: 'joaquin@nablus.cl',
    fecha_nacimiento: '1998-02-14',
    posicion_preferida: 'delantero',
    avatar_url: null,
    equipo_id: '1',
    es_admin: false,
    stats: { goles: 9, asistencias: 6, tarjetas_amarillas: 0, tarjetas_rojas: 0, partidos: 14, mvps: 2 },
  },
  {
    id: '10',
    nombre: 'Rodrigo Castillo',
    email: 'rodrigo@nablus.cl',
    fecha_nacimiento: '1993-08-03',
    posicion_preferida: 'defensa',
    avatar_url: null,
    equipo_id: '1',
    es_admin: false,
    stats: { goles: 2, asistencias: 1, tarjetas_amarillas: 7, tarjetas_rojas: 2, partidos: 20, mvps: 0 },
  },
];

// ===== EQUIPO MOCK =====
export const equipoMock = {
  id: '1',
  nombre: 'Nablus FC',
  imagen_url: '/assets/isotipo-primario.png',
  email_contacto: 'futbol@nablus.cl',
  admin_id: '1',
};

// ===== PARTIDOS MOCK =====
export const partidosMock = [
  {
    id: '1',
    equipo_id: '1',
    fecha: '2026-08-28T19:00:00',
    ubicacion: 'Cancha Municipal Viña del Mar',
    ubicacion_url: 'https://maps.google.com/?q=Cancha+Municipal+Vina+del+Mar',
    estado: 'programado',
    formato: '7v7',
    resultado_equipo_a: null,
    resultado_equipo_b: null,
    mvp_id: null,
    created_by: '1',
    jugadores: [
      { jugador_id: '1', equipo_partido: null, estado_invitacion: 'confirmado' },
      { jugador_id: '2', equipo_partido: null, estado_invitacion: 'confirmado' },
      { jugador_id: '3', equipo_partido: null, estado_invitacion: 'pendiente' },
      { jugador_id: '4', equipo_partido: null, estado_invitacion: 'confirmado' },
      { jugador_id: '5', equipo_partido: null, estado_invitacion: 'confirmado' },
      { jugador_id: '6', equipo_partido: null, estado_invitacion: 'rechazado' },
      { jugador_id: '7', equipo_partido: null, estado_invitacion: 'pendiente' },
      { jugador_id: '8', equipo_partido: null, estado_invitacion: 'confirmado' },
      { jugador_id: '9', equipo_partido: null, estado_invitacion: 'confirmado' },
      { jugador_id: '10', equipo_partido: null, estado_invitacion: 'pendiente' },
    ],
    eventos: [],
  },
  {
    id: '2',
    equipo_id: '1',
    fecha: '2026-08-21T19:30:00',
    ubicacion: 'Estadio Sausalito',
    ubicacion_url: 'https://maps.google.com/?q=Estadio+Sausalito',
    estado: 'finalizado',
    formato: '7v7',
    resultado_equipo_a: 4,
    resultado_equipo_b: 3,
    mvp_id: '2',
    created_by: '1',
    jugadores: [
      { jugador_id: '1', equipo_partido: 'equipo_a', estado_invitacion: 'confirmado' },
      { jugador_id: '2', equipo_partido: 'equipo_a', estado_invitacion: 'confirmado' },
      { jugador_id: '3', equipo_partido: 'equipo_a', estado_invitacion: 'confirmado' },
      { jugador_id: '4', equipo_partido: 'equipo_a', estado_invitacion: 'confirmado' },
      { jugador_id: '5', equipo_partido: 'equipo_b', estado_invitacion: 'confirmado' },
      { jugador_id: '6', equipo_partido: 'equipo_b', estado_invitacion: 'confirmado' },
      { jugador_id: '7', equipo_partido: 'equipo_b', estado_invitacion: 'confirmado' },
      { jugador_id: '8', equipo_partido: 'equipo_b', estado_invitacion: 'confirmado' },
      { jugador_id: '9', equipo_partido: 'equipo_a', estado_invitacion: 'confirmado' },
      { jugador_id: '10', equipo_partido: 'equipo_b', estado_invitacion: 'confirmado' },
    ],
    eventos: [
      { id: 'e1', partido_id: '2', jugador_id: '2', tipo: 'gol', minuto: 12 },
      { id: 'e2', partido_id: '2', jugador_id: '2', tipo: 'gol', minuto: 34 },
      { id: 'e3', partido_id: '2', jugador_id: '1', tipo: 'gol', minuto: 45 },
      { id: 'e4', partido_id: '2', jugador_id: '9', tipo: 'gol', minuto: 58 },
      { id: 'e5', partido_id: '2', jugador_id: '5', tipo: 'gol', minuto: 22 },
      { id: 'e6', partido_id: '2', jugador_id: '6', tipo: 'gol', minuto: 41 },
      { id: 'e7', partido_id: '2', jugador_id: '8', tipo: 'gol', minuto: 67 },
      { id: 'e8', partido_id: '2', jugador_id: '10', tipo: 'tarjeta_amarilla', minuto: 30 },
      { id: 'e9', partido_id: '2', jugador_id: '3', tipo: 'tarjeta_amarilla', minuto: 55 },
      { id: 'e10', partido_id: '2', jugador_id: '1', tipo: 'asistencia', minuto: 34 },
    ],
  },
  {
    id: '3',
    equipo_id: '1',
    fecha: '2026-08-14T18:00:00',
    ubicacion: 'Cancha Sporting Valparaíso',
    ubicacion_url: 'https://maps.google.com/?q=Sporting+Valparaiso',
    estado: 'finalizado',
    formato: '5v5',
    resultado_equipo_a: 2,
    resultado_equipo_b: 2,
    mvp_id: '5',
    created_by: '1',
    jugadores: [
      { jugador_id: '1', equipo_partido: 'equipo_a', estado_invitacion: 'confirmado' },
      { jugador_id: '2', equipo_partido: 'equipo_a', estado_invitacion: 'confirmado' },
      { jugador_id: '5', equipo_partido: 'equipo_a', estado_invitacion: 'confirmado' },
      { jugador_id: '6', equipo_partido: 'equipo_b', estado_invitacion: 'confirmado' },
      { jugador_id: '7', equipo_partido: 'equipo_b', estado_invitacion: 'confirmado' },
      { jugador_id: '8', equipo_partido: 'equipo_b', estado_invitacion: 'confirmado' },
    ],
    eventos: [
      { id: 'e11', partido_id: '3', jugador_id: '2', tipo: 'gol', minuto: 15 },
      { id: 'e12', partido_id: '3', jugador_id: '5', tipo: 'gol', minuto: 38 },
      { id: 'e13', partido_id: '3', jugador_id: '6', tipo: 'gol', minuto: 25 },
      { id: 'e14', partido_id: '3', jugador_id: '8', tipo: 'gol', minuto: 50 },
      { id: 'e15', partido_id: '3', jugador_id: '5', tipo: 'asistencia', minuto: 15 },
    ],
  },
];

// ===== DISPONIBILIDAD MOCK =====
export const disponibilidadMock = [
  { id: '1', jugador_id: '1', dia_semana: 1, hora_inicio: '19:00', hora_fin: '21:00', tipo: 'semanal' },
  { id: '2', jugador_id: '1', dia_semana: 3, hora_inicio: '19:00', hora_fin: '21:00', tipo: 'semanal' },
  { id: '3', jugador_id: '1', dia_semana: 4, hora_inicio: '18:00', hora_fin: '20:00', tipo: 'semanal' },
  { id: '4', jugador_id: '2', dia_semana: 1, hora_inicio: '18:00', hora_fin: '21:00', tipo: 'semanal' },
  { id: '5', jugador_id: '2', dia_semana: 2, hora_inicio: '19:00', hora_fin: '21:00', tipo: 'semanal' },
  { id: '6', jugador_id: '2', dia_semana: 4, hora_inicio: '19:00', hora_fin: '21:00', tipo: 'semanal' },
];

// ===== FORMATOS DE PARTIDO =====
export const formatosPartido = [
  { value: '5v5', label: '5 vs 5' },
  { value: '6v6', label: '6 vs 6' },
  { value: '7v7', label: '7 vs 7' },
  { value: '8v8', label: '8 vs 8' },
  { value: '11v11', label: '11 vs 11' },
];

// ===== POSICIONES =====
export const posiciones = [
  { value: 'arquero', label: 'Arquero', color: '#FA6E77' },
  { value: 'defensa', label: 'Defensa', color: '#A1C8F1' },
  { value: 'mediocampo', label: 'Mediocampo', color: '#96C8C7' },
  { value: 'delantero', label: 'Delantero', color: '#A493DC' },
];

// ===== HELPERS =====
export const getJugadorById = (id) => jugadoresMock.find(j => j.id === id);
export const getPartidoById = (id) => partidosMock.find(p => p.id === id);

export const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const diasSemanaFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const horasDisponibles = [];
for (let h = 7; h <= 22; h++) {
  horasDisponibles.push(`${h.toString().padStart(2, '0')}:00`);
}
