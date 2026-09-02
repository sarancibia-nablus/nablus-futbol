-- Añadir columna avatar_path a users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_path TEXT;

-- Insertar bucket "fotos_perfil"
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos_perfil', 'fotos_perfil', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas para "fotos_perfil" si no existen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Avatar public access'
    ) THEN
        CREATE POLICY "Avatar public access" ON storage.objects FOR SELECT USING (bucket_id = 'fotos_perfil');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Avatar insert access'
    ) THEN
        CREATE POLICY "Avatar insert access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fotos_perfil' AND auth.uid() = owner);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Avatar update access'
    ) THEN
        CREATE POLICY "Avatar update access" ON storage.objects FOR UPDATE USING (bucket_id = 'fotos_perfil' AND auth.uid() = owner);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Avatar delete access'
    ) THEN
        CREATE POLICY "Avatar delete access" ON storage.objects FOR DELETE USING (bucket_id = 'fotos_perfil' AND auth.uid() = owner);
    END IF;
END $$;
