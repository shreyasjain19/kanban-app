-- ============================================================
-- Flow Kanban Board — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Team members (created by each guest user)
create table if not exists public.team_members (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#3b82f6',
  initials    text not null,
  created_at  timestamptz not null default now()
);

-- Labels
create table if not exists public.labels (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#3b82f6',
  created_at  timestamptz not null default now()
);

-- Tasks
create table if not exists public.tasks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'todo'
                 check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority     text not null default 'normal'
                 check (priority in ('low', 'normal', 'high')),
  due_date     date,
  assignee_id  uuid references public.team_members(id) on delete set null,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now()
);

-- Task ↔ Label junction table
create table if not exists public.task_labels (
  task_id   uuid not null references public.tasks(id) on delete cascade,
  label_id  uuid not null references public.labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- Comments
create table if not exists public.comments (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- Activity log
create table if not exists public.activity_logs (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  action      text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.team_members  enable row level security;
alter table public.labels         enable row level security;
alter table public.tasks          enable row level security;
alter table public.task_labels    enable row level security;
alter table public.comments       enable row level security;
alter table public.activity_logs  enable row level security;

-- team_members: users own their own rows
create policy "Users manage own team_members"
  on public.team_members for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- labels
create policy "Users manage own labels"
  on public.labels for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- tasks
create policy "Users manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- task_labels: tied through the task's user_id
create policy "Users manage own task_labels"
  on public.task_labels for all
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = task_labels.task_id
        and tasks.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tasks
      where tasks.id = task_labels.task_id
        and tasks.user_id = auth.uid()
    )
  );

-- comments
create policy "Users manage own comments"
  on public.comments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- activity_logs
create policy "Users manage own activity_logs"
  on public.activity_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- INDEXES (performance)
-- ============================================================
create index if not exists idx_tasks_user_id    on public.tasks(user_id);
create index if not exists idx_tasks_status     on public.tasks(status);
create index if not exists idx_comments_task_id on public.comments(task_id);
create index if not exists idx_logs_task_id     on public.activity_logs(task_id);
