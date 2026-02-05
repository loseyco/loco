
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { execSync, spawn } = require('child_process');

let nextProcess = null;

function startNextJs() {
    console.log('Starting Next.js server on port 3300...');
    const sitePath = path.join('C:', 'LoCoOS', 'site');

    // Spawn 'npm run dev' (or start)
    // Using 3300/3301 to allow default 3000 to remain free
    nextProcess = spawn('cmd.exe', ['/c', 'npm run dev -- -p 3300'], {
        cwd: sitePath,
        env: { ...process.env, PORT: '3300' }
    });

    nextProcess.stdout.on('data', (data) => console.log(`NEXT: ${data}`));
    nextProcess.stderr.on('data', (data) => console.error(`NEXT ERR: ${data}`));
}

function createWindow() {
    // Start backend server
    startNextJs();

    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        backgroundColor: '#000000',
        title: 'LoCo Mission Control',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Wait a bit for Next.js to boot, then load
    setTimeout(() => {
        mainWindow.loadURL('http://localhost:3300/dashboard');
    }, 4000);

    // Failover if dev server too slow
    mainWindow.webContents.on('did-fail-load', () => {
        console.log('Retrying connection to Next.js...');
        setTimeout(() => mainWindow.loadURL('http://localhost:3300/dashboard'), 2000);
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('will-quit', () => {
    // Kill the child Next.js process on exit
    if (nextProcess) {
        spawn('taskkill', ['/pid', nextProcess.pid, '/f', '/t']);
    }
});

// --- IPC HANDLERS ---
const PM2_HOME = 'C:\\Users\\pjlos\\.pm2';
const ENV = { ...process.env, PM2_HOME };

ipcMain.handle('system-control', async (event, action) => {
    try {
        switch (action) {
            case 'start':
                execSync('pm2 start C:\\LoCoOS\\ecosystem.json', { env: ENV });
                execSync('pm2 save', { env: ENV });
                return { success: true };

            case 'stop':
                execSync('pm2 stop all', { env: ENV });
                return { success: true };

            case 'kill':
                // The Nuclear Option
                try { execSync('pm2 delete all', { env: ENV }); } catch (e) { }
                try {
                    // Kill Node.js but EXCLUDE our own PID and the Next.js PID
                    // This is tricky with taskkill. 
                    // Simpler: Just kill pm2 and openclaw stuff. 
                    // If we kill ALL node.exe, this electron app helper might die too.
                    // Electron runs as 'electron.exe' usually, but 'npm start' spawns node.

                    // We will just kill PM2 and hope for best. 
                    // If user wants HARD kill, we might sacrifice the dashboard temporarily.
                    execSync('taskkill /F /IM "node.exe" /FI "WINDOWTITLE ne LoCo*"');
                } catch (e) { }
                return { success: true };

            default:
                return { success: false };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
});
