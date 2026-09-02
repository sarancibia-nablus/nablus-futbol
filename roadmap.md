# Roadmap — Fútbol Nablus SaaS

Hoja de ruta integral módulo a módulo con el estado de avance, políticas de seguridad RLS, mejoras planificadas y próximos pasos.

---

## 🚀 Módulo 1: Identidad Visual, Autenticación y Roles

- [x] **Ajuste del Isotipo Nablus**: Geometría SVG centrada y proporciones con margen para evitar recortes en Sidebar, Header y Login.
- [x] **Flujo Completo de Autenticación (`/login`)**:
  - [x] Inicio de sesión con correo y contraseña.
  - [x] Registro interactivo de nuevos miembros del plantel con posición y fecha de nacimiento.
  - [x] Recuperación de contraseña con Supabase Auth.
- [x] **Gestión de Roles RBAC**:
  - [x] Panel de control de roles para Administradores en `/perfil` (promover a Admin o degradar a Jugador).
  - [x] Conmutación y verificación de permisos reactiva.
- [x] **Badges de Estado de Partido**: Rediseño estilo píldora (`rounded-full`) con micro-indicadores luminosos de estado (*pulsing live dot* para partidos en curso, verde sólido para finalizado, etc.).
- [x] **Estilo SaaS Moderno**: Paleta oficial Nablus (Portage `#A493DC`, Seasalt `#FAFAFA`, Mistery Black `#191919`).

---

## 📅 Módulo 2: Calendario y Convocatorias

- [x] **Vista de Mes Completo**: Cuadrícula mensual interactiva con navegación de meses, día actual destacado y tarjetas de partido.
- [x] **Vista Cronograma (Lista)**: Vista alternativa en línea de tiempo con detalles ampliados.
- [x] **Confirmación en 1 Clic**: Acciones directas para confirmar o rechazar invitaciones dentro de la celda del calendario y en el timeline.
- [x] **Filtros Inteligentes**: Alternar entre "Todos los partidos" y "Mis partidos convocados".
- [x] **Sincronización con Google Calendar / iCal**: Exportar convocatorias directamente al calendario personal del jugador.

---

## ⚽ Módulo 3: Gestión de Partidos y Alineaciones

- [x] **Creación de Partidos (Admin)**: Formulario con selección de formato (5v5 a 11v11), cancha, mapa y convocatoria de jugadores.
- [x] **Edición Integral**: Modificación de estado (programado, en curso, finalizado, cancelado), marcador en vivo y asignación de MVP.
- [x] **Alineaciones Balanceadas**: Sorteo aleatorio y asignación manual a Equipo A / Equipo B.
- [x] **Minuto a Minuto**: Registro y eliminación de goles, asistencias y tarjetas con recálculo automático del marcador.
- [ ] **Planillero Móvil en Vivo**: Vista táctil simplificada para registrar goles y cambios durante el partido desde el teléfono.

---

## 👥 Módulo 4: Jugadores y Perfiles

- [x] **Directorio del Plantel**: Tabla avanzada con búsqueda en tiempo real, filtro por posición y ordenamiento de columnas.
- [x] **Ficha Individual de Jugador**: Estadísticas de partidos jugados, goles, asistencias, tarjetas y distribución de posiciones.
- [x] **Mi Perfil (`/perfil`)**: Edición de datos personales, avatar, posición en cancha y actualización de contraseña.
- [x] **Selector de Rol Demo en Topbar**: Selector para alternar instantáneamente entre el perfil Administrador y Jugador.
- [ ] **Carga de Avatar en Supabase Storage**: Subida de archivos binarios/imágenes directamente al bucket de Storage.

---

## ⏰ Módulo 5: Disponibilidad Horaria

- [x] **Matriz Semanal Drag-to-Select**: Selección de bloques horarios de 17:00 a 22:00 hrs de lunes a domingo.
- [x] **Persistencia por Usuario**: Actualización y carga reactiva de disponibilidad al cambiar de usuario.
- [ ] **Matriz Cruzada del Equipo (Admin)**: Vista combinada para que el administrador identifique el día y hora con mayor quorum antes de programar un partido.

---

## 📊 Módulo 6: Estadísticas, Gráficos y Métricas

- [x] **Cálculo Dinámico en Tiempo Real**: Creación de `statsService.js` para procesar goles, asistencias, tarjetas y efectividad directamente de `partidos` y `partido_eventos`.
- [x] **Gráficos Recharts en Vivo**: Ranking de goleadores en Estadísticas (`BarChart`), goles por posición y radar de habilidades (`RadarChart`) alimentados con datos reales.
- [x] **Fichas de Jugador con Gráfica Circular**: Distribución de acciones (`PieChart`) y efectividad de victorias calculada por jugador.
- [x] **Documento Maestro**: Creado [`roadmap-detallado-modulos.md`](file:///Users/sebastianarancibiahervia/Library/CloudStorage/GoogleDrive-sebastian.arancibiahervia@gmail.com/Mi%20unidad/Sites/futbol-nablus/roadmap-detallado-modulos.md) con la guía exhaustiva de revisión y conexión de cada módulo.
- [ ] **Historial de MVP y Premiaciones**: Tabla histórica de distinciones individuales por mes y temporada.

---

## 🗄️ Módulo 7: Conexión Supabase & Políticas RLS

- [x] **Cliente Supabase JS**: Integración de `@supabase/supabase-js` en `src/lib/supabase.js` con soporte para variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- [x] **Esquema Relacional DDL y Migración Aplicada**: Archivo [`supabase/migrations/20260825_complete_nablus_schema.sql`](file:///Users/sebastianarancibiahervia/Library/CloudStorage/GoogleDrive-sebastian.arancibiahervia@gmail.com/Mi%20unidad/Sites/futbol-nablus/supabase/migrations/20260825_complete_nablus_schema.sql) ejecutado en la base de datos de producción con tablas `users`, `equipos`, `partidos`, `partido_jugadores`, `partido_eventos`, `disponibilidad`.
- [x] **Políticas de Seguridad RLS y Triggers**:
  - [x] Trigger `handle_new_user` activo en `auth.users` para creación automática de perfiles.
  - [x] Lectura autorizada para usuarios autenticados.
  - [x] Creación y edición de partidos y eventos exclusiva para Administradores (`is_admin()`).
  - [x] Gestión de disponibilidad y respuesta a convocatorias limitada al propio jugador (`auth.uid() = jugador_id`).
- [x] **Datos Reales Sembrados**: Cuentas de acceso, plantel oficial de Nablus y partidos cargados en Supabase.
- [ ] **Suscripciones en Tiempo Real (Supabase Realtime)**: Actualización en vivo de marcadores y asistencia sin recargar la página.

---

## 🏆 Módulo 8: Liga Interempresas (Fase Futura)

- [ ] Gestión multiequipo y soporte para torneos interempresas.
- [ ] Tabla de posiciones automatizada (puntos, DG, PJ, PG, PE, PP).
- [ ] Fixture automático con cálculo de localías y cruces.
- [ ] Reglamento de disciplina y sanciones automáticas por acumulación de tarjetas.

### Solucionado (25/08/2026)
- **Bug Creación Partidos**: Se corrigió el error de redirección asíncrona ("Partido no encontrado") implementando `async/await` en la creación de partidos y mostrando un estado de carga "Programando..." en el botón principal para evitar múltiples envíos y mejorar el UX.
- **Filtro Mis Partidos**: Se corrigió el filtro en el Calendario para que excluya correctamente los partidos donde el usuario rechazó la invitación.
- **Validación de Resultados**: Se añadió una alerta de confirmación (pop-up) al editar el resultado de un partido si la cantidad de goles en el marcador supera la cantidad de goles registrados en la sección de "Eventos". El Capitán puede elegir revisar los eventos o "Continuar de todas formas".
- **Subida y Optimización de Fotos de Perfil**: Se reemplazó el campo de URL por un botón de subida de archivos real. Las fotos se comprimen en el navegador usando `browser-image-compression` y se suben a un Bucket seguro de Supabase Storage (`fotos_perfil`), guardando la referencia (`avatar_path`) en la base de datos.
- **Asignación Automática de Equipo (Multi-tenant)**: Se modificó la base de datos y la función `handle_new_user` para que cuando un usuario se registre, el sistema extraiga automáticamente su dominio de correo (ej. `nablus.cl`) y lo asigne al equipo correspondiente sin intervención manual, preparando la app para un escalado como SaaS B2B.


