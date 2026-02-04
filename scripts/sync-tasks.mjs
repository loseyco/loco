import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncTasks() {
  const currentTasks = [
    {
      title: "Stabilize OpenClaw Gateway",
      description: "Fix PID port conflicts and ensure watchdog is monitoring gateway health.",
      status: "completed",
      priority: 2
    },
    {
      title: "Mobile UI Fix",
      description: "Update dashboard layout for usable mobile experience and responsive status bar.",
      status: "completed",
      priority: 2
    },
    {
      title: "Live Dashboard Status Sync",
      description: "Push system telemetry and agent goals to Supabase every 30s.",
      status: "in_progress",
      priority: 2
    },
    {
      title: "Werk Shop Demo - Live Data",
      description: "Wire the restoration timeline to real Supabase tables for dynamic updates.",
      status: "pending",
      priority: 1
    },
    {
      title: "Motorsports Playbook Library",
      description: "Build speculative demo library for race teams and automotive shops.",
      status: "pending",
      priority: 1
    }
  ];

  for (const task of currentTasks) {
    const { data: existing } = await supabase
      .from('tasks')
      .select('id')
      .eq('title', task.title)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('tasks')
        .update(task)
        .eq('id', existing.id);
      if (error) console.error(`Error updating task ${task.title}:`, error);
      else console.log(`Updated: ${task.title}`);
    } else {
      const { error } = await supabase
        .from('tasks')
        .insert(task);
      if (error) console.error(`Error inserting task ${task.title}:`, error);
      else console.log(`Inserted: ${task.title}`);
    }
  }
}

syncTasks();
