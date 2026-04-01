import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Label } from '../types';

export function useLabels(userId: string | undefined) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    setLabels(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createLabel = async (name: string, color: string) => {
    if (!userId) return;
    const { error } = await supabase.from('labels').insert({ name, color, user_id: userId });
    if (error) throw error;
    await fetch();
  };

  const deleteLabel = async (id: string) => {
    await supabase.from('labels').delete().eq('id', id);
    await fetch();
  };

  return { labels, loading, createLabel, deleteLabel, refetch: fetch };
}
