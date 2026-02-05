import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addChangelogEntry() {
  const { error } = await supabase.from('changelog').insert([
    {
      title: "Werk Shop Live Data",
      description: "Integrated real-time project progress for 'The Werk Shop' demo. The timeline now pulls live notes and stage updates directly from the database.",
      category: "feature",
      version: "0.2.5"
    }
  ]);

  if (error) console.error('Error adding changelog entry:', error);
  else console.log('Changelog entry added.');
}

addChangelogEntry();
