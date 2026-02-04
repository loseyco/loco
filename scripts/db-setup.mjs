import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString });
  const args = process.argv.slice(2);
  const logMsg = args.indexOf('--log') !== -1 ? args[args.indexOf('--log') + 1] : null;
  const status = args.indexOf('--status') !== -1 ? args[args.indexOf('--status') + 1] : null;
  const taskName = args.indexOf('--task') !== -1 ? args[args.indexOf('--task') + 1] : null;

  try {
    await client.connect();
    
    if (logMsg) {
      await client.query("INSERT INTO activity_logs (agent, action, details) VALUES ('ops', 'update', $1)", [logMsg]);
      console.log(`✅ Logged: ${logMsg}`);
    }

    if (status) {
      await client.query("UPDATE chase_status SET status = $1, current_task = $2, last_action = $3, updated_at = NOW()", 
        [status, taskName, logMsg || 'Status update']);
      console.log(`✅ Status updated: ${status} - ${taskName}`);
    }

    if (!logMsg && !status) {
      // Default setup check
      await client.query(`CREATE TABLE IF NOT EXISTS systems (id text PRIMARY KEY, hostname text, cpu_usage integer, memory_usage integer, uptime_seconds bigint, last_seen timestamptz DEFAULT now());`);
      console.log('🐘 Connected to Postgres. Systems table verified.');
    }

  } catch (err) {
    console.error('❌ DB Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
