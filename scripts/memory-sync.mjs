import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncMemory() {
  const workspaceRoot = 'C:/LoCoOS';
  const memoryDir = path.join(workspaceRoot, 'memory');
  
  console.log('🧠 Starting memory sync...');

  // 1. Sync long-term memory (MEMORY.md)
  try {
    const content = await fs.readFile(path.join(workspaceRoot, 'MEMORY.md'), 'utf-8');
    const { error } = await supabase
      .from('memory_entries')
      .upsert({
        category: 'long-term',
        content,
        date: new Date().toISOString().split('T')[0],
        metadata: { source: 'MEMORY.md' }
      }, { onConflict: 'category, metadata->>source' }); // Note: unique constraint might need to be set in DB for proper upsert

    if (error) console.error('❌ Error syncing long-term memory:', error.message);
    else console.log('✅ Synced long-term memory.');
  } catch (err) {
    console.error('⚠️ MEMORY.md not found or unreadable.');
  }

  // 2. Sync daily notes (memory/*.md)
  try {
    const files = await fs.readdir(memoryDir);
    const mdFiles = files.filter(f => f.endsWith('.md') && /^\d{4}-\d{2}-\d{2}/.test(f));

    for (const file of mdFiles) {
      const dateStr = file.split('.')[0];
      const content = await fs.readFile(path.join(memoryDir, file), 'utf-8');
      
      const { error } = await supabase
        .from('memory_entries')
        .upsert({
          category: 'daily',
          content,
          date: dateStr,
          metadata: { source: file }
        }, { onConflict: 'category, date' });

      if (error) console.error(`❌ Error syncing ${file}:`, error.message);
      else console.log(`✅ Synced ${file}.`);
    }
  } catch (err) {
    console.error('⚠️ Could not read memory directory:', err.message);
  }

  console.log('✨ Sync complete.');
}

syncMemory();
