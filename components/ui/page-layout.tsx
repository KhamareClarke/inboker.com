'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Shared page layout structure (UAE template):
 * Navbar → Page header/hero → Main content container → Sections → Footer
 * Use as wrapper when you want the full page architecture; navbar/footer are
 * typically provided by app layout, so this focuses on main + sections.
 */
export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional hero or page header slot above main content */
  header?: React.ReactNode;
  /** Main content (sections, cards). Rendered inside design-system container. */
  children: React.ReactNode;
  /** Container size: main (1200px), wide (1400px), narrow (896px) */
  containerSize?: 'main' | 'wide' | 'narrow';
}

const containerSizeClasses = {
  main: 'max-w-content',
  wide: 'max-w-content-wide',
  narrow: 'max-w-content-narrow',
};

const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  (
    {
      className,
      header,
      children,
      containerSize = 'main',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col min-h-screen', className)}
        data-ds="page-layout"
        {...props}
      >
        {header != null && (
          <header data-ds="page-layout-header">{header}</header>
        )}
        <main className="flex-1 relative z-10">
          <div
            className={cn(
              'w-full mx-auto px-[var(--container-padding-x)] sm:px-[var(--container-padding-x-sm)]',
              containerSizeClasses[containerSize]
            )}
          >
            {children}
          </div>
        </main>
      </div>
    );
  }
);
PageLayout.displayName = 'PageLayout';

export { PageLayout };
