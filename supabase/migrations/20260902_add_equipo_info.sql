-- Migración: Añadir descripción y sitio web a equipos
-- Autor: Antigravity

ALTER TABLE public.equipos
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS sitio_web TEXT;
