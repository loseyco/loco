import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'site/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const tasks = [
  {
    title: "Vercel Env Vars Setup",
    description: "Input missing environment variables (OPENCLAW_WEBHOOK_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) into Vercel dashboard to enable live features.",
    status: "pending",
    priority: 2,
    is_special: true
  },
  {
    title: "Email Verification",
    description: "Verify the contact@losey.co email forwarding in the domain provider settings.",
    status: "pending",
    priority: 2,
    is_special: true
  },
  {
    title: "Deploy Sales Bot Agent",
    description: "Configure and launch the Sales Bot for automated outreach using the drafts in outreach-ready.md.",
    status: "pending",
    priority: 2
  }
];

async function updateTasks() {
  // First, check if these tasks already exist to avoid duplicates
  const { data: existingTasks } = await supabase.from('tasks').select('title');
  const existingTitles = new Set(existingTasks?.map(t => t.title) || []);

  const newTasks = tasks.filter(t => !existingTitles.has(t.title));

  if (newTasks.length > 0) {
    const { error } = await supabase.from('tasks').insert(newTasks);
    if (error) console.error('Error seeding tasks:', error);
    else console.log(`Successfully added ${newTasks.length} new tasks.`);
  } else {
    console.log('No new tasks to add.');
  }
}

updateTasks();
