import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { TeamMember } from '../types';

export function useTeamMembers(userId: string | undefined) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    setMembers(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createMember = async (name: string, color: string) => {
    if (!userId) return;
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const { error } = await supabase.from('team_members').insert({
      name, color, initials, user_id: userId
    });
    if (error) throw error;
    await fetch();
  };

  const deleteMember = async (id: string) => {
    await supabase.from('team_members').delete().eq('id', id);
    await fetch();
  };

  return { members, loading, createMember, deleteMember, refetch: fetch };
}
