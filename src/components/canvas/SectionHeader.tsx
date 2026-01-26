'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';

export interface SectionHeaderData extends Record<string, unknown> {
  label: string;
  icon: string;
  color: 'blue' | 'amber' | 'violet';
  badge?: string;
}

const colorStyles = {
  blue: {
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-500',
    badgeBg: 'bg-teal-50',
    badgeColor: 'text-teal-600',
    badgeBorder: 'border-teal-200',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    badgeBg: 'bg-amber-50',
    badgeColor: 'text-amber-600',
    badgeBorder: 'border-amber-200',
  },
  violet: {
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
    badgeBg: 'bg-violet-50',
    badgeColor: 'text-violet-600',
    badgeBorder: 'border-violet-200',
  },
};

function SectionHeaderComponent({ data }: NodeProps) {
  const headerData = data as SectionHeaderData;
  const style = colorStyles[headerData.color];

  return (
    <div className="flex items-center gap-3 select-none pointer-events-none">
      <div className={`${style.iconBg} p-1.5 rounded-md`}>
        <span className={`material-symbols-outlined ${style.iconColor}`} style={{ fontSize: '18px' }}>
          {headerData.icon}
        </span>
      </div>
      <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
        {headerData.label}
      </span>
      {headerData.badge && (
        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${style.badgeBg} ${style.badgeColor} border ${style.badgeBorder}`}>
          {headerData.badge}
        </span>
      )}
    </div>
  );
}

export const SectionHeader = memo(SectionHeaderComponent);
