-- Modificar las politicas para hacerlas más robustas y asegurar que no haya problemas de tipos
DROP POLICY IF EXISTS "Avatar insert access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar update access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar delete access" ON storage.objects;

-- Insertar requiere estar autenticado y que el bucket sea fotos_perfil
CREATE POLICY "Avatar insert access" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'fotos_perfil');

-- Update requiere estar autenticado y ser el dueño
CREATE POLICY "Avatar update access" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'fotos_perfil' AND auth.uid() = owner);

-- Delete requiere estar autenticado y ser el dueño
CREATE POLICY "Avatar delete access" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'fotos_perfil' AND auth.uid() = owner);
