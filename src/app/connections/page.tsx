'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminGuard } from '@/components/auth/AdminGuard';

interface GroupOption {
  id: string;
  name: string;
  type: string;
}

interface ConnectionData {
  id: string;
  appName: string;
  source: { id: string; name: string; type: string };
  target: { id: string; name: string; type: string };
  createdAt: string;
  deletedAt: string | null;
}

function ConnectionsContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<ConnectionData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const data = await response.json();
          setGroups(data.map((g: any) => ({ id: g.id, name: g.name, type: g.type })));
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    fetchGroups();
  }, []);

  // Fetch connections
  const fetchConnections = useCallback(async (resetPage = false) => {
    setIsLoading(true);
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('limit', '20');
    params.set('includeDeleted', showDeleted ? 'true' : 'false');
    if (selectedGroupId) params.set('groupId', selectedGroupId);

    try {
      const response = await fetch(`/api/connections?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        if (resetPage || currentPage === 1) {
          setConnections(result.data);
        } else {
          setConnections(prev => [...prev, ...result.data]);
        }
        setHasMore(result.pagination.hasMore);
        setTotal(result.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedGroupId, showDeleted]);

  useEffect(() => {
    fetchConnections(true);
  }, [selectedGroupId, showDeleted]);

  useEffect(() => {
    if (page > 1) fetchConnections(false);
  }, [page]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/connections/${deleteConfirm.id}`, { method: 'DELETE' });
      if (response.ok) {
        setConnections(prev =>
          prev.map(conn =>
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

  const filteredConnections = connections.filter(conn => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      conn.appName.toLowerCase().includes(query) ||
      conn.source.name.toLowerCase().includes(query) ||
      conn.target.name.toLowerCase().includes(query)
    );
  });

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'superior': return 'bg-teal-50 text-teal-600';
      case 'medio-a': return 'bg-amber-50 text-amber-600';
      case 'medio-b': return 'bg-violet-50 text-violet-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'superior': return 'Superior';
      case 'medio-a': return 'Turma A';
      case 'medio-b': return 'Turma B';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-display">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-slate-800">Conexões e Apps</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.displayName}</span>
            {user?.photoURL && (
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-1">Total de Conexões</p>
            <p className="text-2xl font-bold text-slate-800">{total}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-1">Ativas</p>
            <p className="text-2xl font-bold text-emerald-600">
              {connections.filter(c => !c.deletedAt).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-1">Removidas</p>
            <p className="text-2xl font-bold text-red-500">
              {connections.filter(c => c.deletedAt).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
            </span>
            <input
              type="text"
              placeholder="Buscar por app ou grupo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Todos os grupos</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="rounded border-slate-300 text-teal-500 focus:ring-teal-500"
            />
            Mostrar removidas
          </label>
        </div>

        {/* Connections List */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            <div className="col-span-3">App</div>
            <div className="col-span-3">Origem</div>
            <div className="col-span-3">Destino</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Loading */}
          {isLoading && connections.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-teal-500"></div>
            </div>
          )}

          {/* Empty */}
          {!isLoading && filteredConnections.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-4xl text-slate-300">link_off</span>
              <p className="text-slate-400 mt-2">Nenhuma conexão encontrada</p>
            </div>
          )}

          {/* Rows */}
          {filteredConnections.map(conn => (
            <div
              key={conn.id}
              className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-100 items-center ${
                conn.deletedAt ? 'opacity-50' : ''
              }`}
            >
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>apps</span>
                  <span className="font-medium text-slate-800">{conn.appName}</span>
                </div>
              </div>
              <div className="col-span-3">
                <div className="text-sm text-slate-700">{conn.source.name}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${getTypeStyle(conn.source.type)}`}>
                  {getTypeLabel(conn.source.type)}
                </span>
              </div>
              <div className="col-span-3">
                <div className="text-sm text-slate-700">{conn.target.name}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${getTypeStyle(conn.target.type)}`}>
                  {getTypeLabel(conn.target.type)}
                </span>
              </div>
              <div className="col-span-2">
                {conn.deletedAt ? (
                  <span className="text-xs px-2 py-1 rounded bg-red-50 text-red-600">Removida</span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-600">Ativa</span>
                )}
              </div>
              <div className="col-span-1 text-right">
                {!conn.deletedAt && (
                  <button
                    onClick={() => setDeleteConfirm(conn)}
                    className="p-1 text-slate-400 hover:text-red-500"
                    title="Remover"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="px-4 py-3 flex justify-center border-t border-slate-100">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={isLoading}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
                    Carregando...
                  </>
                ) : (
                  <>
                    Carregar mais
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>expand_more</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setDeleteConfirm(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Remover Conexão</h3>
            <p className="text-sm text-slate-600 mb-4">
              Remover a conexão "{deleteConfirm.appName}" entre {deleteConfirm.source.name} e {deleteConfirm.target.name}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
    </div>
  );
}

export default function ConnectionsPage() {
  return (
    <AdminGuard>
      <ConnectionsContent />
    </AdminGuard>
  );
}
