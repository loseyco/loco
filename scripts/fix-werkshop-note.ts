import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixNote() {
    const projectId = 'b63adf3c-0e06-4883-8429-910301580bf2';
    // First, let's delete the old "Body & Paint" note to replace it with the new one
    await supabase
        .from('project_notes')
        .delete()
        .eq('project_id', projectId)
        .ilike('content', '%Body & Paint%');

    const newNote = '[STAGE: CURRENT] Body & Paint: Final block sanding completed on the hood and trunk lid. Verified: Panel alignment, Gap consistency.';
    
    const { error } = await supabase
        .from('project_notes')
        .insert([{ project_id: projectId, content: newNote }]);

    if (error) console.error('Error:', error);
    else console.log('Successfully updated Werk Shop note.');
}

fixNote();
