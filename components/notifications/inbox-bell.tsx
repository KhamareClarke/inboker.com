'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/lib/providers/auth-provider';
import { useInboxNotifications, formatInboxTime } from '@/hooks/use-inbox-notifications';
import { cn } from '@/lib/utils';

type InboxBellProps = {
  /** Light styling for gradient / colored headers */
  variant?: 'default' | 'onPrimary';
  className?: string;
};

export function InboxBell({ variant = 'default', className }: InboxBellProps) {
  const { user } = useAuth();
  const { items, unreadCount, loading, refresh, markRead, markAllRead } = useInboxNotifications(user?.id);
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const triggerClasses =
    variant === 'onPrimary'
      ? 'bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm'
      : '';

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void refresh();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant={variant === 'onPrimary' ? 'outline' : 'ghost'}
          size="icon"
          className={cn('relative shrink-0', triggerClasses, className)}
          aria-label="In-app notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-0.5 bg-red-500 text-white text-[10px] leading-[1.125rem] rounded-full text-center font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(100vw-1.5rem,22rem)] p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Alerts</span>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => void markAllRead()}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <Link href="/dashboard/settings?tab=notifications" onClick={() => setOpen(false)}>
                Settings
              </Link>
            </Button>
          </div>
        </div>
        <ScrollArea className="h-80">
          <div className="pr-3">
          {loading && (
            <p className="text-sm text-muted-foreground p-4">Loading…</p>
          )}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted-foreground p-4">No alerts yet.</p>
          )}
          {!loading &&
            items.map((row) => (
              <button
                key={row.id}
                type="button"
                className={cn(
                  'w-full text-left px-3 py-2.5 border-b last:border-b-0 hover:bg-muted/60 transition-colors',
                  !row.read_at && 'bg-blue-50/50 dark:bg-blue-950/20'
                )}
                onClick={() => {
                  if (!row.read_at) void markRead(row.id);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-snug">{row.title}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                    {formatInboxTime(row.created_at)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{row.body}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}