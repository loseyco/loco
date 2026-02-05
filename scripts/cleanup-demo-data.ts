import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanupInvoices() {
    // Delete the $15,000 paid invoice and $8,500 pending invoice
    const { error } = await supabase
        .from('invoices')
        .delete()
        .or('amount.eq.1500000,amount.eq.850000');

    if (error) console.error('Error cleaning up invoices:', error);
    else console.log('Successfully removed demo financial data.');
}

cleanupInvoices();
