import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
    const usage = [
        { agent_id: 'ops', model: 'gemini-3-flash', input_tokens: 3400, output_tokens: 120, total_tokens: 3520, status: 'ok' },
        { agent_id: 'ops', model: 'gemini-3-flash', input_tokens: 0, output_tokens: 0, total_tokens: 0, status: 'rate_limit' },
    ];

    await supabase.from('api_usage').insert(usage);
    console.log('Usage data seeded.');
}

seed();
