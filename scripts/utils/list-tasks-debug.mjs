import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTasks() {
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .order('priority', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    console.log(JSON.stringify(tasks, null, 2));
}

listTasks();
