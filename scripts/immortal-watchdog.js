const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PRIMARY_PORT = 18789;
const ENGINE_PORT = 18790;
const RECOVERY_PATH = 'C:\\LoCoOS\\scripts\\infra\\recovery.bat';
const LOG_FILE = 'C:\\LoCoOS\\logs\\watchdog.log';

function log(msg) {
    const time = new Date().toLocaleString();
    const entry = `[${time}] ${msg}\n`;
    console.log(entry.trim());
    try {
        fs.appendFileSync(LOG_FILE, entry);
    } catch (e) { }
}

function checkPort(port) {
    return new Promise((resolve) => {
        const req = http.request({
            host: '127.0.0.1',
            port: port,
            path: '/',
            timeout: 5000
        }, (res) => {
            resolve(true);
            res.destroy();
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        req.end();
    });
}

async function monitor() {
    log('Monitoring ports...');

    const primaryUp = await checkPort(PRIMARY_PORT);
    const engineUp = await checkPort(ENGINE_PORT);

    if (!primaryUp || !engineUp) {
        log(`CRITICAL: Port(s) down (Primary: ${primaryUp}, Engine: ${engineUp}). Running recovery...`);
        try {
            // Use 'start' to run it detached so watchdog doesn't get killed by its own recovery
            // Use silent node execution instead of 'start'
            const { exec } = require('child_process');
            exec(`"${RECOVERY_PATH}"`, { windowsHide: true }, (error, stdout, stderr) => {
                if (error) log(`Recovery error: ${error.message}`);
            });
            log('Recovery script triggered.');
            // Wait 60 seconds for recovery to finish before checking again
            await new Promise(r => setTimeout(r, 60000));
        } catch (err) {
            log(`Failed to trigger recovery: ${err.message}`);
        }
    } else {
        log('Systems healthy.');
    }
}

log('Local Watchdog Started (Zero-AI Mode)');
// Check every 30 seconds
setInterval(monitor, 30000);
monitor();
