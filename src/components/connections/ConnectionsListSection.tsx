'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ConnectionsTable, ConnectionData } from './ConnectionsTable';
import { ConnectionFilters } from './ConnectionFilters';

interface GroupOption {
  id: string;
  name: string;
  type: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export const ConnectionsListSection: React.FC = () => {
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<ConnectionData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch groups for filter dropdown
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const data = await response.json();
          setGroups(data.map((g: any) => ({
            id: g.id,
            name: g.name,
            type: g.type,
          })));
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    fetchGroups();
  }, []);

  // Fetch connections
  const fetchConnections = useCallback(
    async (resetPage = false) => {
      setIsLoading(true);
      const currentPage = resetPage ? 1 : page;
      if (resetPage) setPage(1);

      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');
      params.set('includeDeleted', 'true');

      if (selectedGroupId) {
        params.set('groupId', selectedGroupId);
      }

      try {
        const response = await fetch(`/api/connections?${params.toString()}`);
        if (response.ok) {
          const result = await response.json();

          if (resetPage || currentPage === 1) {
            setConnections(result.data);
          } else {
            setConnections((prev) => [...prev, ...result.data]);
          }

          setHasMore(result.pagination.hasMore);
          setTotal(result.pagination.total);
        }
      } catch (error) {
        console.error('Error fetching connections:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [page, selectedGroupId]
  );

  // Fetch on filter change
  useEffect(() => {
    fetchConnections(true);
  }, [selectedGroupId]);

  // Fetch on page change (for load more)
  useEffect(() => {
    if (page > 1) {
      fetchConnections(false);
    }
  }, [page]);

  // Handle delete
  const handleDeleteClick = (connection: ConnectionData) => {
    setDeleteConfirm(connection);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/connections/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state to show as deleted
        setConnections((prev) =>
          prev.map((conn) =>
            conn.id === deleteConfirm.id
              ? { ...conn, deletedAt: new Date().toISOString() }
              : conn
          )
        );
      }
    } catch (error) {
      console.error('Error deleting connection:', error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <>
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>link</span>
              Conexões e Apps
            </h2>
            <span className="text-xs text-slate-400">{total} total</span>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <ConnectionFilters
            groups={groups}
            selectedGroupId={selectedGroupId}
            onGroupChange={setSelectedGroupId}
          />
        </div>

        {/* Table */}
        <div>
          <ConnectionsTable
            connections={connections}
            onDelete={handleDeleteClick}
            isLoading={isLoading}
          />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={handleCancelDelete}
          ></div>
          <div className="relative w-full max-w-sm transform rounded-lg bg-white dark:bg-slate-800 p-4 text-left shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }}>
                  warning
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  Remover Conexão
                </h3>
                <p className="text-xs text-slate-400">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Remover <strong className="text-slate-800 dark:text-white">&quot;{deleteConfirm.appName}&quot;</strong> entre{' '}
              <strong className="text-slate-800 dark:text-white">{deleteConfirm.source.name}</strong> e{' '}
              <strong className="text-slate-800 dark:text-white">{deleteConfirm.target.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    Removendo...
                  </>
                ) : (
                  'Remover'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectionsListSection;
