
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load site env
dotenv.config({ path: 'C:\\LoCoOS\\site\\.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listUsers() {
    console.log('\n🔍 Cheking User Registry...\n');

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!users || users.length === 0) {
        console.log('No users found.');
        return;
    }

    console.log('REGISTERED USERS:');
    console.log('-----------------');
    users.forEach(u => {
        console.log(`- ${u.email} (Last Sign-In: ${u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'})`);
    });
    console.log('-----------------');
}

listUsers();
