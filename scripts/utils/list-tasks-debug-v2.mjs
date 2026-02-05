import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTasks() {
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('title, status, priority, description')
        .order('priority', { ascending: false });

    if (error) { console.error(error); return; }

    console.log('--- TASKS ---');
    tasks.forEach(t => {
        console.log(`[${t.status.toUpperCase()}] P:${t.priority} ${t.title}`);
        console.log(`   > ${t.description}`);
    });
    console.log('-------------');
}

listTasks();
