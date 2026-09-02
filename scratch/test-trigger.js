import pg from 'pg';

const { Client } = pg;
const connStr = 'postgresql://postgres.vbvaooofkxnkgujtmtcy:Nablusligafutbol@aws-0-us-east-2.pooler.supabase.com:6543/postgres';

async function runTest() {
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  try {
    console.log('Inserting into auth.users to trigger handle_new_user...');
    const res = await client.query(`
      SELECT tablename, policyname, cmd, qual 
      FROM pg_policies 
      WHERE schemaname = 'public';
    `);
    console.table(res.rows);
  } catch (err) {
    console.error('Trigger Error:', err);
  } finally {
    await client.end();
  }
}

runTest();
