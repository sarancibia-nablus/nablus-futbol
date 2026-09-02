-- ============================================================
-- MIGRACIÓN: Soporte de Invitados en Eventos y MVP
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Hacer jugador_id nullable en partido_eventos (para permitir invitados)
ALTER TABLE public.partido_eventos ALTER COLUMN jugador_id DROP NOT NULL;

-- 2. Agregar invitado_id a partido_eventos
ALTER TABLE public.partido_eventos 
  ADD COLUMN IF NOT EXISTS invitado_id UUID REFERENCES public.invitados(id) ON DELETE CASCADE;

-- 3. Constraint: exactamente uno de jugador_id o invitado_id debe estar presente
ALTER TABLE public.partido_eventos DROP CONSTRAINT IF EXISTS check_evento_player;
ALTER TABLE public.partido_eventos 
  ADD CONSTRAINT check_evento_player CHECK (
    (jugador_id IS NOT NULL AND invitado_id IS NULL) OR
    (jugador_id IS NULL AND invitado_id IS NOT NULL)
  );

-- 4. Agregar mvp_invitado_id a partidos
ALTER TABLE public.partidos 
  ADD COLUMN IF NOT EXISTS mvp_invitado_id UUID REFERENCES public.invitados(id) ON DELETE SET NULL;

-- 5. Índice para rendimiento
CREATE INDEX IF NOT EXISTS idx_partido_eventos_invitado ON public.partido_eventos(invitado_id);
