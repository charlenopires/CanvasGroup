import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-xl font-bold leading-none tracking-tight text-slate-900 dark:text-white',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center p-6 pt-0 border-t border-slate-100 dark:border-slate-700 mt-4',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Stat Card variant for dashboard
interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: string;
  iconColor?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, icon, iconColor = 'text-[var(--color-primary)]', trend, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700',
        'flex flex-col gap-2 relative overflow-hidden group',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className={cn('material-symbols-outlined text-4xl', iconColor)}>
            {icon}
          </span>
        </div>
      )}
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {trend && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-bold mt-1',
          trend.positive ? 'text-emerald-500' : 'text-slate-400'
        )}>
          {trend.positive && (
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
          )}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  )
);
StatCard.displayName = 'StatCard';

// Group Card variant
interface GroupCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon: string;
  iconBgColor: string;
  iconTextColor: string;
  leaderName?: string;
  leaderAvatar?: string;
  memberCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

const GroupCard = React.forwardRef<HTMLDivElement, GroupCardProps>(
  ({
    className,
    title,
    subtitle,
    icon,
    iconBgColor,
    iconTextColor,
    leaderName,
    leaderAvatar,
    memberCount,
    onEdit,
    onDelete,
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl p-5',
        'hover:shadow-md transition-shadow cursor-pointer group',
        className
      )}
      {...props}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn('p-2.5 rounded-lg', iconBgColor, iconTextColor)}>
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[var(--color-primary)] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          )}
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      {subtitle && (
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{subtitle}</p>
      )}
      {!subtitle && (
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-4 italic">
          {leaderName ? `Led by ${leaderName}` : 'No leader assigned'}
        </p>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
        {leaderName ? (
          <div className="flex items-center gap-2">
            {leaderAvatar ? (
              <div
                className="w-6 h-6 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-600"
                style={{ backgroundImage: `url("${leaderAvatar}")` }}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-slate-500">person</span>
              </div>
            )}
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{leaderName}</p>
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-[16px]">person</span>
          <span className="text-xs font-bold">{memberCount} Members</span>
        </div>
      </div>
    </div>
  )
);
GroupCard.displayName = 'GroupCard';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
  GroupCard
};
