export type Status = 'todo' | 'in_progress' | 'in_review' | 'done';
export type Priority = 'low' | 'normal' | 'high';

export interface Label {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export interface TeamMember {
  id: string;
  name: string;
  color: string;
  initials: string;
  user_id: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  due_date?: string;
  user_id: string;
  assignee_id?: string;
  created_at: string;
  label_ids?: string[];
  order_index: number;
  assignee?: TeamMember;
  labels?: Label[];
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  created_at: string;
}

export interface Column {
  id: Status;
  title: string;
  color: string;
  accent: string;
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: '#64748b', accent: '#94a3b8' },
  { id: 'in_progress', title: 'In Progress', color: '#3b82f6', accent: '#60a5fa' },
  { id: 'in_review', title: 'In Review', color: '#a855f7', accent: '#c084fc' },
  { id: 'done', title: 'Done', color: '#10b981', accent: '#34d399' },
];
