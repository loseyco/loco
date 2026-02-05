-- 1. ADD OWNERSHIP TO PROJECTS
-- This allows us to assign projects to specific users (like Kristina)
ALTER TABLE projects 
ADD COLUMN owner_id UUID REFERENCES auth.users(id);

-- Optional: Set existing projects to be owned by PJ (we need your UUID for this, skipping for now)

-- 2. CREATE SYSTEM COMMANDS QUEUE
-- This allows the online dashboard to talk to your local PC
CREATE TABLE system_commands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_system TEXT NOT NULL DEFAULT 'main-pc', -- scalable if you add more PCs
    command TEXT NOT NULL, -- e.g., 'start-all', 'kill', 'restart-service-x'
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, error
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    executed_at TIMESTAMP WITH TIME ZONE,
    result_log TEXT
);

-- Realtime needs to be enabled for this table so Electron sees it instantly
YOUR_SUPABASE_REALTIME_ENABLE_COMMAND_HERE (Usually done via UI settings -> Replication)
