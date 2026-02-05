import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addNote(projectId: string, content: string) {
  const { data, error } = await supabase
    .from('project_notes')
    .insert([{ project_id: projectId, content }]);

  if (error) {
    console.error('Error adding note:', error);
    return;
  }

  console.log('Note added successfully.');
}

addNote('b63adf3c-0e06-4883-8429-910301580bf2', '[STAGE: CURRENT] Body & Paint: Final block sanding completed on the hood and trunk lid. Verified: Panel alignment, Gap consistency.');
