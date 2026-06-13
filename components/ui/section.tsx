'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Larger vertical padding (UAE section rhythm) */
  size?: 'default' | 'large';
  as?: 'section' | 'div' | 'footer';
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, size = 'default', as: Comp = 'section', ...props }, ref) => {
    return (
      <Comp
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          'relative overflow-hidden',
          size === 'default' && 'py-[var(--space-6)]',
          size === 'large' && 'py-[var(--section-padding-y-lg)]',
          className
        )}
        data-ds="section"
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      />
    );
  }
);
Section.displayName = 'Section';

export { Section };
