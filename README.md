# Fútbol Nablus — SaaS de Gestión Deportiva

Plataforma SaaS profesional para la gestión integral de partidos de fútbol internos de la empresa Nablus y futura liga deportiva empresarial de la V Región.

---

## 👥 Sistema de Roles y Permisos

El sistema implementa control de acceso basado en roles (**RBAC**):

### 1. Rol Administrador (`es_admin: true`)
- **Gestión de Partidos**: Crear, editar, reprogramar y cancelar partidos (`/partidos/crear`, `/partidos/:id`).
- **Alineaciones y Sorteo**: Asignar jugadores a Equipo A / Equipo B o ejecutar sorteo automático balanceado.
- **Eventos en Vivo**: Registrar minuto a minuto de goles, asistencias, tarjetas amarillas y rojas, además de designar al MVP.
- **Convocatorias**: Invitar a miembros del plantel de forma masiva o individual.

### 2. Rol Jugador / Plantel (`es_admin: false`)
- **Disponibilidad Horaria (`/disponibilidad`)**: Matriz semanal interactiva (*drag-to-select*) para declarar horarios disponibles (17:00 a 22:00 hrs).
- **Calendario y Convocatorias (`/calendario`)**: Visualizar cronograma en vista de **Mes Completo** y **Lista**, con confirmación/rechazo de asistencia en 1 clic.
- **Ficha y Estadísticas (`/jugadores/:id`, `/estadisticas`)**: Consultar rendimiento individual, radar de habilidades, partidos jugados y rankings del plantel.
- **Perfil Personal (`/perfil`)**: Modificar datos de contacto, foto de perfil, posición en cancha y contraseña.

---

## 🔒 Acceso Protegido y Autenticación Obligatoria

La plataforma requiere **inicio de sesión obligatorio** para visualizar cualquier módulo del sistema. Las rutas están protegidas mediante `ProtectedRoute` en React Router y sesiones sincronizadas con Supabase Auth.

---

## 📦 Módulos del Sistema

### 1. Autenticación & Perfil (`/login`, `/perfil`)
- Inicio de sesión con correo institucional y contraseña.
- Registro de nuevos jugadores con asignación de posición y fecha de nacimiento.
- Recuperación de credenciales con Supabase Auth.
- Edición de avatar, fecha de nacimiento, posición preferida y actualización segura de credenciales.
- Panel de administración de roles para Administradores en `/perfil` (promover a Admin o degradar a Jugador en 1 clic).

### 2. Calendario Mensual & Convocatorias (`/calendario`)
- **Vista Mes Completo**: Cuadrícula mensual interactiva con navegación entre meses, identificación del día actual y tarjetas de partido.
- **Vista Cronograma (Lista)**: Línea de tiempo detallada con ubicación, formato y confirmados.
- **Estado de Convocatoria en 1 Clic**: Píldoras interactivas con estados (*Confirmado*, *Pendiente*, *Rechazado*).
- Filtros rápidos por "Todos los partidos" y "Mis partidos convocados".

### 3. Gestión Integral de Partidos (`/partidos`, `/partidos/crear`, `/partidos/:id`)
- Programación de partidos con formato (5v5 a 11v11), cancha y geolocalización.
- Edición de marcadores en tiempo real y asignación de MVP.
- Sorteo algorítmico balanceado de alineaciones (Equipo A vs Equipo B).
- Registro y eliminación de eventos en el timeline (goles, asistencias, tarjetas amarillas/rojas con minuto).

### 5. Directorio de Jugadores (`/jugadores`, `/jugadores/:id`)
- Directorio de miembros del plantel con tabla avanzada (búsqueda instantánea, filtros por posición y ordenamiento).
- Ficha de jugador con KPIs individuales, gráfico de distribución y partidos disputados.

### 6. Matriz de Disponibilidad Horaria (`/disponibilidad`)
- Matriz interactiva semanal por bloques horarios para que cada jugador marque su disponibilidad.

### 7. Estadísticas y Rendimiento (`/estadisticas`)
- Métricas consolidadas del plantel, desglose de goles y asistencias por posición, radar del mejor jugador del mes y top 5.

---

## 🎨 Sistema de Diseño y Estética UI

- **Preset**: Modern SaaS / Operational Clean.
- **Identidad Nablus**:
  - *Portage Primary*: `#A493DC`
  - *Portage Dark*: `#8472C6`
  - *Mistery Black*: `#191919`
  - *Seasalt Background*: `#FAFAFA`
  - Acentos: *Mint/Emerald* (`#10B981`), *Sky* (`#3B82F6`), *Amber* (`#F59E0B`), *Rose* (`#EF4444`).
- **Tipografía**: Inter (interfaz y lectura) + JetBrains Mono (cifras, marcadores y minutos).
- **Badges de Estado**: Píldoras redondeadas (`rounded-full`) con micro-indicadores luminosos de estado (*pulsing live dot* para partidos en curso).

---

## ⚡ Stack Tecnológico

- **Frontend**: React 19, Vite, Tailwind CSS v3.4, Lucide React, Recharts, GSAP.
- **Backend & Base de Datos**: Supabase (PostgreSQL 17, Row Level Security, Supabase Auth & Storage).
- **Cliente**: `@supabase/supabase-js`.
