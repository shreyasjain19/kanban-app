import { AlertCircle, Calendar, Flag } from 'lucide-react';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import type { Task, TeamMember, Label } from '../types';

interface TaskCardProps {
  task: Task;
  members: TeamMember[];
  labels: Label[];
  onClick: () => void;
  isDragging?: boolean;
}

const PRIORITY_CONFIG = {
  high: { color: 'var(--priority-high)', label: 'High', bg: 'var(--accent-red-soft)' },
  normal: { color: 'var(--priority-normal)', label: 'Normal', bg: 'var(--accent-blue-soft)' },
  low: { color: 'var(--priority-low)', label: 'Low', bg: 'rgba(100,116,139,0.12)' },
};

export function TaskCard({ task, members, labels, onClick, isDragging }: TaskCardProps) {
  const assignee = members.find(m => m.id === task.assignee_id);
  const taskLabels = (task.label_ids || []).map(id => labels.find(l => l.id === id)).filter(Boolean) as Label[];
  const priority = PRIORITY_CONFIG[task.priority || 'normal'];

  const dueInfo = getDueInfo(task.due_date, task.status);

  return (
    <div
      onClick={onClick}
      style={{
        background: isDragging ? 'var(--bg-active)' : 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        userSelect: 'none',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onMouseEnter={e => {
        if (!isDragging) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = 'var(--bg-hover)';
          el.style.borderColor = 'var(--border-strong)';
          el.style.transform = 'translateY(-1px)';
          el.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={e => {
        if (!isDragging) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = 'var(--bg-elevated)';
          el.style.borderColor = 'var(--border)';
          el.style.transform = 'none';
          el.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      {/* Labels */}
      {taskLabels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
          {taskLabels.map(label => (
            <span key={label.id} style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '20px',
              background: label.color + '25',
              color: label.color,
              letterSpacing: '0.2px',
            }}>
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p style={{
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        lineHeight: 1.45,
        marginBottom: task.description ? '6px' : '10px',
        wordBreak: 'break-word',
      }}>
        {task.title}
      </p>

      {/* Description snippet */}
      {task.description && (
        <p style={{
          fontSize: '11.5px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '10px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {/* Priority badge */}
        <span style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          fontSize: '10px', fontWeight: 600,
          padding: '2px 7px',
          borderRadius: '20px',
          background: priority.bg,
          color: priority.color,
        }}>
          <Flag size={9} />
          {priority.label}
        </span>

        {/* Due date */}
        {dueInfo && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            fontSize: '10px', fontWeight: 600,
            padding: '2px 7px',
            borderRadius: '20px',
            background: dueInfo.urgent ? 'var(--accent-red-soft)' : dueInfo.soon ? 'var(--accent-amber-soft)' : 'rgba(100,116,139,0.1)',
            color: dueInfo.urgent ? 'var(--accent-red)' : dueInfo.soon ? 'var(--accent-amber)' : 'var(--text-muted)',
          }}>
            {dueInfo.urgent ? <AlertCircle size={9} /> : <Calendar size={9} />}
            {dueInfo.label}
          </span>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Assignee avatar */}
        {assignee && (
          <div title={assignee.name} style={{
            width: '22px', height: '22px',
            borderRadius: '50%',
            background: assignee.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
            border: '1.5px solid var(--bg-elevated)',
          }}>
            {assignee.initials}
          </div>
        )}
      </div>
    </div>
  );
}

function getDueInfo(dueDate: string | undefined, status: string) {
  if (!dueDate || status === 'done') return null;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = differenceInDays(due, today);

  if (isPast(due) && !isToday(due)) {
    return { label: `Overdue ${format(due, 'MMM d')}`, urgent: true, soon: false };
  }
  if (isToday(due)) {
    return { label: 'Due today', urgent: false, soon: true };
  }
  if (diff <= 2) {
    return { label: `Due ${format(due, 'MMM d')}`, urgent: false, soon: true };
  }
  return { label: format(due, 'MMM d'), urgent: false, soon: false };
}
