import { useState, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useTeamMembers } from './hooks/useTeamMembers';
import { useLabels } from './hooks/useLabels';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskModal } from './components/TaskModal';
import { TeamModal } from './components/TeamModal';
import { LabelsModal } from './components/LabelsModal';
import { LoadingScreen } from './components/LoadingScreen';
import type { Task } from './types';
import './styles/globals.css';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, moveTask, refetch } = useTasks(user?.id);
  const { members, createMember, deleteMember } = useTeamMembers(user?.id);
  const { labels, createLabel, deleteLabel } = useLabels(user?.id);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [labelsModalOpen, setLabelsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterLabel, setFilterLabel] = useState<string>('');
  const [createStatus, setCreateStatus] = useState<string>('todo');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(task.description?.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
      if (filterPriority && task.priority !== filterPriority) return false;
      if (filterAssignee && task.assignee_id !== filterAssignee) return false;
      if (filterLabel && !(task.label_ids || []).includes(filterLabel)) return false;
      return true;
    });
  }, [tasks, searchQuery, filterPriority, filterAssignee, filterLabel]);

  if (authLoading) return <LoadingScreen />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        tasks={tasks}
        members={members}
        labels={labels}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterAssignee={filterAssignee}
        setFilterAssignee={setFilterAssignee}
        filterLabel={filterLabel}
        setFilterLabel={setFilterLabel}
        onNewTask={() => { setCreateStatus('todo'); setCreateModalOpen(true); }}
        onTeamOpen={() => setTeamModalOpen(true)}
        onLabelsOpen={() => setLabelsModalOpen(true)}
      />

      <KanbanBoard
        tasks={filteredTasks}
        members={members}
        labels={labels}
        loading={tasksLoading}
        onTaskClick={(task) => setEditTask(task)}
        onTaskMove={moveTask}
        onCreateTask={(status) => { setCreateStatus(status); setCreateModalOpen(true); }}
      />

      {(createModalOpen) && (
        <TaskModal
          mode="create"
          initialStatus={createStatus}
          members={members}
          labels={labels}
          onSubmit={async (data) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await createTask(data as any);
            setCreateModalOpen(false);
          }}
          onClose={() => setCreateModalOpen(false)}
        />
      )}

      {editTask && (
        <TaskModal
          mode="edit"
          task={editTask}
          members={members}
          labels={labels}
          userId={user?.id}
          onSubmit={async (data) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await updateTask(editTask.id, data as any);
            setEditTask(null);
            refetch();
          }}
          onDelete={async () => {
            await deleteTask(editTask.id);
            setEditTask(null);
          }}
          onClose={() => setEditTask(null)}
        />
      )}

      {teamModalOpen && (
        <TeamModal
          members={members}
          onCreate={createMember}
          onDelete={deleteMember}
          onClose={() => setTeamModalOpen(false)}
        />
      )}

      {labelsModalOpen && (
        <LabelsModal
          labels={labels}
          onCreate={createLabel}
          onDelete={deleteLabel}
          onClose={() => setLabelsModalOpen(false)}
        />
      )}
    </div>
  );
}
