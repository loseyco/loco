import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkComments(taskId) {
    const { data: comments, error } = await supabase
        .from('task_notes')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

    if (error) { console.error(error); return; }

    console.log(`--- COMMENTS FOR TASK ${taskId} ---`);
    comments.forEach(c => {
        console.log(`[${c.created_at}] ${c.user_id}: ${c.content}`);
    });
    console.log('-----------------------------------');
}

const taskId = process.argv[2];
if (taskId) {
    checkComments(taskId);
} else {
    console.log('Please provide a taskId');
}
