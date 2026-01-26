'use client';

import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: {
    type: 'up' | 'stable' | 'new';
    text: string;
  };
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

export function StatCard({
  title,
  value,
  trend,
  icon,
  iconBgColor,
  iconColor,
}: StatCardProps) {
  const trendConfig = {
    up: {
      icon: 'trending_up',
      color: 'text-emerald-500',
    },
    stable: {
      icon: 'horizontal_rule',
      color: 'text-slate-400',
    },
    new: {
      icon: 'add_circle',
      color: 'text-emerald-500',
    },
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
            {title}
          </p>
          <p className="text-2xl font-semibold text-slate-800 dark:text-white">
            {value}
          </p>
          {trend && (
            <div className={cn('flex items-center gap-1 mt-1.5 text-xs', trendConfig[trend.type].color)}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                {trendConfig[trend.type].icon}
              </span>
              <span>{trend.text}</span>
            </div>
          )}
        </div>
        <div className={cn('p-2 rounded-md', iconBgColor)}>
          <span className={cn('material-symbols-outlined', iconColor)} style={{ fontSize: '20px' }}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}
