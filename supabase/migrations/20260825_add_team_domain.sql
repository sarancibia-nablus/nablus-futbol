-- 1. Añadir columna de dominio a la tabla equipos
ALTER TABLE public.equipos ADD COLUMN IF NOT EXISTS dominio TEXT UNIQUE;

-- 2. Asignar el dominio de nablus al equipo por defecto
UPDATE public.equipos SET dominio = 'nablus.cl' WHERE id = 'eq_nablus';

-- 3. Actualizar la función handle_new_user para asignar equipo automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    detected_domain TEXT;
    matched_equipo_id UUID;
BEGIN
    -- Extraer el dominio del correo (después de la arroba)
    detected_domain := split_part(new.email, '@', 2);
    
    -- Buscar si existe algún equipo con ese dominio
    SELECT id INTO matched_equipo_id 
    FROM public.equipos 
    WHERE dominio = detected_domain 
    LIMIT 1;

    -- Insertar el nuevo usuario
    INSERT INTO public.users (
        id, 
        email, 
        nombre, 
        posicion_preferida, 
        fecha_nacimiento, 
        es_admin,
        equipo_id
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
        COALESCE((new.raw_user_meta_data->>'es_admin')::boolean, (new.email ILIKE '%sebastian%@nablus.cl' OR new.email ILIKE '%admin%@nablus.cl')),
        matched_equipo_id
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        nombre = EXCLUDED.nombre;
        
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
