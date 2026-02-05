import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'site/.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jxnqsbkvckvfwgmvuajb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bnFzYmt2Y2t2ZndnbXZ1YWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE5ODkzNiwiZXhwIjoyMDg1Nzc0OTM2fQ._IAuu-bsZgyB7hPTnR9H6--K1przqEr7q_-nOKbt9DM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
  const { data: highPriorityTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('priority', 2)
    .neq('status', 'completed');

  const { data: pendingInvoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('status', 'pending');

  const { data: totalExpenses } = await supabase
    .from('expenses')
    .select('amount');

  const totalSpent = totalExpenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  console.log(JSON.stringify({
    highPriorityTasks: highPriorityTasks || [],
    pendingInvoices: pendingInvoices || [],
    totalSpent,
    timestamp: new Date().toISOString()
  }, null, 2));
}

checkStatus();
