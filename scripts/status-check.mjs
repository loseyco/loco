
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://jxnqsbkvckvfwgmvuajb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bnFzYmt2Y2t2ZndnbXZ1YWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE5ODkzNiwiZXhwIjoyMDg1Nzc0OTM2fQ._IAuu-bsZgyB7hPTnR9H6--K1przqEr7q_-nOKbt9DM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .or(`created_at.gte.${oneHourAgo},updated_at.gte.${oneHourAgo}`);

  // Invoices
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('*')
    .gte('created_at', oneHourAgo);

  // Expenses
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .gte('created_at', oneHourAgo);

  // Activity Logs
  const { data: logs, error: logsError } = await supabase
    .from('activity_logs')
    .select('*')
    .gte('created_at', oneHourAgo)
    .order('created_at', { ascending: false });

  console.log(JSON.stringify({
    tasks: tasks || [],
    invoices: invoices || [],
    expenses: expenses || [],
    logs: logs || []
  }, null, 2));
}

checkStatus();
