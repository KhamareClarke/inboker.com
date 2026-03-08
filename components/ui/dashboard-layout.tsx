'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Dashboard layout wrapper – UAE-style structure.
 * Optional sidebar + main content area with design-system container (wide for dashboard).
 */
export interface DashboardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Sidebar content (e.g. nav links). Omit for full-width main. */
  sidebar?: React.ReactNode;
  /** Main content area */
  children: React.ReactNode;
}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ className, sidebar, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col min-h-screen', className)}
        data-ds="dashboard-layout"
        {...props}
      >
        <div className="flex flex-1">
          {sidebar != null && (
            <aside
              className="flex-shrink-0 border-r border-border bg-card"
              data-ds="dashboard-sidebar"
            >
              {sidebar}
            </aside>
          )}
          <main
            className={cn(
              'flex-1 overflow-auto',
              'w-full px-[var(--container-padding-x)] sm:px-[var(--container-padding-x-sm)] py-ds-4',
              'max-w-content-wide mx-auto'
            )}
            data-ds="dashboard-main"
          >
            {children}
          </main>
        </div>
      </div>
    );
  }
);
DashboardLayout.displayName = 'DashboardLayout';

export { DashboardLayout };
