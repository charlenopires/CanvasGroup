'use client';

import { useState, useEffect, useCallback } from 'react';
import { ActivityLogItem } from './ActivityLogItem';
import { ActivityFilters } from './ActivityFilters';
import {
  ActivityLogItem as ActivityLogItemType,
  PeriodFilter,
  getPeriodDates,
  parseActionFilter,
} from '@/lib/activity-utils';

export function ActivityHistorySection() {
  // Filter state
  const [actionFilter, setActionFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Data state
  const [logs, setLogs] = useState<ActivityLogItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(
    async (resetPage = false) => {
      setIsLoading(true);

      const currentPage = resetPage ? 1 : page;
      if (resetPage) setPage(1);

      // Build query params
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');

      // Parse combined filter like 'create_connection'
      if (actionFilter) {
        const { action, entityType } = parseActionFilter(actionFilter);
        if (action) params.set('action', action);
        if (entityType) params.set('entityType', entityType);
      }

      // Handle period dates
      let periodDates = null;
      if (periodFilter !== 'custom' && periodFilter !== 'all') {
        periodDates = getPeriodDates(periodFilter);
      } else if (periodFilter === 'custom' && customStartDate && customEndDate) {
        periodDates = {
          startDate: new Date(customStartDate),
          endDate: new Date(customEndDate),
        };
      }

      if (periodDates) {
        params.set('startDate', periodDates.startDate.toISOString());
        params.set('endDate', periodDates.endDate.toISOString());
      }

      try {
        const response = await fetch(`/api/activity-logs?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();

          if (resetPage || currentPage === 1) {
            setLogs(data.data);
          } else {
            setLogs((prev) => [...prev, ...data.data]);
          }

          setHasMore(data.pagination.hasMore);
          setTotal(data.pagination.total);
        }
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [actionFilter, periodFilter, customStartDate, customEndDate, page]
  );

  // Fetch on filter change
  useEffect(() => {
    fetchLogs(true);
  }, [actionFilter, periodFilter, customStartDate, customEndDate]);

  // Fetch on page change (for load more)
  useEffect(() => {
    if (page > 1) {
      fetchLogs(false);
    }
  }, [page]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>history</span>
            Histórico de Atividades
          </h2>
          <span className="text-xs text-slate-400">{total} resultados</span>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <ActivityFilters
          actionFilter={actionFilter}
          onActionFilterChange={setActionFilter}
          periodFilter={periodFilter}
          onPeriodFilterChange={setPeriodFilter}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
        />
      </div>

      {/* Activity List */}
      <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
        {isLoading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">
              history
            </span>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
              Nenhuma atividade encontrada
            </p>
          </div>
        ) : (
          <>
            {logs.map((log) => (
              <ActivityLogItem key={log.id} item={log} />
            ))}
          </>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-transparent" />
                Carregando...
              </>
            ) : (
              <>
                Carregar mais
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>expand_more</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
