'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main content (1200px), wide for dashboard (1400px), narrow (896px) */
  size?: 'main' | 'wide' | 'narrow' | 'content';
}

const sizeClasses = {
  main: 'max-w-content mx-auto',
  wide: 'max-w-content-wide mx-auto',
  narrow: 'max-w-content-narrow mx-auto',
  content: 'max-w-[var(--container-content)] mx-auto',
};

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'main', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full px-[var(--container-padding-x)] sm:px-[var(--container-padding-x-sm)] relative z-10',
          sizeClasses[size],
          className
        )}
        data-ds="container"
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';

export { Container };
