import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSpecialTasks() {
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_special', true)
        .neq('status', 'completed');

    if (error) { console.error(error); return; }

    if (tasks.length === 0) {
        console.log('No special tasks pending.');
        return;
    }

    console.log('--- SPECIAL TASKS ---');
    tasks.forEach(t => {
        console.log(`[${t.status.toUpperCase()}] P:${t.priority} ${t.title}`);
        console.log(`   > ${t.description}`);
    });
    console.log('---------------------');
}

checkSpecialTasks();
