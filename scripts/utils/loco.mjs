
import { spawn, execSync, exec } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Loads .env from CWD (root)
import path from 'path';

// Supabase Setup
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
    console.log(`
LoCoOS CLI Tool 🚂
------------------
Usage: loco <command>

Commands:
  status    Show system health (PM2 + Agents)
  tasks     List pending tasks (High priority first)
  clean     Restart all services (fixes zombies)
  audit     Trigger hourly dashboard audit manually
  watch     Tail logs of all services
`);
    process.exit(0);
}

async function listTasks() {
    console.log('Fetching tasks...');
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: false });

    if (error) {
        console.error('Error fetching tasks:', error.message);
        return;
    }

    if (!tasks || tasks.length === 0) {
        console.log('No pending tasks! 🎉');
        return;
    }

    console.log('\n--- PENDING TASKS ---');
    tasks.forEach(t => {
        const pColor = t.priority === 0 ? '🔴' : (t.priority === 1 ? '🟡' : '🟢');
        console.log(`${pColor} [P${t.priority}] ${t.title}`);
        console.log(`   ${t.description}`);
    });
    console.log('---------------------\n');
}

function showStatus() {
    try {
        console.log('\n--- PM2 SERVICE STATUS ---');
        execSync('pm2 list', { stdio: 'inherit', env: { ...process.env, PM2_HOME: 'C:\\Users\\pjlos\\.pm2' } });

        console.log('\n--- OPENCLAW AGENT STATUS ---');
        // Check ports
        try {
            const ports = execSync('netstat -ano | findstr "18789 18790"', { encoding: 'utf8' });
            console.log(ports);
        } catch {
            console.log('Gateway ports (18789/18790) not visible in netstat.');
        }
    } catch (e) {
        console.error('Error checking status:', e.message);
    }
}

function cleanSystem() {
    console.log('🧹 Cleaning system...');
    try {
        execSync('pm2 delete all', { stdio: 'inherit', env: { ...process.env, PM2_HOME: 'C:\\Users\\pjlos\\.pm2' } });
    } catch { }

    console.log('🧟 Killing zombies...');
    try {
        execSync('taskkill /F /IM node.exe /T', { stdio: 'inherit' });
    } catch { }

    console.log('🚀 Restarting Ecosystem...');
    const ecosystemPath = path.resolve('ecosystem.json');
    execSync(`pm2 start "${ecosystemPath}"`, { stdio: 'inherit', env: { ...process.env, PM2_HOME: 'C:\\Users\\pjlos\\.pm2' } });
    execSync('pm2 save', { stdio: 'inherit', env: { ...process.env, PM2_HOME: 'C:\\Users\\pjlos\\.pm2' } });
    console.log('Done.');
}

function triggerAudit() {
    console.log('🔍 Triggering Audit via OpenClaw...');
    try {
        execSync('openclaw agent --agent ops --message "Perform Hourly Dashboard Audit: Check system status, log CPU/Memory, and check for failed tasks."', { stdio: 'inherit' });
    } catch (e) {
        console.error('Audit trigger failed:', e.message);
    }
}

switch (command) {
    case 'tasks':
        listTasks();
        break;
    case 'status':
        showStatus();
        break;
    case 'clean':
        cleanSystem();
        break;
    case 'audit':
        triggerAudit();
        break;
    case 'watch':
        execSync('pm2 logs', { stdio: 'inherit', env: { ...process.env, PM2_HOME: 'C:\\Users\\pjlos\\.pm2' } });
        break;
    default:
        console.log(`Unknown command: ${command}`);
}
