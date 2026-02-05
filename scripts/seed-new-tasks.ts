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
    title: "Invite Kristina to Dashboard",
    description: "Send Discord PM to Kristina with dashboard link and restricted project access instructions.",
    status: "pending",
    priority: 2
  },
  {
    title: "Deploy Sales Bot Agent",
    description: "Configure and launch the Sales Bot for automated outreach to identified auto restoration shops.",
    status: "pending",
    priority: 2
  },
  {
    title: "Build ROI Calculator Component",
    description: "Develop an interactive ROI calculator for the portfolio to show potential value to clients.",
    status: "pending",
    priority: 1
  },
  {
    title: "Implement PWA Support",
    description: "Add manifest and service workers to make the dashboard installable as a mobile app.",
    status: "pending",
    priority: 1
  },
  {
    title: "Voice-to-Task Intake Module",
    description: "Create a dashboard widget for creating tasks via voice commands.",
    status: "pending",
    priority: 1
  },
  {
    title: "Live System Pulse Badge",
    description: "Add a dynamic 'Live' status badge to the landing page showing system health.",
    status: "pending",
    priority: 1
  },
  {
    title: "Token Usage Velocity Chart",
    description: "Add a chart to the dashboard showing token usage trends over time.",
    status: "pending",
    priority: 1
  }
];

async function seedTasks() {
  const { error } = await supabase.from('tasks').insert(tasks);
  if (error) console.error('Error seeding tasks:', error);
  else console.log('Successfully created new tasks from user requests.');
}

seedTasks();
