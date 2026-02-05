import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkProjectStatus() {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*, project_notes(*)')
    .eq('id', 'b63adf3c-0e06-4883-8429-910301580bf2')
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Project:', JSON.stringify(project, null, 2));
  }
}

checkProjectStatus();
