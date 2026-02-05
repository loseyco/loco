import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkWerkShop() {
  console.log('--- Project ---');
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .ilike('name', '%BMW 3.0 CS%')
    .single();
  console.log(project);

  if (project) {
    console.log('\n--- Notes (Timeline) ---');
    const { data: notes } = await supabase
      .from('project_notes')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: true });
    console.log(notes);

    console.log('\n--- Invoices ---');
    const { data: invData } = await supabase
      .from('invoices')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });
    console.log(invData);
  }
}

checkWerkShop();
