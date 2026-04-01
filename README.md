# Flow — Kanban Task Board

A polished, fully-featured Kanban board built with **React + TypeScript** and **Supabase**.

## Live Demo
> Add your Vercel/Netlify URL here after deploying

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Database & Auth**: Supabase (Postgres + anonymous auth)
- **Hosting**: Vercel (recommended)
- **Icons**: Lucide React
- **Date utils**: date-fns

## Features

### Core
- ✅ Kanban board with 4 columns: To Do, In Progress, In Review, Done
- ✅ Drag-and-drop tasks between columns (dnd-kit)
- ✅ Guest account via Supabase anonymous auth (no sign-up required)
- ✅ Full RLS — each user only sees their own data
- ✅ Task creation with title, description, priority, due date, assignee, labels

### Advanced
- ✅ **Team Members** — add members with avatars/colors, assign to tasks
- ✅ **Labels/Tags** — create custom colored labels, filter by label
- ✅ **Comments** — per-task threaded comments
- ✅ **Activity Log** — timeline of status changes and task events
- ✅ **Due Date Indicators** — overdue (red), due soon (amber) badges on cards
- ✅ **Search & Filtering** — search by title/description, filter by priority/assignee/label
- ✅ **Board Stats** — total, done, and overdue counts in the header

## Local Setup

### 1. Clone & install
```bash
git clone <your-repo>
cd kanban-app
npm install
```

### 2. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and create a free project
2. In the SQL Editor, run the contents of `supabase-schema.sql`
3. In **Authentication → Providers**, enable **Anonymous sign-ins**

### 3. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Find these in Supabase → **Project Settings → API**.

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```
Set environment variables in the Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Database Schema

See [`supabase-schema.sql`](./supabase-schema.sql) for the full schema.

| Table | Purpose |
|-------|---------|
| `tasks` | Core task records |
| `team_members` | User-created team members |
| `labels` | Custom colored labels |
| `task_labels` | Many-to-many: tasks ↔ labels |
| `comments` | Per-task comments |
| `activity_logs` | Change history per task |

All tables have RLS enabled with policies that scope data to `auth.uid()`.

## Project Structure

```
src/
├── components/
│   ├── Header.tsx         # Top bar: search, filters, stats, actions
│   ├── KanbanBoard.tsx    # DndContext wrapper + column layout
│   ├── KanbanColumn.tsx   # Droppable column with card list
│   ├── SortableTaskCard.tsx # dnd-kit sortable wrapper
│   ├── TaskCard.tsx       # Visual task card
│   ├── TaskModal.tsx      # Create/edit modal with tabs (details/comments/activity)
│   ├── TeamModal.tsx      # Manage team members
│   ├── LabelsModal.tsx    # Manage labels
│   └── LoadingScreen.tsx  # Initial auth loading state
├── hooks/
│   ├── useAuth.ts         # Guest auth + session management
│   ├── useTasks.ts        # Task CRUD + optimistic updates
│   ├── useTeamMembers.ts  # Team CRUD
│   ├── useLabels.ts       # Label CRUD
│   ├── useComments.ts     # Per-task comments
│   └── useActivityLogs.ts # Per-task activity log
├── lib/
│   └── supabase.ts        # Supabase client
├── types/
│   └── index.ts           # All TypeScript types
└── styles/
    └── globals.css        # CSS variables + design system
```

## Security Notes
- The Supabase **anon key** is intentionally public — it's safe to expose in frontend code
- **Never** commit or expose your Supabase **service role key**
- RLS policies ensure each guest user can only access their own data
- No email or passwords are collected — anonymous sessions only

## Tradeoffs & What I'd Improve

**With more time:**
- Real-time updates via Supabase Realtime subscriptions (currently requires refetch)
- Drag-to-reorder within a column (order_index column is ready but not fully wired)
- Keyboard accessibility for drag-and-drop
- Optimistic UI for all mutations (currently only move has it)
- Mobile touch drag support tuning
- Persistent filters in URL query params
- Board sharing via invite links
- Image/file attachments on tasks
