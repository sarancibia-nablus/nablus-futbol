-- ==============================================================================
-- FÚTBOL NABLUS — ESQUEMA COMPLETO Y ARQUITECTURA DE DATOS PARA SUPABASE
-- Proyecto: nablus-ligafutbol (vbvaooofkxnkgujtmtcy)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: equipos
CREATE TABLE IF NOT EXISTS public.equipos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    logo_url TEXT,
    color_primario TEXT DEFAULT '#A493DC',
    color_secundario TEXT DEFAULT '#191919',
    email_contacto TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLA: users (Perfiles vinculados a auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    posicion_preferida TEXT NOT NULL DEFAULT 'mediocampo',
    fecha_nacimiento DATE,
    avatar_url TEXT,
    es_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABLA: partidos
CREATE TABLE IF NOT EXISTS public.partidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    lugar TEXT NOT NULL,
    cancha_nombre TEXT,
    direccion TEXT,
    mapa_url TEXT,
    formato TEXT NOT NULL DEFAULT '7v7',
    estado TEXT NOT NULL DEFAULT 'programado' CHECK (estado IN ('programado', 'en_curso', 'finalizado', 'cancelado')),
    resultado_equipo_a INT DEFAULT 0,
    resultado_equipo_b INT DEFAULT 0,
    mvp_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    notas TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABLA: partido_jugadores (Convocatorias y Alineaciones)
CREATE TABLE IF NOT EXISTS public.partido_jugadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partido_id UUID NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
    jugador_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    equipo_partido TEXT CHECK (equipo_partido IN ('equipo_a', 'equipo_b', NULL)),
    estado_invitacion TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado_invitacion IN ('pendiente', 'confirmado', 'rechazado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (partido_id, jugador_id)
);

-- 6. TABLA: partido_eventos (Goles, Asistencias, Tarjetas)
CREATE TABLE IF NOT EXISTS public.partido_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partido_id UUID NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
    jugador_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('gol', 'asistencia', 'amarilla', 'roja')),
    minuto INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. TABLA: disponibilidad (Matriz Horaria Semanal)
CREATE TABLE IF NOT EXISTS public.disponibilidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jugador_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Lun, 1=Mar, ..., 6=Dom
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'semanal',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 8. ÍNDICES DE RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_partidos_fecha ON public.partidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_partidos_estado ON public.partidos(estado);
CREATE INDEX IF NOT EXISTS idx_partido_jugadores_partido ON public.partido_jugadores(partido_id);
CREATE INDEX IF NOT EXISTS idx_partido_jugadores_jugador ON public.partido_jugadores(jugador_id);
CREATE INDEX IF NOT EXISTS idx_partido_eventos_partido ON public.partido_eventos(partido_id);
CREATE INDEX IF NOT EXISTS idx_partido_eventos_jugador ON public.partido_eventos(jugador_id);
CREATE INDEX IF NOT EXISTS idx_disponibilidad_jugador ON public.disponibilidad(jugador_id);

-- ==============================================================================
-- 9. TRIGGER DE AUTENTICACIÓN: auth.users -> public.users
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (
        id, 
        email, 
        nombre, 
        posicion_preferida, 
        fecha_nacimiento, 
        es_admin
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 10. POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partido_jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partido_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidad ENABLE ROW LEVEL SECURITY;

-- Helper: Es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND es_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: equipos
DROP POLICY IF EXISTS "Equipos: lectura pública autenticada" ON public.equipos;
CREATE POLICY "Equipos: lectura pública autenticada" ON public.equipos
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Equipos: modificación admin" ON public.equipos;
CREATE POLICY "Equipos: modificación admin" ON public.equipos
    FOR ALL TO authenticated USING (public.is_admin());

-- RLS: users
DROP POLICY IF EXISTS "Users: lectura pública autenticada" ON public.users;
CREATE POLICY "Users: lectura pública autenticada" ON public.users
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users: actualización propia" ON public.users;
CREATE POLICY "Users: actualización propia" ON public.users
    FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users: administración total" ON public.users;
CREATE POLICY "Users: administración total" ON public.users
    FOR ALL TO authenticated USING (public.is_admin());

-- RLS: partidos
DROP POLICY IF EXISTS "Partidos: lectura pública autenticada" ON public.partidos;
CREATE POLICY "Partidos: lectura pública autenticada" ON public.partidos
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Partidos: gestión admin" ON public.partidos;
CREATE POLICY "Partidos: gestión admin" ON public.partidos
    FOR ALL TO authenticated USING (public.is_admin());

-- RLS: partido_jugadores
DROP POLICY IF EXISTS "PartidoJugadores: lectura pública autenticada" ON public.partido_jugadores;
CREATE POLICY "PartidoJugadores: lectura pública autenticada" ON public.partido_jugadores
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "PartidoJugadores: actualización propia de invitación" ON public.partido_jugadores;
CREATE POLICY "PartidoJugadores: actualización propia de invitación" ON public.partido_jugadores
    FOR UPDATE TO authenticated USING (auth.uid() = jugador_id);

DROP POLICY IF EXISTS "PartidoJugadores: gestión admin" ON public.partido_jugadores;
CREATE POLICY "PartidoJugadores: gestión admin" ON public.partido_jugadores
    FOR ALL TO authenticated USING (public.is_admin());

-- RLS: partido_eventos
DROP POLICY IF EXISTS "PartidoEventos: lectura pública autenticada" ON public.partido_eventos;
CREATE POLICY "PartidoEventos: lectura pública autenticada" ON public.partido_eventos
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "PartidoEventos: gestión admin" ON public.partido_eventos;
CREATE POLICY "PartidoEventos: gestión admin" ON public.partido_eventos
    FOR ALL TO authenticated USING (public.is_admin());

-- RLS: disponibilidad
DROP POLICY IF EXISTS "Disponibilidad: lectura pública autenticada" ON public.disponibilidad;
CREATE POLICY "Disponibilidad: lectura pública autenticada" ON public.disponibilidad
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Disponibilidad: gestión propia" ON public.disponibilidad;
CREATE POLICY "Disponibilidad: gestión propia" ON public.disponibilidad
    FOR ALL TO authenticated USING (auth.uid() = jugador_id);

-- ==============================================================================
-- 11. REGISTRO INICIAL DE EQUIPO
-- ==============================================================================
INSERT INTO public.equipos (id, nombre, color_primario, color_secundario, email_contacto)
VALUES ('eq_nablus', 'Nablus FC', '#A493DC', '#191919', 'contacto@nablus.cl')
ON CONFLICT (id) DO NOTHING;
