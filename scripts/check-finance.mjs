import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'site/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFinance() {
  const { data: invoices } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(3);
  const { data: expenses } = await supabase.from('expenses').select('*').order('created_at', { ascending: false }).limit(3);

  console.log('--- INVOICES ---');
  invoices?.forEach(i => console.log(`- ${i.customer_name}: $${i.amount} (${i.status})`));
  
  console.log('\n--- EXPENSES ---');
  expenses?.forEach(e => console.log(`- ${e.description}: $${e.amount} (${e.category})`));
}

checkFinance();