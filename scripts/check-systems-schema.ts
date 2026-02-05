import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSystemsSchema() {
  const { data, error } = await supabase
    .from('systems')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching systems:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns in "systems" table:', Object.keys(data[0]));
  } else {
    console.log('No data in "systems" table or table not found.');
  }
}

checkSystemsSchema();
