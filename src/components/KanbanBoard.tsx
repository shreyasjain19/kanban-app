import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { COLUMNS, type Task, type Status, type TeamMember, type Label } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  members: TeamMember[];
  labels: Label[];
  loading: boolean;
  onTaskClick: (task: Task) => void;
  onTaskMove: (taskId: string, status: Status) => void;
  onCreateTask: (status: string) => void;
}

export function KanbanBoard({ tasks, members, labels, loading, onTaskClick, onTaskMove, onCreateTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    // over.id could be a column id or a task id — resolve to column
    const overId = over.id as string;
    const columnId = COLUMNS.find(c => c.id === overId)?.id
      ?? tasks.find(t => t.id === overId)?.status;

    if (!columnId) return;

    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== columnId) {
      onTaskMove(taskId, columnId as Status);
    }
  };

  if (loading) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: 'var(--text-muted)',
      }}>
        <div className="spinner" />
        <span style={{ fontSize: '13px' }}>Loading board…</span>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '12px',
        padding: '20px 24px 24px',
        overflowX: 'auto',
        overflowY: 'hidden',
        alignItems: 'flex-start',
        minHeight: 0,
      }}>
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasks.filter(t => t.status === col.id)}
            members={members}
            labels={labels}
            onTaskClick={onTaskClick}
            onCreateTask={onCreateTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div style={{ transform: 'rotate(2deg)', opacity: 0.95 }}>
            <TaskCard
              task={activeTask}
              members={members}
              labels={labels}
              onClick={() => {}}
              isDragging
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
