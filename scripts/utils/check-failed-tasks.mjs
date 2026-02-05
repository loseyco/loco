import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFailedTasks() {
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'failed');

    if (error) { console.error(error); return; }

    if (tasks.length === 0) {
        console.log('No failed tasks found.');
    } else {
        console.log('--- FAILED TASKS ---');
        tasks.forEach(t => {
            console.log(`[ID:${t.id}] ${t.title}`);
        });
        console.log('--------------------');
    }
}

checkFailedTasks();
