import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-bold transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
        active:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        pending:
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        error:
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        primary:
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        superior:
          'bg-[var(--color-superior-light)] text-[var(--color-superior)] dark:bg-blue-900/30 dark:text-blue-400',
        'medio-a':
          'bg-[var(--color-medio-a-light)] text-[var(--color-medio-a)] dark:bg-amber-900/30 dark:text-amber-400',
        'medio-b':
          'bg-[var(--color-medio-b-light)] text-[var(--color-medio-b)] dark:bg-violet-900/30 dark:text-violet-400',
        outline:
          'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        className={cn(badgeVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
