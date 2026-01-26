'use client';

import { cn } from '@/lib/utils';

interface GroupCardProps {
  id: string;
  name: string;
  type: 'superior' | 'medio-a' | 'medio-b';
  leaderName?: string | null;
  leaderAvatar?: string | null;
  memberCount: number;
  grade?: number | null;
  description?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onGrade?: (id: string) => void;
}

const typeConfig = {
  superior: {
    icon: 'school',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  'medio-a': {
    icon: 'code',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  'medio-b': {
    icon: 'database',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function GroupCard({
  id,
  name,
  type,
  leaderName,
  leaderAvatar,
  memberCount,
  grade,
  description,
  onEdit,
  onDelete,
  onGrade,
}: GroupCardProps) {
  const config = typeConfig[type];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl', config.iconBg)}>
          <span className={cn('material-symbols-outlined text-xl', config.iconColor)}>
            {config.icon}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Editar"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              edit
            </span>
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Excluir"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              delete
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
          {name}
        </h3>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
            {description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          {leaderAvatar ? (
            <img
              src={leaderAvatar}
              alt={leaderName || ''}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : leaderName ? (
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {getInitials(leaderName)}
              </span>
            </div>
          ) : null}
          {leaderName && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
              {leaderName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {grade !== undefined && grade !== null && onGrade && (
            <button
              onClick={() => onGrade(id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              title="Ver/Editar nota"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                star
              </span>
              <span className="text-sm font-bold">{(grade / 10).toFixed(1)}</span>
            </button>
          )}
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              group
            </span>
            <span className="text-sm font-medium">{memberCount} Membros</span>
          </div>
        </div>
      </div>
    </div>
  );
}
