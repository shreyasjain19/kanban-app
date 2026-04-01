import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ActivityLog } from '../types';

export function useActivityLogs(taskId: string | undefined) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const fetch = useCallback(async () => {
    if (!taskId) return;
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    setLogs(data || []);
  }, [taskId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { logs, refetch: fetch };
}
