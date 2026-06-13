'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

export type InboxNotificationRow = Database['public']['Tables']['user_inbox_notifications']['Row'];

export function formatInboxTime(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function useInboxNotifications(userId: string | undefined) {
  const [items, setItems] = useState<InboxNotificationRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_inbox_notifications')
        .select('id,user_id,type,title,body,metadata,read_at,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('[inbox]', error.message);
        setItems([]);
        return;
      }
      setItems((data as InboxNotificationRow[]) || []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = useMemo(() => items.filter((i) => !i.read_at).length, [items]);

  const markRead = useCallback(
    async (id: string) => {
      if (!userId || !supabase) return;
      const readAt = new Date().toISOString();
      const { error } = await supabase
        .from('user_inbox_notifications')
        .update({ read_at: readAt })
        .eq('id', id)
        .eq('user_id', userId);
      if (error) {
        console.warn('[inbox] mark read', error.message);
        return;
      }
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, read_at: readAt } : r)));
    },
    [userId]
  );

  const markAllRead = useCallback(async () => {
    if (!userId || !supabase) return;
    const unread = items.filter((i) => !i.read_at);
    if (unread.length === 0) return;
    const readAt = new Date().toISOString();
    const ids = unread.map((i) => i.id);
    const { error } = await supabase
      .from('user_inbox_notifications')
      .update({ read_at: readAt })
      .eq('user_id', userId)
      .in('id', ids);
    if (error) {
      console.warn('[inbox] mark all', error.message);
      return;
    }
    setItems((prev) => prev.map((r) => (!r.read_at ? { ...r, read_at: readAt } : r)));
  }, [userId, items]);

  return { items, unreadCount, loading, refresh: load, markRead, markAllRead };
}
