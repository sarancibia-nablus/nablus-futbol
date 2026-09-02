import pg from 'pg';

const { Client } = pg;
const connStr = 'postgresql://postgres.vbvaooofkxnkgujtmtcy:Nablusligafutbol@aws-0-us-east-2.pooler.supabase.com:6543/postgres';

async function runTest() {
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  try {
    console.log('Inserting into auth.users to trigger handle_new_user...');
    const uuid = '11111111-2222-3333-4444-555555555555';
    
    const res = await client.query(`
      DELETE FROM auth.users WHERE id = $1;
    `, [uuid]);
    console.log('Success! Test user deleted.');
  } catch (err) {
    console.error('Trigger Error:', err);
  } finally {
    await client.end();
  }
}

runTest();
