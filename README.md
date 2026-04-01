# Flow — Kanban Task Board

A polished Kanban board built with React, TypeScript, and Supabase. Drag and drop tasks across columns, manage your team, assign labels, and track activity — all with automatic guest authentication and per-user data isolation.

## Tech Stack

- React 18 + TypeScript + Vite
- Supabase (Postgres + anonymous auth + RLS)
- dnd-kit for drag and drop
- date-fns, Lucide React

## Features

- Kanban board with four columns: To Do, In Progress, In Review, Done
- Drag and drop tasks between columns
- Guest authentication via Supabase anonymous sign-in
- Task creation with title, description, priority, due date, assignee, and labels
- Team members with color avatars
- Custom labels with filtering
- Per-task comments and activity log
- Search and filter by priority, assignee, or label
- Due date indicators (overdue, due soon)
- Board stats in the header

## Local Setup

1. Clone the repo and install dependencies

git clone https://github.com/shreyasjain19/kanban-app
cd kanban-app
npm install

2. Create a Supabase project at supabase.com, run supabase-schema.sql in the SQL Editor, and enable Anonymous sign-ins under Authentication.

3. Create a .env file and fill in your Supabase project URL and anon key.

4. Start the dev server

npm run dev

## Deployment

Deployed on Vercel. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as environment variables in the Vercel dashboard.

## Security

All tables have Row Level Security enabled. Each guest session can only read and write its own data via auth.uid() = user_id policies. The Supabase anon key is safe to expose in frontend code — the service role key is never used.