import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, getInitials } from '@/lib/utils';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, name, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    const initials = name ? getInitials(name) : '?';

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, className }))}
        {...props}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold">
            {initials}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

// Avatar with status indicator
interface AvatarWithStatusProps extends AvatarProps {
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const AvatarWithStatus = React.forwardRef<HTMLDivElement, AvatarWithStatusProps>(
  ({ status, size, ...props }, ref) => {
    const statusColors = {
      online: 'bg-emerald-500',
      offline: 'bg-slate-400',
      busy: 'bg-red-500',
      away: 'bg-amber-500',
    };

    const statusSizes = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    };

    return (
      <div className="relative inline-block">
        <Avatar ref={ref} size={size} {...props} />
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-slate-800',
              statusColors[status],
              statusSizes[size || 'md']
            )}
          />
        )}
      </div>
    );
  }
);
AvatarWithStatus.displayName = 'AvatarWithStatus';

// Avatar Group
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 4, size = 'md', children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    const overlapSizes = {
      xs: '-space-x-2',
      sm: '-space-x-2',
      md: '-space-x-3',
      lg: '-space-x-4',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center', overlapSizes[size], className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className="ring-2 ring-white dark:ring-slate-800 rounded-full"
          >
            {React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size })
              : child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              avatarVariants({ size }),
              'ring-2 ring-white dark:ring-slate-800 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold flex items-center justify-center'
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarWithStatus, AvatarGroup, avatarVariants };
