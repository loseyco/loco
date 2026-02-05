const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, execSync, exec } = require('child_process');
const fs = require('fs');
require('dotenv').config(); // Load .env
const { createClient } = require('@supabase/supabase-js');

// --- SUPABASE SETUP ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const SYSTEM_ID = 'main-pc';

// --- REMOTE LISTENER ---
function setupRemoteListener() {
    console.log(`📡 Listening for remote commands for ${SYSTEM_ID}...`);

    supabase
        .channel('system-commands')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_commands', filter: `target_system=eq.${SYSTEM_ID}` }, async (payload) => {
            const { id, command, status } = payload.new;
            if (status !== 'pending') return;

            console.log(`⚡ Remote Command Received: ${command}`);

            try {
                if (command === 'start') await startSystem();
                else if (command === 'stop') await stopSystem();
                else if (command === 'kill') await killSystem();

                // Mark completed
                await supabase.from('system_commands').update({ status: 'completed', executed_at: new Date() }).eq('id', id);
            } catch (err) {
                console.error('Command failed:', err);
                await supabase.from('system_commands').update({ status: 'error', result_log: err.message }).eq('id', id);
            }
        })
        .subscribe();
}

// Helpers for reuse
async function startSystem() {
    // Re-using logic from system-control handler
    const ENV = { ...process.env, PM2_HOME: 'C:\\Users\\pjlos\\.pm2' };
    const prefs = getPrefs();

    // 1. Get List
    const list = JSON.parse(execSync('pm2 jlist', { env: ENV }).toString());

    // 2. If list is empty, start from ecosystem
    if (list.length === 0) {
        console.log('PM2 list empty, starting from ecosystem.json...');
        execSync('pm2 start C:\\LoCoOS\\ecosystem.json', { env: ENV });
        return;
    }

    // 3. Start Allowed Services
    list.forEach(p => {
        const shouldBoot = prefs[p.name]?.boot ?? true;
        if (shouldBoot && p.status !== 'online') {
            execSync(`pm2 start ${p.name}`, { env: ENV });
        } else if (!shouldBoot && p.status === 'online') {
            execSync(`pm2 stop ${p.name}`, { env: ENV });
        }
    });
}

async function stopSystem() {
    const ENV = { ...process.env, PM2_HOME: 'C:\\Users\\pjlos\\.pm2' };
    execSync('pm2 stop all', { env: ENV });
}

async function killSystem() {
    const ENV = { ...process.env, PM2_HOME: 'C:\\Users\\pjlos\\.pm2' };
    execSync('pm2 kill', { env: ENV });
}


const PORT = 3300;
let nextAppProcess = null;
let mainWindow = null;

function startNextJs() {
    console.log('Starting Next.js server on port 3300...');
    const sitePath = path.join('C:', 'LoCoOS', 'site');

    // 1. Kill anything on 3300 first (Silent)
    try {
        execSync('for /f "tokens=5" %a in (\'netstat -aon ^| find ":3300" ^| find "LISTENING"\') do taskkill /f /pid %a', {
            stdio: 'ignore',
            windowsHide: true
        });
    } catch (e) { }

    // 2. Spawn NPM silently
    nextProcess = spawn('cmd.exe', ['/c', 'npm run dev -- -p 3300'], {
        cwd: sitePath,
        env: { ...process.env, PORT: '3300' },
        windowsHide: true // <--- CRITICAL: No Popup
    });

    // Log to file since no window
    const logVal = (d) => { try { fs.appendFileSync('gui-dashboard.log', d.toString()); } catch (e) { } };
    nextProcess.stdout.on('data', logVal);
    nextProcess.stderr.on('data', logVal);
}

function createWindow() {
    startNextJs();

    startNextJs();

    mainWindow = new BrowserWindow({
        width: 1600,
        height: 1000,
        backgroundColor: '#1a1a1a',
        title: 'LoCo Mission Control',
        icon: path.join(__dirname, 'icon.ico'), // If exists
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            // Allow iframe to communicate if needed, but mostly isolated
        }
    });

    // Load local HTML (The Shell)
    mainWindow.loadFile('index.html');
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.whenReady().then(() => {
        setupRemoteListener(); // <--- START LISTENER
        createWindow();
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
}

app.on('will-quit', () => {
    if (nextProcess) spawn('taskkill', ['/pid', nextProcess.pid, '/f', '/t']);
});

// --- IPC HANDLERS ---
const PM2_HOME = 'C:\\Users\\pjlos\\.pm2';
const ENV = { ...process.env, PM2_HOME };
const PREFS_PATH = path.join(__dirname, 'service-prefs.json');

function getPrefs() {
    try {
        if (!fs.existsSync(PREFS_PATH)) return {};
        return JSON.parse(fs.readFileSync(PREFS_PATH, 'utf8'));
    } catch { return {}; }
}

function savePrefs(prefs) {
    fs.writeFileSync(PREFS_PATH, JSON.stringify(prefs, null, 2));
}

ipcMain.handle('get-status', async () => {
    try {
        const pm2Json = execSync('pm2 jlist', { encoding: 'utf8', env: ENV });
        const prefs = getPrefs();
        const liveProcs = JSON.parse(pm2Json);
        const liveMap = new Map(liveProcs.map(p => [p.name, p]));

        // Read Ecosystem for "Expected" Services
        let expectedApps = [];
        try {
            const ecosystem = JSON.parse(fs.readFileSync('C:\\LoCoOS\\ecosystem.json', 'utf8'));
            expectedApps = ecosystem.apps.map(a => a.name);
        } catch (e) {
            console.error("Failed to read ecosystem:", e);
        }

        // Add Watchdog manually implies it's always expected
        if (!expectedApps.includes('watchdog')) expectedApps.unshift('watchdog');

        // Merge Lists
        const processes = expectedApps.map(appName => {
            const live = liveMap.get(appName);
            if (live) {
                return {
                    name: live.name,
                    status: live.pm2_env.status,
                    pid: live.pid,
                    uptime: live.pm2_env.pm_uptime,
                    autorestart: live.pm2_env.autorestart,
                    prefBoot: prefs[live.name]?.boot ?? true,
                    prefCrash: prefs[live.name]?.crash ?? true
                };
            } else {
                // Offline/Stopped Service
                return {
                    name: appName,
                    status: 'stopped',
                    pid: 0,
                    uptime: 0,
                    autorestart: true, // Default assumption
                    prefBoot: prefs[appName]?.boot ?? true,
                    prefCrash: prefs[appName]?.crash ?? true
                };
            }
        });

        // Add any extra running processes not in ecosystem (unlikely but good for debug)
        liveProcs.forEach(p => {
            if (!expectedApps.includes(p.name)) {
                processes.push({
                    name: p.name,
                    status: p.pm2_env.status,
                    pid: p.pid,
                    uptime: p.pm2_env.pm_uptime,
                    autorestart: p.pm2_env.autorestart,
                    prefBoot: prefs[p.name]?.boot ?? true,
                    prefCrash: prefs[p.name]?.crash ?? true
                });
            }
        });

        return { processes };
    } catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-scripts', async () => {
    // Scan multiple directories for useful scripts
    const dirs = [
        'C:\\LoCoOS\\scripts\\utils',
        'C:\\LoCoOS\\scripts\\cron',
        'C:\\LoCoOS\\scripts\\infra'
    ];

    let scripts = [];

    dirs.forEach(d => {
        try {
            if (fs.existsSync(d)) {
                const files = fs.readdirSync(d).filter(f => f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.bat') || f.endsWith('.ps1'));
                files.forEach(f => {
                    scripts.push({
                        name: f,
                        path: path.join(d, f),
                        type: d.split('\\').pop() // utils, cron, infra
                    });
                });
            }
        } catch (e) { }
    });

    return scripts;
});

ipcMain.handle('run-script', async (event, scriptPath) => {
    try {
        // Run in a new standalone window so user sees output
        // Handle different extensions
        let cmd = '';
        if (scriptPath.endsWith('.ps1')) {
            cmd = `start powershell -NoExit -ExecutionPolicy Bypass -File "${scriptPath}"`;
        } else if (scriptPath.endsWith('.bat')) {
            cmd = `start cmd.exe /k "${scriptPath}"`;
        } else {
            cmd = `start cmd.exe /k "node ${scriptPath}"`;
        }

        execSync(cmd, { windowsHide: true });
        return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
});

// System Control Logic
ipcMain.handle('system-control', async (event, action) => {
    try {
        if (action === 'start') {
            await startSystem();
        } else if (action === 'stop') {
            await stopSystem();
        } else if (action === 'kill') {
            await killSystem();
        }
        return { success: true };
    } catch (error) {
        console.error('System control error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('toggle-process', async (event, name, shouldStart) => {
    try {
        if (shouldStart) execSync(`pm2 start ${name}`, { env: ENV });
        else execSync(`pm2 stop ${name}`, { env: ENV });
        return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
});

ipcMain.handle('update-pref', async (event, name, type, value) => {
    try {
        const prefs = getPrefs();
        if (!prefs[name]) prefs[name] = { boot: true, crash: true };
        prefs[name][type] = value;
        savePrefs(prefs);

        // Apply "Crash" pref immediately
        if (type === 'crash') {
            // value = true (restart on crash), value = false (no restart)
            // PM2 doesn't have a simple "hot toggle" for autorestart without restart
            // But we can try to update environment
            // Easiest is to `pm2 restart --no-autorestart` if false
            // But that kills it. 
            // We'll let the user manage the running state, this is config for NEXT run mainly.
            // OR: we can delete and resurrect with new flags. Too risky.
            // Let's settle on: "Updates config for next start"
        }

        return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
});
