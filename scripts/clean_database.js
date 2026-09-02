import pg from 'pg';

const { Client } = pg;
const password = process.env.SUPABASE_DB_PASSWORD || 'Nablusligafutbol';
const projectId = 'vbvaooofkxnkgujtmtcy';

const client = new Client({
  connectionString: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});

async function clean() {
  await client.connect();
  console.log('Limpiando datos falsos de la base de datos...');

  // Delete all mock rows
  await client.query(`DELETE FROM public.partido_eventos;`);
  await client.query(`DELETE FROM public.partido_jugadores;`);
  await client.query(`DELETE FROM public.partidos;`);
  await client.query(`DELETE FROM public.disponibilidad;`);
  await client.query(`DELETE FROM public.users;`);
  await client.query(`DELETE FROM auth.users WHERE email NOT ILIKE '%sarancibia%';`);

  // Ensure Nablus FC equipo exists
  await client.query(`
    INSERT INTO public.equipos (id, nombre, color_primario, color_secundario, email_contacto)
    VALUES ('eq_nablus', 'Nablus FC', '#A493DC', '#191919', 'sarancibia@nablus.cl')
    ON CONFLICT (id) DO UPDATE
    SET email_contacto = 'sarancibia@nablus.cl';
  `);

  // Update handle_new_user trigger to recognize sarancibia@nablus.cl as Capitan
  await client.query(`
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
            COALESCE((new.raw_user_meta_data->>'es_admin')::boolean, (new.email ILIKE '%sarancibia@nablus.cl%' OR new.email ILIKE '%admin%'))
        )
        ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            nombre = EXCLUDED.nombre,
            es_admin = CASE WHEN EXCLUDED.email ILIKE '%sarancibia@nablus.cl%' THEN true ELSE users.es_admin END;
        RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  console.log('✅ Base de datos limpia y lista para el registro del Capitán (sarancibia@nablus.cl)!');
  await client.end();
}

clean().catch((err) => {
  console.error(err);
  process.exit(1);
});
