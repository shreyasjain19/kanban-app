import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Task, Status, Priority } from '../types';

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:team_members!tasks_assignee_id_fkey(*),
          task_labels(label_id, labels(*))
        `)
        .eq('user_id', userId)
        .order('order_index', { ascending: true });

      if (err) throw err;

      const mapped = (data || []).map((t: Record<string, unknown>) => ({
        ...t,
        label_ids: ((t.task_labels as Array<{ label_id: string }>) || []).map((tl) => tl.label_id),
        labels: ((t.task_labels as Array<{ labels: unknown }>) || []).map((tl) => tl.labels).filter(Boolean),
      })) as Task[];

      setTasks(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: {
    title: string;
    description?: string;
    priority?: Priority;
    due_date?: string;
    assignee_id?: string;
    label_ids?: string[];
    status?: Status;
  }) => {
    if (!userId) return;
    const maxOrder = tasks.filter(t => t.status === (data.status || 'todo')).length;

    const { data: task, error: err } = await supabase
      .from('tasks')
      .insert({
        title: data.title,
        description: data.description,
        priority: data.priority || 'normal',
        due_date: data.due_date || null,
        assignee_id: data.assignee_id || null,
        status: data.status || 'todo',
        user_id: userId,
        order_index: maxOrder,
      })
      .select()
      .single();

    if (err) throw err;

    // Insert label associations
    if (data.label_ids && data.label_ids.length > 0) {
      await supabase.from('task_labels').insert(
        data.label_ids.map(lid => ({ task_id: task.id, label_id: lid }))
      );
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      task_id: task.id,
      user_id: userId,
      action: 'Created task',
    });

    await fetchTasks();
    return task;
  };

  const updateTask = async (id: string, updates: Partial<Task> & { label_ids?: string[] }) => {
    if (!userId) return;

    const { label_ids, assignee, labels, ...rest } = updates;

    const { error: err } = await supabase
      .from('tasks')
      .update(rest)
      .eq('id', id)
      .eq('user_id', userId);

    if (err) throw err;

    // Handle label updates
    if (label_ids !== undefined) {
      await supabase.from('task_labels').delete().eq('task_id', id);
      if (label_ids.length > 0) {
        await supabase.from('task_labels').insert(
          label_ids.map(lid => ({ task_id: id, label_id: lid }))
        );
      }
    }

    // Log status change
    if (rest.status) {
      const original = tasks.find(t => t.id === id);
      if (original && original.status !== rest.status) {
        const statusLabels: Record<Status, string> = {
          todo: 'To Do',
          in_progress: 'In Progress',
          in_review: 'In Review',
          done: 'Done',
        };
        await supabase.from('activity_logs').insert({
          task_id: id,
          user_id: userId,
          action: `Moved from ${statusLabels[original.status]} → ${statusLabels[rest.status as Status]}`,
        });
      }
    }

    await fetchTasks();
  };

  const deleteTask = async (id: string) => {
    if (!userId) return;
    const { error: err } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (err) throw err;
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveTask = async (taskId: string, newStatus: Status) => {
    // Optimistic update
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );

    const original = tasks.find(t => t.id === taskId);
    if (original && original.status !== newStatus) {
      const statusLabels: Record<Status, string> = {
        todo: 'To Do',
        in_progress: 'In Progress',
        in_review: 'In Review',
        done: 'Done',
      };
      await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      await supabase.from('activity_logs').insert({
        task_id: taskId,
        user_id: userId,
        action: `Moved from ${statusLabels[original.status]} → ${statusLabels[newStatus]}`,
      });
    }
  };

  return { tasks, loading, error, createTask, updateTask, deleteTask, moveTask, refetch: fetchTasks };
}
