-- ==============================================================================
-- Fútbol Nablus — Arquitectura de Base de Datos y Políticas RLS
-- Proyecto Supabase: nablus-ligafutbol (vbvaooofkxnkgujtmtcy)
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumeradores del Sistema
DO $$ BEGIN
    CREATE TYPE posicion_enum AS ENUM ('arquero', 'defensa', 'mediocampo', 'delantero');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE partido_estado_enum AS ENUM ('programado', 'en_curso', 'finalizado', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invitacion_estado_enum AS ENUM ('pendiente', 'confirmado', 'rechazado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE equipo_partido_enum AS ENUM ('equipo_a', 'equipo_b');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evento_tipo_enum AS ENUM ('gol', 'asistencia', 'tarjeta_amarilla', 'tarjeta_roja');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE disponibilidad_tipo_enum AS ENUM ('semanal', 'mensual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabla: equipos
CREATE TABLE IF NOT EXISTS public.equipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    imagen_url TEXT,
    email_contacto TEXT NOT NULL,
    admin_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla: users (Perfiles vinculados a auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    fecha_nacimiento DATE,
    avatar_url TEXT,
    posicion_preferida posicion_enum NOT NULL DEFAULT 'mediocampo',
    equipo_id UUID REFERENCES public.equipos(id) ON DELETE SET NULL,
    es_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Agregar relación de admin_id en equipos hacia users
ALTER TABLE public.equipos 
    DROP CONSTRAINT IF EXISTS fk_equipos_admin,
    ADD CONSTRAINT fk_equipos_admin FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 5. Tabla: partidos
CREATE TABLE IF NOT EXISTS public.partidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipo_id UUID REFERENCES public.equipos(id) ON DELETE CASCADE,
    fecha TIMESTAMPTZ NOT NULL,
    ubicacion TEXT NOT NULL,
    ubicacion_url TEXT,
    estado partido_estado_enum NOT NULL DEFAULT 'programado',
    formato TEXT NOT NULL DEFAULT '7v7',
    resultado_equipo_a INTEGER DEFAULT 0,
    resultado_equipo_b INTEGER DEFAULT 0,
    mvp_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Tabla: partido_jugadores (Convocatorias y Alineaciones)
CREATE TABLE IF NOT EXISTS public.partido_jugadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partido_id UUID NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
    jugador_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    equipo_partido equipo_partido_enum,
    estado_invitacion invitacion_estado_enum NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(partido_id, jugador_id)
);

-- 7. Tabla: partido_eventos (Goles, Asistencias, Tarjetas)
CREATE TABLE IF NOT EXISTS public.partido_eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partido_id UUID NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
    jugador_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tipo evento_tipo_enum NOT NULL,
    minuto INTEGER NOT NULL CHECK (minuto >= 0 AND minuto <= 120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Tabla: disponibilidad (Horarios semanales de jugadores)
CREATE TABLE IF NOT EXISTS public.disponibilidad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jugador_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo disponibilidad_tipo_enum NOT NULL DEFAULT 'semanal',
    fecha_especifica DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Índices para Alto Rendimiento
CREATE INDEX IF NOT EXISTS idx_partidos_fecha ON public.partidos(fecha);
CREATE INDEX IF NOT EXISTS idx_partidos_estado ON public.partidos(estado);
CREATE INDEX IF NOT EXISTS idx_partido_jugadores_partido ON public.partido_jugadores(partido_id);
CREATE INDEX IF NOT EXISTS idx_partido_jugadores_jugador ON public.partido_jugadores(jugador_id);
CREATE INDEX IF NOT EXISTS idx_partido_eventos_partido ON public.partido_eventos(partido_id);
CREATE INDEX IF NOT EXISTS idx_disponibilidad_jugador ON public.disponibilidad(jugador_id);

-- ==============================================================================
-- 10. SEGURIDAD Y POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partido_jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partido_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidad ENABLE ROW LEVEL SECURITY;

-- Función helper para verificar si el usuario autenticado es Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND es_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLÍTICAS: users
DROP POLICY IF EXISTS "Lectura de perfiles para usuarios autenticados" ON public.users;
CREATE POLICY "Lectura de perfiles para usuarios autenticados"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuarios editan su propio perfil" ON public.users;
CREATE POLICY "Usuarios editan su propio perfil"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins gestionan perfiles" ON public.users;
CREATE POLICY "Admins gestionan perfiles"
    ON public.users FOR ALL
    TO authenticated
    USING (public.is_admin());

-- POLÍTICAS: equipos
DROP POLICY IF EXISTS "Lectura de equipos para autenticados" ON public.equipos;
CREATE POLICY "Lectura de equipos para autenticados"
    ON public.equipos FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins gestionan equipos" ON public.equipos;
CREATE POLICY "Admins gestionan equipos"
    ON public.equipos FOR ALL
    TO authenticated
    USING (public.is_admin());

-- POLÍTICAS: partidos
DROP POLICY IF EXISTS "Lectura de partidos para autenticados" ON public.partidos;
CREATE POLICY "Lectura de partidos para autenticados"
    ON public.partidos FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins crean partidos" ON public.partidos;
CREATE POLICY "Admins crean partidos"
    ON public.partidos FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins modifican partidos" ON public.partidos;
CREATE POLICY "Admins modifican partidos"
    ON public.partidos FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins eliminan partidos" ON public.partidos;
CREATE POLICY "Admins eliminan partidos"
    ON public.partidos FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- POLÍTICAS: partido_jugadores (Convocatorias)
DROP POLICY IF EXISTS "Lectura de convocatorias para autenticados" ON public.partido_jugadores;
CREATE POLICY "Lectura de convocatorias para autenticados"
    ON public.partido_jugadores FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Jugador actualiza su propio estado de asistencia" ON public.partido_jugadores;
CREATE POLICY "Jugador actualiza su propio estado de asistencia"
    ON public.partido_jugadores FOR UPDATE
    TO authenticated
    USING (auth.uid() = jugador_id)
    WITH CHECK (auth.uid() = jugador_id);

DROP POLICY IF EXISTS "Admins gestionan todas las convocatorias" ON public.partido_jugadores;
CREATE POLICY "Admins gestionan todas las convocatorias"
    ON public.partido_jugadores FOR ALL
    TO authenticated
    USING (public.is_admin());

-- POLÍTICAS: partido_eventos (Goles, Tarjetas)
DROP POLICY IF EXISTS "Lectura de eventos para autenticados" ON public.partido_eventos;
CREATE POLICY "Lectura de eventos para autenticados"
    ON public.partido_eventos FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins gestionan eventos del partido" ON public.partido_eventos;
CREATE POLICY "Admins gestionan eventos del partido"
    ON public.partido_eventos FOR ALL
    TO authenticated
    USING (public.is_admin());

-- POLÍTICAS: disponibilidad
DROP POLICY IF EXISTS "Lectura de disponibilidad para autenticados" ON public.disponibilidad;
CREATE POLICY "Lectura de disponibilidad para autenticados"
    ON public.disponibilidad FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Jugador gestiona su propia disponibilidad" ON public.disponibilidad;
CREATE POLICY "Jugador gestiona su propia disponibilidad"
    ON public.disponibilidad FOR ALL
    TO authenticated
    USING (auth.uid() = jugador_id)
    WITH CHECK (auth.uid() = jugador_id);

DROP POLICY IF EXISTS "Admins pueden ver y gestionar disponibilidades" ON public.disponibilidad;
CREATE POLICY "Admins pueden ver y gestionar disponibilidades"
    ON public.disponibilidad FOR ALL
    TO authenticated
    USING (public.is_admin());
