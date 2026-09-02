# Hoja de Ruta Detallada por Módulos — Fútbol Nablus SaaS

Guía maestra de revisión, diseño, arquitectura de datos y optimización módulo a módulo para el SaaS **Fútbol Nablus**.

---

## 📑 Índice de Módulos
1. [Módulo 1: Autenticación, Roles y Perfil (`/login`, `/perfil`)](#1-módulo-autenticación-roles-y-perfil)
2. [Módulo 2: Calendario y Convocatorias (`/calendario`)](#2-módulo-calendario-y-convocatorias)
3. [Módulo 3: Gestión de Partidos y Alineaciones (`/partidos`, `/partidos/:id`)](#3-módulo-gestión-de-partidos-y-alineaciones)
4. [Módulo 4: Plantel y Ficha de Jugadores (`/jugadores`, `/jugadores/:id`)](#4-módulo-plantel-y-ficha-de-jugadores)
5. [Módulo 5: Matriz de Disponibilidad Horaria (`/disponibilidad`)](#5-módulo-matriz-de-disponibilidad-horaria)
6. [Módulo 6: Estadísticas, Gráficos y Métricas (`/estadisticas`)](#6-módulo-estadísticas-gráficos-y-métricas)
7. [Módulo 7: Arquitectura Supabase, Seguridad y Políticas RLS](#7-módulo-arquitectura-supabase-seguridad-y-políticas-rls)

---

## 1. Módulo: Autenticación, Roles y Perfil

### 🎯 Objetivo
Gestionar el acceso seguro a la plataforma, diferenciar los privilegios operativos entre **Administradores** y **Jugadores del Plantel**, y permitir a cada miembro personalizar su ficha.

### 🔍 Cómo Revisar (Checklist de QA)
- [x] Iniciar sesión con un correo institucional `@nablus.cl` o registrar una nueva cuenta con nombre, posición y fecha de nacimiento.
- [x] Probar el formulario de "Olvidé mi contraseña" en `/login`.
- [x] Verificar que en la barra superior se visualice la píldora de rol correspondiente (*Modo Administrador* vs *Modo Jugador*).
- [x] Probar el selector rápido de usuario de prueba en la cabecera para alternar entre perfiles y verificar cómo reacciona la UI.
- [x] En `/perfil`, editar el nombre, posición preferida, fecha de nacimiento y actualizar contraseña.
- [x] Como Administrador, acceder al panel "Gestión de Roles del Plantel" en `/perfil` y probar promover/degradar roles con un solo clic.

### 🎨 Diseño y Estética UI
- **Píldoras de Rol**: Badge morado suave (`bg-nablus-primary/10 text-nablus-primary-dark`) para Administrador y gris neutro (`bg-gray-100 text-gray-700`) para Jugador.
- **Microinteracciones**: Dropdown flotante con `animate-scale-in`, borde sutil y avatares circulares con iniciales o foto.

### ⚡ Funcionalidades y Flujos
- **Admin**: Acceso prioritario a botones de creación de partidos, edición de marcadores y planillaje.
- **Jugador**: Entorno enfocado en responder convocatorias, declarar disponibilidad y revisar métricas personales.

### 🗄️ Conexión BBDD y RLS
- **Tabla**: `public.users`
- **Operaciones**:
  - `SELECT * FROM users WHERE id = auth.uid()`
  - `UPDATE users SET nombre = $1, posicion_preferida = $2 WHERE id = auth.uid()`
- **RLS**: Cada usuario solo puede ejecutar `UPDATE` sobre su propio registro (`auth.uid() = id`). Los administradores (`is_admin() = true`) tienen permiso de gestión total.

---

## 2. Módulo: Calendario y Convocatorias

### 🎯 Objetivo
Centralizar el cronograma deportivo oficial, permitiendo visualizar los partidos en formato de **Mes Completo** o **Lista Cronológica**, y permitiendo al jugador confirmar o rechazar su asistencia en 1 clic.

### 🔍 Cómo Revisar (Checklist de QA)
- [x] Alternar entre la vista de **Mes completo** (cuadrícula 7x5) y la vista de **Lista**.
- [x] Navegar entre meses (mes anterior, siguiente y botón "Hoy").
- [x] Verificar que los días con partido muestren la tarjeta correspondiente con hora, formato (ej. 7v7) y badge de estado píldora.
- [x] Si el usuario activo tiene una invitación pendiente, verificar que aparezca el botón verde "Confirmar" directo en la celda o timeline.
- [x] Probar el filtro "Mis partidos convocados" vs "Todos los partidos".
- [x] Sincronización con Google Calendar / iCal implementada.

### 🎨 Diseño y Estética UI
- **Cuadrícula**: Celdas con altura mínima responsiva (`min-h-[120px]`), día actual resaltado con anillo de color Nablus y fondo suave `bg-nablus-primary/5`.
- **Badges de Asistencia**:
  - *Confirmado*: Píldora verde esmeralda con icono `CheckCircle2`.
  - *Pendiente*: Píldora ámbar con animación de pulso sutil `animate-pulse`.
  - *Rechazado*: Píldora rosada con icono `XCircle`.

### 🗄️ Conexión BBDD y RLS
- **Tablas**: `partidos`, `partido_jugadores`
- **Operación de Confirmación**:
  ```sql
  UPDATE partido_jugadores 
  SET estado_invitacion = 'confirmado' 
  WHERE partido_id = $1 AND jugador_id = auth.uid();
  ```
- **RLS**: Cada jugador tiene permiso exclusivo de modificar su propio `estado_invitacion`.

---

## 3. Módulo: Gestión de Partidos y Alineaciones

### 🎯 Objetivo
Permitir la creación, edición, sorteo algorítmico de equipos (Equipo A vs Equipo B) y registro de incidencias en vivo (goles, asistencias, tarjetas amarillas y rojas, MVP).

### 🔍 Cómo Revisar (Checklist de QA)
- [ ] Como **Admin**:
  - Acceder a `/partidos/crear`, completar formulario (fecha, hora, cancha, formato 7v7) e invitar jugadores.
  - En `/partidos/:id`, presionar "Sortear equipos al azar" y verificar que los jugadores confirmados se dividan equitativamente entre Equipo A y Equipo B.
  - Abrir "Registrar evento", agregar un gol para un jugador y verificar que el marcador del partido se incremente automáticamente.
  - Eliminar un evento y comprobar que el marcador se descuente en tiempo real.
  - Asignar el MVP del encuentro y marcar el partido como "Finalizado".
- [ ] Como **Jugador**:
  - Verificar que los botones de crear, editar partido, sortear equipos y registrar eventos estén bloqueados/ocultos.
  - Comprobar que sí pueda ver las alineaciones, el mapa de la cancha y responder a su convocatoria.

### 🎨 Diseño y Estética UI
- **Marcador en Vivo**: Marcador central tipo tablero deportivo con tipografía monoespaciada de alto impacto y badge de estado superior.
- **Alineaciones**: Columnas lado a lado para Equipo A y Equipo B con avatares, nombres, posiciones y badges de incidencias en miniatura (⚽, 👟, 🟨, 🟥).

### 🗄️ Conexión BBDD y RLS
- **Tablas**: `partidos`, `partido_jugadores`, `partido_eventos`
- **RLS**: Creación, actualización y eliminación de eventos y partidos restringida a `is_admin() = true`.

---

## 4. Módulo: Plantel y Ficha de Jugadores

### 🎯 Objetivo
Directorio integral de los miembros del equipo con tabla avanzada y ficha técnica individual con historial de partidos y gráficos de distribución.

### 🔍 Cómo Revisar (Checklist de QA)
- [ ] En `/jugadores`, probar el buscador por nombre o correo electrónico.
- [ ] Ordenar por columnas: Partidos jugados (PJ), Goles, Asistencias, MVPs.
- [ ] Hacer clic en un jugador para navegar a su ficha `/jugadores/:id`.
- [ ] Validar que la ficha muestre la tasa de efectividad (victorias %), total de goles, asistencias y el gráfico circular (`PieChart`) de distribución de acciones.

### 🎨 Diseño y Estética UI
- **Tabla**: Filas con hover suave, badges por posición cromáticamente diferenciados (*Arquero* = rojo suave, *Defensa* = azul, *Mediocampo* = verde, *Delantero* = morado Nablus).
- **Ficha**: Header con avatar grande, posición, correo corporativo y tarjetas de métricas en cuadrícula responsiva.

### 🗄️ Conexión BBDD y RLS
- **Tablas**: `users`, `partido_jugadores`, `partido_eventos`
- **Cálculo**: Todas las cifras se calculan reactivamente a través de `calculatePlayerStats` en `src/services/statsService.js`.

---

## 5. Módulo: Matriz de Disponibilidad Horaria

### 🎯 Objetivo
Matriz interactiva semanal drag-to-select para que cada jugador declare sus horarios libres entre 17:00 y 22:00 hrs de lunes a domingo.

### 🔍 Cómo Revisar (Checklist de QA)
- [ ] Hacer clic y arrastrar el cursor sobre las celdas horarias para marcar/desmarcar disponibilidad.
- [ ] Presionar "Guardar disponibilidad" y verificar el feedback visual de éxito.
- [ ] Cambiar de usuario en la barra superior y comprobar que la matriz recargue automáticamente los horarios correspondientes al nuevo usuario seleccionado.

### 🎨 Diseño y Estética UI
- **Matriz**: Celdas con bordes suaves; celdas seleccionadas en tono Nablus primario (`bg-nablus-primary text-white font-bold`).
- **Resumen**: Contador en vivo de bloques y horas totales disponibles por semana.

### 🗄️ Conexión BBDD y RLS
- **Tabla**: `public.disponibilidad`
- **Operaciones**: `DELETE` e `INSERT` por lotes de los bloques horarios asociados a `jugador_id = auth.uid()`.
- **RLS**: `auth.uid() = jugador_id` para modificaciones; lectura pública para miembros autenticados del equipo.

---

## 6. Módulo: Estadísticas, Gráficos y Métricas

### 🎯 Objetivo
Visualizar el rendimiento global del equipo mediante gráficos Recharts, rankings individuales de goleadores, asistidores, MVPs y radar de habilidades del mejor jugador del plantel.

### 🔍 Cómo Revisar (Checklist de QA)
- [ ] Comprobar que los totales del equipo (Goles marcados, Asistencias, Amarillas, Rojas, Partidos disputados) coincidan exactamente con la suma de los partidos registrados.
- [ ] Verificar el gráfico de "Goles y Asistencias por Posición" (delanteros, mediocampistas, defensas, arqueros).
- [ ] Revisar el Radar Chart (`RadarChart` de Recharts) con los 5 ejes: Goles, Asistencias, Partidos, MVPs y Disciplina.
- [ ] Comprobar los rankings Top 5 por categoría.

### 🎨 Diseño y Estética UI
- **Radar Chart**: Polígono translúcido con relleno `#A493DC` y opacidad 0.35, vértices circulares y ejes polares limpios.
- **Rankings**: Tarjetas con podio numerado (#1, #2, #3 con fondo diferenciado), avatar del jugador y badge numérico en `JetBrains Mono`.

---

## 7. Módulo: Arquitectura Supabase, Seguridad y Políticas RLS

### 🎯 Objetivo
Garantizar la integridad referencial, velocidad de consulta y aislamiento de datos mediante Row Level Security en PostgreSQL 17.

### 🔍 Checklist de Seguridad RLS
- [x] RLS activado en todas las tablas (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- [x] Función de verificación `public.is_admin()` con `SECURITY DEFINER`.
- [x] Políticas de lectura para usuarios autenticados en todas las tablas del equipo.
- [x] Políticas de escritura de partidos, eventos y alineaciones exclusivas para administradores.
- [x] Políticas de actualización de invitaciones y disponibilidad restringidas al propio `auth.uid()`.
- [x] Índices creados en columnas de alta frecuencia de consulta (`partidos(fecha)`, `partidos(estado)`, `partido_jugadores(partido_id, jugador_id)`).

---

## 🚀 Próximas Mejoras Planificadas

1. **Notificaciones Push / Email**: Alertas automáticas cuando un administrador crea un nuevo partido o envía una convocatoria.
2. **Matriz de Disponibilidad Cruzada**: Vista consolidada donde el administrador visualiza un mapa de calor con el quorum de todo el plantel para elegir el horario óptimo.
3. **Planillero Móvil Touch**: Interfaz rápida para usar al costado de la cancha desde el celular durante el partido.
4. **Módulo Liga Interempresas**: Tabla de posiciones, fixture automatizado y sanciones por tarjetas.
