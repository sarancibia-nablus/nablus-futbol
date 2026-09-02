import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

const password = process.env.SUPABASE_DB_PASSWORD || 'Nablusligafutbol';
const projectId = 'vbvaooofkxnkgujtmtcy';

// Try connection options:
// 1. Transaction Pooler (port 6543)
// 2. Direct Session connection (port 5432)
// 3. AWS pooler us-east-2
const connectionStrings = [
  `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectId}.supabase.co:5432/postgres`,
];

const sqlFile = process.argv[2] || '20260825_complete_nablus_schema.sql';
const sqlPath = path.resolve(__dirname, '../supabase/migrations', sqlFile);
console.log(`Loading migration file: ${sqlFile}`);
const sql = fs.readFileSync(sqlPath, 'utf8');

async function runMigration() {
  let connectedClient = null;

  for (const connStr of connectionStrings) {
    console.log('Testing connection to:', connStr.replace(/:[^:@]+@/, ':***@'));
    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      console.log('✅ Connected successfully!');
      connectedClient = client;
      break;
    } catch (err) {
      console.warn('❌ Connection failed with this string:', err.message);
    }
  }

  if (!connectedClient) {
    console.error('Could not connect to any Supabase Postgres endpoint.');
    process.exit(1);
  }

  try {
    console.log('Running schema migration...');
    await connectedClient.query(sql);
    console.log('🎉 Migration applied successfully!');

    // Verify created tables
    const res = await connectedClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('Public tables in Supabase:');
    console.table(res.rows);
  } catch (err) {
    console.error('Error applying migration:', err);
    process.exit(1);
  } finally {
    await connectedClient.end();
  }
}

runMigration();
