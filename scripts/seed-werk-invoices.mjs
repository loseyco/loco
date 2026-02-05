import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function seed() {
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .ilike('name', '%BMW 3.0 CS%')
    .single();

  if (project) {
    const { error } = await supabase.from('invoices').insert([
      {
        project_id: project.id,
        notes: 'Restoration Phase 3: Metal Work & Fabrication',
        amount: 1500000, // $15,000.00
        status: 'paid',
        created_at: '2026-01-20T10:00:00Z'
      },
      {
        project_id: project.id,
        notes: 'Restoration Phase 4: Body & Paint Prep (Initial)',
        amount: 850000, // $8,500.00
        status: 'pending',
        created_at: '2026-02-01T14:00:00Z'
      }
    ]);
    if (error) console.error(error);
    else console.log('Werk Shop invoices seeded.');
  }
}

seed()
