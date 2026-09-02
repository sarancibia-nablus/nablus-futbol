# Arquitectura de Base de Datos — Fútbol Nablus

**Proyecto Supabase**: `nablus-ligafutbol` (`vbvaooofkxnkgujtmtcy`)  
**Motor**: PostgreSQL 17  
**Seguridad**: Row Level Security (RLS) habilitado en todas las tablas

---

## 🗄️ Esquema Relacional de Tablas

### 1. Tabla: `users` (Perfiles de Jugadores y Administradores)
Almacena la información de perfil asociada a cada cuenta de autenticación (`auth.users`).

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, FK → `auth.users.id` (ON DELETE CASCADE) | Identificador único del usuario |
| `email` | TEXT | UNIQUE, NOT NULL | Correo electrónico corporativo (@nablus.cl) |
| `nombre` | TEXT | NOT NULL | Nombre completo del jugador |
| `fecha_nacimiento` | DATE | NULLABLE | Fecha de nacimiento |
| `avatar_url` | TEXT | NULLABLE | URL pública de la foto de perfil en Supabase Storage |
| `avatar_path` | TEXT | NULLABLE | Ruta interna del archivo dentro del bucket `fotos_perfil` |
| `posicion_preferida` | `posicion_enum` | NOT NULL, DEFAULT `'mediocampo'` | `arquero`, `defensa`, `mediocampo`, `delantero` |
| `equipo_id` | UUID | NULLABLE, FK → `equipos.id` | Equipo al que pertenece el jugador |
| `es_admin` | BOOLEAN | NOT NULL, DEFAULT `false` | Bandera de permisos administrativos |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Fecha de registro en el sistema |

---

### 2. Tabla: `equipos` (Organizaciones y Planteles)
Almacena los equipos registrados en el sistema.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `uuid_generate_v4()` | Identificador del equipo |
| `nombre` | TEXT | NOT NULL | Nombre oficial del equipo (ej. *Nablus FC*) |
| `dominio` | TEXT | UNIQUE, NULLABLE | Dominio asociado para auto-ingreso (ej. *nablus.cl*) |
| `imagen_url` | TEXT | NULLABLE | Escudo/logotipo del equipo |
| `email_contacto` | TEXT | NOT NULL | Correo de coordinación |
| `admin_id` | UUID | NULLABLE, FK → `users.id` | Usuario administrador del equipo |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Fecha de creación del equipo |

---

### 3. Tabla: `partidos` (Encuentros Deportivos)
Almacena cada partido organizado por el equipo.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `uuid_generate_v4()` | Identificador del partido |
| `equipo_id` | UUID | NOT NULL, FK → `equipos.id` | Equipo organizador |
| `fecha` | TIMESTAMPTZ | NOT NULL | Fecha y hora de inicio del partido |
| `ubicacion` | TEXT | NOT NULL | Nombre del complejo deportivo / cancha |
| `ubicacion_url` | TEXT | NULLABLE | Enlace a Google Maps |
| `estado` | `partido_estado_enum` | NOT NULL, DEFAULT `'programado'` | `'programado'`, `'en_curso'`, `'finalizado'`, `'cancelado'` |
| `formato` | TEXT | NOT NULL, DEFAULT `'7v7'` | Modalidad: `'5v5'`, `'6v6'`, `'7v7'`, `'8v8'`, `'11v11'` |
| `resultado_equipo_a`| INTEGER | DEFAULT `0` | Goles marcados por Equipo A |
| `resultado_equipo_b`| INTEGER | DEFAULT `0` | Goles marcados por Equipo B |
| `mvp_id` | UUID | NULLABLE, FK → `users.id` | Mejor jugador del partido |
| `created_by` | UUID | NULLABLE, FK → `users.id` | Administrador que programó el partido |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Fecha de creación del registro |

---

### 4. Tabla: `partido_jugadores` (Convocatorias y Alineaciones)
Gestiona la lista de convocados, su estado de confirmación y el equipo asignado para el partido.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `uuid_generate_v4()` | Identificador de la convocatoria |
| `partido_id` | UUID | NOT NULL, FK → `partidos.id` (CASCADE) | Partido asociado |
| `jugador_id` | UUID | NOT NULL, FK → `users.id` (CASCADE) | Jugador convocado |
| `equipo_partido` | `equipo_partido_enum` | NULLABLE | Asignación: `'equipo_a'`, `'equipo_b'` o `null` (en banca/pendiente) |
| `estado_invitacion`| `invitacion_estado_enum`| NOT NULL, DEFAULT `'pendiente'` | `'pendiente'`, `'confirmado'`, `'rechazado'` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Fecha de envío de convocatoria |

---

### 5. Tabla: `partido_eventos` (Minuto a Minuto del Partido)
Registra todos los hitos ocurridos durante el partido.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `uuid_generate_v4()` | Identificador del evento |
| `partido_id` | UUID | NOT NULL, FK → `partidos.id` (CASCADE) | Partido donde ocurrió |
| `jugador_id` | UUID | NOT NULL, FK → `users.id` (CASCADE) | Jugador protagonista del evento |
| `tipo` | `evento_tipo_enum` | NOT NULL | `'gol'`, `'asistencia'`, `'tarjeta_amarilla'`, `'tarjeta_roja'` |
| `minuto` | INTEGER | NOT NULL (CHECK `minuto >= 0 AND minuto <= 120`) | Minuto del evento |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Fecha de registro |

---

### 6. Tabla: `disponibilidad` (Matriz Semanal de Jugadores)
Almacena las preferencias horarias declaradas por cada miembro del plantel.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `uuid_generate_v4()` | Identificador del bloque |
| `jugador_id` | UUID | NOT NULL, FK → `users.id` (CASCADE) | Jugador |
| `dia_semana` | INTEGER | NOT NULL (CHECK `0 <= dia_semana <= 6`) | 0 = Domingo, 1 = Lunes ... 6 = Sábado |
| `hora_inicio` | TIME | NOT NULL | Hora de inicio disponible (ej. `19:00:00`) |
| `hora_fin` | TIME | NOT NULL | Hora de término disponible (ej. `21:00:00`) |
| `tipo` | `disponibilidad_tipo_enum` | NOT NULL, DEFAULT `'semanal'` | `'semanal'`, `'mensual'` |
| `fecha_especifica`| DATE | NULLABLE | Fecha puntual para bloqueos específicos |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Fecha de registro |

---

## 🔗 Diagrama de Relaciones

```
users (1) ──────────< (N) partido_jugadores (N) >────────── (1) partidos
users (1) ──────────< (N) partido_eventos   (N) >────────── (1) partidos
users (1) ──────────< (N) disponibilidad
equipos (1) ────────< (N) partidos
equipos (1) ────────< (N) users
invitados (1) ──────< (N) partido_invitados (N) >────────── (1) partidos
```

### 7. Tabla: `invitados` (Jugadores Extra sin cuenta)
Registro de participantes que no tienen acceso al sistema pero pueden ser incluidos en partidos.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Identificador del invitado |
| `nombre` | TEXT | NOT NULL | Nombre completo |
| `email` | TEXT | NULLABLE | Correo de contacto (solo referencial) |
| `posicion_preferida` | TEXT | NOT NULL, DEFAULT `'mediocampo'` | Posición habitual |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Fecha de registro |

### 8. Tabla: `partido_invitados` (Asignación de Extras a Partidos)
Vincula invitados a partidos. Los invitados entran automáticamente como confirmados.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador |
| `partido_id` | UUID | NOT NULL, FK → `partidos.id` (CASCADE) | Partido |
| `invitado_id` | UUID | NOT NULL, FK → `invitados.id` (CASCADE) | Invitado |
| `equipo_partido` | TEXT | CHECK `equipo_a` \| `equipo_b` | Equipo asignado |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Fecha |

---

## 🛡️ Políticas Row Level Security (RLS)

### Función de Verificación de Administrador
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND es_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Resumen de Políticas por Tabla
1. **`users`**:
   - `SELECT`: Cualquier usuario autenticado puede leer perfiles del equipo.
   - `UPDATE`: Los usuarios solo pueden modificar su propio perfil (`auth.uid() = id`).
   - `ALL`: Los administradores (`is_admin() = true`) pueden gestionar todos los perfiles.
2. **`partidos`**:
   - `SELECT`: Usuarios autenticados pueden ver todos los partidos.
   - `INSERT / UPDATE / DELETE`: Exclusivo para administradores (`is_admin() = true`).
3. **`partido_jugadores`**:
   - `SELECT`: Usuarios autenticados pueden ver convocatorias y alineaciones.
   - `UPDATE`: El jugador convocado puede actualizar su propio `estado_invitacion` (`auth.uid() = jugador_id`).
   - `ALL`: Los administradores pueden gestionar invitaciones y asignar `equipo_partido`.
4. **`partido_eventos`**:
   - `SELECT`: Lectura pública para autenticados.
   - `INSERT / UPDATE / DELETE`: Exclusivo para administradores.
5. **`disponibilidad`**:
   - `SELECT`: Lectura para todos los usuarios autenticados.
   - `INSERT / UPDATE / DELETE`: Cada jugador solo puede gestionar sus propios horarios (`auth.uid() = jugador_id`).
   - `ALL`: Administradores pueden consultar y gestionar disponibilidades.

---

## 🔐 Trigger de Sincronización Automática con `auth.users`

Al registrarse un nuevo usuario a través de Supabase Auth (`/login` o `supabase.auth.signUp()`), un trigger `SECURITY DEFINER` inserta automáticamente la ficha de perfil en `public.users`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (
        id, email, nombre, posicion_preferida, fecha_nacimiento, es_admin
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'posicion_preferida', 'mediocampo'),
        CASE 
            WHEN new.raw_user_meta_data->>'fecha_nacimiento' IS NOT NULL AND new.raw_user_meta_data->>'fecha_nacimiento' <> '' 
            THEN (new.raw_user_meta_data->>'fecha_nacimiento')::date 
            ELSE NULL 
        END,
        COALESCE((new.raw_user_meta_data->>'es_admin')::boolean, (new.email ILIKE '%sebastian%@nablus.cl' OR new.email ILIKE '%admin%@nablus.cl'))
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        nombre = EXCLUDED.nombre;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## ⚡ Capa de Servicios y Agregación en Frontend

- **`src/services/dbService.js`**: Abstrae las operaciones de consulta y mutación con Supabase para `users`, `partidos`, `partido_jugadores`, `partido_eventos` y `disponibilidad`, con fallback de persistencia reactiva.
- **`src/services/statsService.js`**: Procesa en memoria y tiempo real todos los eventos (`partido_eventos`), alineaciones y resultados para alimentar dinámicamente los gráficos Recharts (`BarChart`, `RadarChart`, `PieChart`), tablas de goleadores, rankings y KPIs del sistema sin disparar queries pesadas innecesarias.

---

## 📂 Archivos SQL y Guías Asociadas
- **Script DDL + RLS Maestro**: [`supabase/migrations/20260825_complete_nablus_schema.sql`](file:///Users/sebastianarancibiahervia/Library/CloudStorage/GoogleDrive-sebastian.arancibiahervia@gmail.com/Mi%20unidad/Sites/futbol-nablus/supabase/migrations/20260825_complete_nablus_schema.sql)
- **Guía de Revisión Módulo a Módulo**: [`roadmap-detallado-modulos.md`](file:///Users/sebastianarancibiahervia/Library/CloudStorage/GoogleDrive-sebastian.arancibiahervia@gmail.com/Mi%20unidad/Sites/futbol-nablus/roadmap-detallado-modulos.md)


