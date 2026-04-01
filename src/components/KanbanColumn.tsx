import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { SortableTaskCard } from './SortableTaskCard';
import type { Column, Task, TeamMember, Label } from '../types';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  members: TeamMember[];
  labels: Label[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (status: string) => void;
}

export function KanbanColumn({ column, tasks, members, labels, onTaskClick, onCreateTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '300px',
      minWidth: '300px',
      maxHeight: 'calc(100vh - 130px)',
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: `1px solid ${isOver ? column.accent + '60' : 'var(--border)'}`,
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: isOver ? `0 0 0 2px ${column.accent}30` : 'none',
    }}>
      {/* Column header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: column.color,
            boxShadow: `0 0 6px ${column.color}80`,
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.2px',
            color: 'var(--text-primary)',
          }}>
            {column.title}
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: column.color,
            background: column.color + '18',
            padding: '1px 7px',
            borderRadius: '20px',
            minWidth: '22px',
            textAlign: 'center',
          }}>
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onCreateTask(column.id)}
          title={`Add task to ${column.title}`}
          style={{
            width: '24px', height: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            background: 'transparent',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Cards list */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minHeight: '80px',
        }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTaskCard
              key={task.id}
              task={task}
              members={members}
              labels={labels}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <EmptyState column={column} onAdd={() => onCreateTask(column.id)} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ column, onAdd }: { column: Column; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '24px 16px',
        border: `1px dashed ${column.color}30`,
        borderRadius: 'var(--radius-md)',
        background: `${column.color}05`,
        color: 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        width: '100%',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = `${column.color}10`;
        (e.currentTarget as HTMLButtonElement).style.borderColor = `${column.color}50`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = `${column.color}05`;
        (e.currentTarget as HTMLButtonElement).style.borderColor = `${column.color}30`;
      }}
    >
      <Plus size={16} color={column.color} style={{ opacity: 0.6 }} />
      <span style={{ fontSize: '12px', fontWeight: 500 }}>Add a task</span>
    </button>
  );
}
