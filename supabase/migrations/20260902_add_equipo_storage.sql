-- Insertar bucket "logos_equipos"
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos_equipos', 'logos_equipos', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas para "logos_equipos" si no existen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Logos public access'
    ) THEN
        CREATE POLICY "Logos public access" ON storage.objects FOR SELECT USING (bucket_id = 'logos_equipos');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Logos insert access'
    ) THEN
        -- Permitir subir logos a cualquier usuario autenticado (se controla a nivel app quién lo hace o se podría limitar por RLS aquí)
        -- Lo más simple: el capitán lo hace, validado por public.is_admin() (o simplemente dejamos authenticated por facilidad de storage, confiando en update de la tabla)
        -- Haremos public.is_admin() para más seguridad si lo conectamos, pero public.is_admin() es para auth.uid().
        -- Como el ID del owner es auth.uid(), podemos asegurar que el que lo sube es admin (opcional). Usaremos authenticated por simpleza.
        CREATE POLICY "Logos insert access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos_equipos' AND auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Logos update access'
    ) THEN
        CREATE POLICY "Logos update access" ON storage.objects FOR UPDATE USING (bucket_id = 'logos_equipos' AND auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Logos delete access'
    ) THEN
        CREATE POLICY "Logos delete access" ON storage.objects FOR DELETE USING (bucket_id = 'logos_equipos' AND auth.role() = 'authenticated');
    END IF;
END $$;
