-- Schema updates for Projects Hub
-- Run in Supabase SQL Editor

-- Add budget column to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget integer DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date date;

-- Add project_id to expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE SET NULL;

-- Add project_id to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE SET NULL;

-- Create project_notes table (like task_notes)
CREATE TABLE IF NOT EXISTS project_notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    author text NOT NULL DEFAULT 'pj',
    content text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
    description text NOT NULL,
    minutes integer NOT NULL DEFAULT 0,
    date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable realtime on new tables
ALTER PUBLICATION supabase_realtime ADD TABLE project_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);

-- Enable RLS (Row Level Security) - keep it simple, allow all for now
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for project_notes
DROP POLICY IF EXISTS "Enable all access for project_notes" ON project_notes;
CREATE POLICY "Enable all access for project_notes" ON project_notes FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for time_entries
DROP POLICY IF EXISTS "Enable all access for time_entries" ON time_entries;
CREATE POLICY "Enable all access for time_entries" ON time_entries FOR ALL USING (true) WITH CHECK (true);
