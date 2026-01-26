'use client';

import React from 'react';

interface GroupOption {
  id: string;
  name: string;
  type: string;
}

interface ConnectionFiltersProps {
  groups: GroupOption[];
  selectedGroupId: string;
  onGroupChange: (groupId: string) => void;
}

export const ConnectionFilters: React.FC<ConnectionFiltersProps> = ({
  groups,
  selectedGroupId,
  onGroupChange,
}) => {
  // Sort groups by type then name
  const sortedGroups = [...groups].sort((a, b) => {
    if (a.type !== b.type) {
      if (a.type === 'superior') return -1;
      if (b.type === 'superior') return 1;
      return a.type.localeCompare(b.type);
    }
    return a.name.localeCompare(b.name);
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'superior':
        return 'Superior';
      case 'medio-a':
        return 'Medio A';
      case 'medio-b':
        return 'Medio B';
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <div className="flex-1">
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Filtrar por Grupo
        </label>
        <div className="relative">
          <select
            value={selectedGroupId}
            onChange={(e) => onGroupChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 pr-10 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Todos os grupos</option>
            {sortedGroups.map((group) => (
              <option key={group.id} value={group.id}>
                [{getTypeLabel(group.type)}] {group.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionFilters;
