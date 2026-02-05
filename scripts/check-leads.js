const { createClient } = require('@supabase/supabase-client');

const supabaseUrl = 'https://jxnqsbkvckvfwgmvuajb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bnFzYmt2Y2t2ZndnbXZ1YWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTg5MzYsImV4cCI6MjA4NTc3NDkzNn0.NZaQRIm3LKUi_eQX7XRCW2Wy8K3kYKdsC8SF72lQHsw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    const { data, error } = await supabase.from('leads').select('*').limit(5);
    if (error) {
        console.error('Error fetching leads:', error);
    } else {
        console.log('Leads:', data);
    }
}

checkLeads();
