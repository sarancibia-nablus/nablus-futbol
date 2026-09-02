-- ============================================================
-- MIGRACIÓN: Sistema de Invitados (Extras) para Nablus Fútbol
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tabla de invitados (jugadores sin cuenta en el sistema)
CREATE TABLE IF NOT EXISTS public.invitados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT,
    posicion_preferida TEXT NOT NULL DEFAULT 'mediocampo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla de asignación de invitados a partidos
CREATE TABLE IF NOT EXISTS public.partido_invitados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partido_id UUID NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
    invitado_id UUID NOT NULL REFERENCES public.invitados(id) ON DELETE CASCADE,
    equipo_partido TEXT CHECK (equipo_partido IN ('equipo_a', 'equipo_b')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(partido_id, invitado_id)
);

-- 3. Habilitar RLS
ALTER TABLE public.invitados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partido_invitados ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para invitados
CREATE POLICY "invitados_select" ON public.invitados
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "invitados_insert" ON public.invitados
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "invitados_update" ON public.invitados
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "invitados_delete" ON public.invitados
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "invitados_anon_select" ON public.invitados
    FOR SELECT TO anon USING (true);

-- 5. Políticas para partido_invitados
CREATE POLICY "partido_invitados_select" ON public.partido_invitados
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "partido_invitados_insert" ON public.partido_invitados
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "partido_invitados_update" ON public.partido_invitados
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "partido_invitados_delete" ON public.partido_invitados
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "partido_invitados_anon_select" ON public.partido_invitados
    FOR SELECT TO anon USING (true);

-- 6. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_partido_invitados_partido ON public.partido_invitados(partido_id);
CREATE INDEX IF NOT EXISTS idx_partido_invitados_invitado ON public.partido_invitados(invitado_id);
