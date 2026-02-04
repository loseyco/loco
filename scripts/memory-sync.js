#!/usr/bin/env node

/**
 * Memory Sync Script
 * Syncs local memory files to Supabase 'memory_entries' table.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const MEMORY_DIR = path.join(__dirname, '../memory');
const SUPABASE_URL = 'https://jxnqsbkvckvfwgmvuajb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || ''; // Expecting Service Role for sync

if (!SUPABASE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE environment variable is required.');
    process.exit(1);
}

async function syncMemoryFiles() {
    const files = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
        const filePath = path.join(MEMORY_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
        
        console.log(`Syncing ${file}...`);
        
        try {
            await upsertMemoryEntry({
                date,
                content,
                category: 'daily_log',
                metadata: { file_name: file, synced_at: new Date().toISOString() }
            });
            console.log(`Successfully synced ${file}`);
        } catch (err) {
            console.error(`Failed to sync ${file}:`, err.message);
        }
    }
}

function upsertMemoryEntry(data) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const url = `${SUPABASE_URL}/rest/v1/memory_entries`;
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'resolution=merge-duplicates'
            }
        };

        const req = https.request(url, options, (res) => {
            let resData = '';
            res.on('data', chunk => resData += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(resData);
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${resData}`));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

syncMemoryFiles().then(() => console.log('Sync complete.'));
