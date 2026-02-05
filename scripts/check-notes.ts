import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjectNotes(projectId: string) {
  const { data: notes, error } = await supabase
    .from('project_notes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching notes:', error);
    return;
  }

  console.log(`--- NOTES FOR ${projectId} ---`);
  notes?.forEach(note => {
    console.log(`[${note.created_at}] ${note.content}`);
  });
}

checkProjectNotes('b63adf3c-0e06-4883-8429-910301580bf2');
