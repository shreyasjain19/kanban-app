import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Comment } from '../types';

export function useComments(taskId: string | undefined, userId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!taskId) return;
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at');
    setComments(data || []);
    setLoading(false);
  }, [taskId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addComment = async (content: string) => {
    if (!taskId || !userId) return;
    const { error } = await supabase.from('comments').insert({
      task_id: taskId, user_id: userId, content
    });
    if (error) throw error;
    await fetch();
  };

  return { comments, loading, addComment };
}
