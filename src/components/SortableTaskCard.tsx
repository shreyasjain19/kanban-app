import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import type { Task, TeamMember, Label } from '../types';

interface Props {
  task: Task;
  members: TeamMember[];
  labels: Label[];
  onClick: () => void;
}

export function SortableTaskCard({ task, members, labels, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} members={members} labels={labels} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}
