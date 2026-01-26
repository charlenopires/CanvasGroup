'use client';

import { Select } from '@/components/ui';
import { PeriodFilter, ACTION_FILTER_OPTIONS, PERIOD_FILTER_OPTIONS } from '@/lib/activity-utils';
import { cn } from '@/lib/utils';

interface ActivityFiltersProps {
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
  periodFilter: PeriodFilter;
  onPeriodFilterChange: (value: PeriodFilter) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;
}

export function ActivityFilters({
  actionFilter,
  onActionFilterChange,
  periodFilter,
  onPeriodFilterChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
}: ActivityFiltersProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Action Type Filter */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tipo de Ação
          </label>
          <Select
            value={actionFilter}
            onChange={(e) => onActionFilterChange(e.target.value)}
          >
            {ACTION_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Period Filter */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Período
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PERIOD_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onPeriodFilterChange(option.value as PeriodFilter)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  periodFilter === option.value
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Date Range */}
      {periodFilter === 'custom' && (
        <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              De
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomStartDateChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Até
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomEndDateChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
