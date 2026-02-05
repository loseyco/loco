import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectUsage() {
  const { data, error } = await supabase.from('api_usage').select('*').order('recorded_at', { ascending: false }).limit(5);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Last 5 entries:', JSON.stringify(data, null, 2));
  }
}

inspectUsage();
