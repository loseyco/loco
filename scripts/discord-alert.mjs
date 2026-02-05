import { execSync } from 'child_process';

const TARGET_USER = '1264414586463977556'; // PJ
const msg = process.argv.slice(2).join(' ') || 'System heartbeat failure detected.';

try {
    const payload = JSON.stringify({
        action: 'send',
        channel: 'discord',
        to: `user:${TARGET_USER}`,
        message: `🚨 **OpenClaw Watchdog Alert**\n${msg}`
    });
    
    // We use 'openclaw tool message' to send the message directly through the gateway
    execSync(`openclaw tool message '${payload}'`, { stdio: 'inherit' });
} catch (err) {
    console.error('Failed to send Discord alert through gateway:', err.message);
}
