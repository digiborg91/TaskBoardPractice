/*
# Create boards and tasks tables (multi-user, owner-scoped)

## Overview
Creates the core data model for TaskBoard — a kanban-style task management app.
Users sign in with email/password, create boards, and add tasks organized into
columns (todo, in_progress, done). Each user only sees and manages their own boards.

## New Tables

### boards
- `id` (uuid, primary key, auto-generated)
- `title` (text, not null) — the board name
- `description` (text, nullable) — optional board description
- `user_id` (uuid, not null, defaults to auth.uid()) — owner of the board
- `created_at` (timestamptz, defaults to now())
- `updated_at` (timestamptz, defaults to now()) — tracks last modification

### tasks
- `id` (uuid, primary key, auto-generated)
- `title` (text, not null) — the task name
- `description` (text, nullable) — optional task details
- `status` (text, not null, defaults to 'todo') — one of: todo, in_progress, done
- `priority` (text, not null, defaults to 'medium') — one of: low, medium, high
- `position` (integer, not null, defaults to 0) — ordering within a column
- `board_id` (uuid, not null, references boards.id ON DELETE CASCADE)
- `user_id` (uuid, not null, defaults to auth.uid()) — owner of the task
- `created_at` (timestamptz, defaults to now())
- `updated_at` (timestamptz, defaults to now())

## Indexes
- `idx_tasks_board_id` — fast lookups of tasks by board
- `idx_tasks_status` — filtering by column status
- `idx_boards_user_id` — fast lookups of boards by owner

## Security (RLS)
- RLS enabled on both tables.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- boards: auth.uid() = user_id for all operations.
- tasks: auth.uid() = user_id for all operations.
- Both tables use DEFAULT auth.uid() so inserts that omit user_id still pass the WITH CHECK.
*/

CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  position integer NOT NULL DEFAULT 0,
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_board_id ON tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Boards policies
DROP POLICY IF EXISTS "select_own_boards" ON boards;
CREATE POLICY "select_own_boards" ON boards FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_boards" ON boards;
CREATE POLICY "insert_own_boards" ON boards FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_boards" ON boards;
CREATE POLICY "update_own_boards" ON boards FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_boards" ON boards;
CREATE POLICY "delete_own_boards" ON boards FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Tasks policies
DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);