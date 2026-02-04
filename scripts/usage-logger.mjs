import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function logUsage() {
  const usageText = process.argv[2];
  const tokensIn = parseInt(process.argv[3]) || 0;
  const tokensOut = parseInt(process.argv[4]) || 0;
  const agent = process.argv[5] || 'main';

  if (!usageText) {
    console.error('❌ Usage text required.');
    return;
  }

  console.log(`📊 Logging usage: ${usageText}`);

  // Example parse: "gemini-2.5-pro 100% left ⏱4h 59m"
  const parts = usageText.split('·');
  const logs = parts.map(p => {
    const match = p.trim().match(/^(.+?)\s+(\d+)%\s+left\s+⏱(.+)$/);
    if (match) {
      return {
        model: match[1],
        usage_percent: 100 - parseInt(match[2]),
        reset_in: match[3],
        tokens_in: tokensIn,
        tokens_out: tokensOut,
        agent: agent
      };
    }
    return null;
  }).filter(l => l !== null);

  if (logs.length > 0) {
    const { error } = await supabase.from('api_usage').insert(logs);
    if (error) console.error('❌ Error logging usage:', error.message);
    else console.log('✅ Usage logged to Supabase.');
  }
}

logUsage();
