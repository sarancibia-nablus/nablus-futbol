import pg from 'pg';

const { Client } = pg;
const password = process.env.SUPABASE_DB_PASSWORD || 'Nablusligafutbol';
const projectId = 'vbvaooofkxnkgujtmtcy';

const client = new Client({
  connectionString: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});

const squad = [
  { id: 'a1111111-1111-1111-1111-111111111111', email: 'sebastian@nablus.cl', nombre: 'Sebastián Arancibia', posicion: 'mediocampo', nacimiento: '1992-04-15', es_admin: true },
  { id: 'a2222222-2222-2222-2222-222222222222', email: 'matias@nablus.cl', nombre: 'Matías Valenzuela', posicion: 'delantero', nacimiento: '1994-08-22', es_admin: false },
  { id: 'a3333333-3333-3333-3333-333333333333', email: 'rodrigo@nablus.cl', nombre: 'Rodrigo Henríquez', posicion: 'defensa', nacimiento: '1990-11-03', es_admin: false },
  { id: 'a4444444-4444-4444-4444-444444444444', email: 'felipe@nablus.cl', nombre: 'Felipe Morales', posicion: 'arquero', nacimiento: '1993-01-29', es_admin: false },
  { id: 'a5555555-5555-5555-5555-555555555555', email: 'cristobal@nablus.cl', nombre: 'Cristóbal Silva', posicion: 'mediocampo', nacimiento: '1996-07-12', es_admin: false },
  { id: 'a6666666-6666-6666-6666-666666666666', email: 'ignacio@nablus.cl', nombre: 'Ignacio Fuentes', posicion: 'defensa', nacimiento: '1991-09-18', es_admin: false },
  { id: 'a7777777-7777-7777-7777-777777777777', email: 'gonzalo@nablus.cl', nombre: 'Gonzalo Tapia', posicion: 'delantero', nacimiento: '1995-12-05', es_admin: false },
  { id: 'a8888888-8888-8888-8888-888888888888', email: 'diego@nablus.cl', nombre: 'Diego Castro', posicion: 'mediocampo', nacimiento: '1997-03-24', es_admin: false },
];

async function seed() {
  await client.connect();
  console.log('Inserting into auth.users and public.users...');

  for (const j of squad) {
    // 1. Insert into auth.users
    await client.query(`
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        $1,
        'authenticated',
        'authenticated',
        $2,
        crypt('123456', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        json_build_object('nombre', $3::text, 'posicion_preferida', $4::text, 'fecha_nacimiento', $5::text, 'es_admin', $6::boolean),
        now(),
        now()
      )
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          encrypted_password = crypt('123456', gen_salt('bf')),
          email_confirmed_at = now(),
          raw_user_meta_data = EXCLUDED.raw_user_meta_data;
    `, [j.id, j.email, j.nombre, j.posicion, j.nacimiento, j.es_admin]);
  }

  // 2. Insert initial matches in public.partidos
  const partido1Id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const partido2Id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  await client.query(`
    INSERT INTO public.partidos (id, fecha, hora, lugar, cancha_nombre, direccion, formato, estado, resultado_equipo_a, resultado_equipo_b, mvp_id, created_by)
    VALUES 
      ($1, '2026-08-28', '20:00:00', 'Complejo Deportivo Fortín', 'Cancha 2 (Sintética)', 'Av. Libertad 1250, Viña del Mar', '7v7', 'programado', 0, 0, NULL, $3),
      ($2, '2026-08-21', '21:00:00', 'Club Recreo Fútbol', 'Cancha Principal', 'Diego Portales 450, Viña del Mar', '7v7', 'finalizado', 5, 3, $4, $3)
    ON CONFLICT (id) DO NOTHING;
  `, [partido1Id, partido2Id, squad[0].id, squad[1].id]);

  // 3. Insert invitations for partido 1
  for (const j of squad) {
    await client.query(`
      INSERT INTO public.partido_jugadores (partido_id, jugador_id, equipo_partido, estado_invitacion)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (partido_id, jugador_id) DO UPDATE
      SET estado_invitacion = EXCLUDED.estado_invitacion;
    `, [partido1Id, j.id, Math.random() > 0.5 ? 'equipo_a' : 'equipo_b', 'confirmado']);
  }

  // 4. Insert invitations for partido 2 (finished match)
  for (let i = 0; i < squad.length; i++) {
    await client.query(`
      INSERT INTO public.partido_jugadores (partido_id, jugador_id, equipo_partido, estado_invitacion)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (partido_id, jugador_id) DO NOTHING;
    `, [partido2Id, squad[i].id, i < 4 ? 'equipo_a' : 'equipo_b', 'confirmado']);
  }

  // 5. Insert events for partido 2
  const eventos = [
    { partido_id: partido2Id, jugador_id: squad[1].id, tipo: 'gol', minuto: 12 },
    { partido_id: partido2Id, jugador_id: squad[0].id, tipo: 'asistencia', minuto: 12 },
    { partido_id: partido2Id, jugador_id: squad[1].id, tipo: 'gol', minuto: 24 },
    { partido_id: partido2Id, jugador_id: squad[6].id, tipo: 'gol', minuto: 30 },
    { partido_id: partido2Id, jugador_id: squad[0].id, tipo: 'gol', minuto: 42 },
    { partido_id: partido2Id, jugador_id: squad[1].id, tipo: 'gol', minuto: 48 },
    { partido_id: partido2Id, jugador_id: squad[2].id, tipo: 'amarilla', minuto: 35 },
  ];

  for (const ev of eventos) {
    await client.query(`
      INSERT INTO public.partido_eventos (partido_id, jugador_id, tipo, minuto)
      VALUES ($1, $2, $3, $4);
    `, [ev.partido_id, ev.jugador_id, ev.tipo, ev.minuto]);
  }

  console.log('✅ Base de datos sembrada con cuentas activas y partidos!');
  await client.end();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
