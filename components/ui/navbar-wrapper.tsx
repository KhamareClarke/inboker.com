'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Wraps navbar content with design-system container and alignment.
 * UAE template: consistent horizontal padding and max-width for nav bar.
 */
export interface NavbarWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Inner content uses main (1200px) or wide (1400px) container */
  size?: 'main' | 'wide';
}

const NavbarWrapper = React.forwardRef<HTMLDivElement, NavbarWrapperProps>(
  ({ className, size = 'main', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full px-[var(--container-padding-x)] sm:px-[var(--container-padding-x-sm)] relative',
          size === 'main' && 'max-w-content mx-auto',
          size === 'wide' && 'max-w-content-wide mx-auto',
          className
        )}
        data-ds="navbar-wrapper"
        {...props}
      >
        {children}
      </div>
    );
  }
);
NavbarWrapper.displayName = 'NavbarWrapper';

export { NavbarWrapper };
