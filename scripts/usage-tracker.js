#!/usr/bin/env node

/**
 * API Usage Tracker
 * Logs tool usage and model interactions to Supabase 'activity_logs'.
 */

const https = require('https');

const SUPABASE_URL = 'https://jxnqsbkvckvfwgmvuajb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || '';

async function logActivity(agent, action, details, taskId = null) {
    if (!SUPABASE_KEY) return;

    const data = {
        agent,
        action,
        details,
        task_id: taskId,
        created_at: new Date().toISOString()
    };

    return new Promise((resolve) => {
        const body = JSON.stringify(data);
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        };

        const req = https.request(`${SUPABASE_URL}/rest/v1/activity_logs`, options, (res) => {
            res.on('data', () => {});
            res.on('end', () => resolve());
        });

        req.on('error', (e) => {
            console.error('Activity log error:', e.message);
            resolve();
        });
        req.write(body);
        req.end();
    });
}

// Example usage if run directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const [action, details] = args;
    logActivity('ops', action || 'system_check', details || 'Manual trigger').then(() => console.log('Log sent.'));
}

module.exports = { logActivity };
