'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import { ActivityLogItem as ActivityLogItemType, getActionConfig } from '@/lib/activity-utils';
import { cn } from '@/lib/utils';

interface ActivityLogItemProps {
  item: ActivityLogItemType;
}

export function ActivityLogItem({ item }: ActivityLogItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = getActionConfig(item.action, item.entityType);

  return (
    <div
      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <Avatar
          src={item.user?.photoURL || undefined}
          name={item.user?.displayName || item.user?.email || 'Sistema'}
          size="sm"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* User Name */}
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              {item.user?.displayName || item.user?.email || 'Sistema'}
            </span>

            {/* Action Badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold',
                config.bgColor,
                config.textColor
              )}
            >
              <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
              {config.label}
            </span>
          </div>

          {/* Details Preview */}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate">
            {item.details || 'Sem detalhes'}
          </p>

          {/* Timestamp */}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {formatRelativeTime(new Date(item.createdAt))}
          </p>
        </div>

        {/* Expand Indicator */}
        <span
          className={cn(
            'material-symbols-outlined text-slate-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 ml-12 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Tipo de Entidade:</span>
              <span className="ml-2 font-medium text-slate-700 dark:text-slate-300">
                {item.entityType || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">ID da Entidade:</span>
              <span className="ml-2 font-mono text-xs text-slate-700 dark:text-slate-300">
                {item.entityId?.slice(0, 8) || 'N/A'}
              </span>
            </div>
          </div>
          {item.details && (
            <div>
              <span className="text-slate-500 dark:text-slate-400">Detalhes:</span>
              <p className="mt-1 text-slate-700 dark:text-slate-300">{item.details}</p>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Data/Hora:</span>
            <span className="ml-2 text-slate-700 dark:text-slate-300">
              {new Date(item.createdAt).toLocaleString('pt-BR')}
            </span>
          </div>
          {item.ipAddress && (
            <div>
              <span className="text-slate-500 dark:text-slate-400">IP:</span>
              <span className="ml-2 font-mono text-xs text-slate-700 dark:text-slate-300">
                {item.ipAddress}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
