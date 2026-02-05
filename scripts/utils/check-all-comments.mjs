import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllComments() {
    const { data: notes, error } = await supabase
        .from('task_notes')
        .select('task_id, content, created_at, tasks(title)')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) { console.error(error); return; }

    console.log('--- RECENT TASK NOTES/COMMENTS ---');
    notes.forEach(n => {
        console.log(`[${n.created_at}] Task: ${n.tasks?.title || n.task_id}`);
        console.log(`   > ${n.content}`);
    });
    console.log('-----------------------------------');
}

checkAllComments();
