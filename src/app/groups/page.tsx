'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminGuard } from '@/components/auth/AdminGuard';

type NodeType = 'superior' | 'medio-a' | 'medio-b';

interface GroupData {
  id: string;
  type: NodeType;
  title: string;
  members: string[];
  leaderName?: string;
  currentGrade?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

function GroupsContent() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [groups, setGroups] = useState<GroupData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<NodeType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupData | null>(null);
  const [deleteConfirmGroup, setDeleteConfirmGroup] = useState<GroupData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    category: 'superior' as NodeType,
    name: '',
    leader: '',
    participants: ''
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const data = await response.json();
          const transformedGroups: GroupData[] = data.map((g: any) => ({
            id: g.id,
            type: g.type as NodeType,
            title: g.name,
            members: g.members?.map((m: any) => m.name) || [],
            leaderName: g.leaderName || undefined,
            currentGrade: g.currentGrade ?? null,
            createdAt: new Date(g.createdAt),
            updatedAt: new Date(g.updatedAt),
          }));
          setGroups(transformedGroups);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(group => {
    const matchesType = filterType === 'all' || group.type === filterType;
    const matchesSearch = searchQuery.trim() === '' ||
      group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.leaderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.members.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const parseParticipants = (input: string): string[] => {
    return input.split(/[,\n]/).map(name => name.trim()).filter(name => name.length > 0);
  };

  const isFormValid = (): boolean => {
    return formData.name.trim().length > 0 && parseParticipants(formData.participants).length > 0;
  };

  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    setFormData({ category: 'superior', name: '', leader: '', participants: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (group: GroupData) => {
    setEditingGroup(group);
    setFormData({
      category: group.type,
      name: group.title,
      leader: group.leaderName || '',
      participants: group.members.join('\n')
    });
    setIsModalOpen(true);
  };

  const handleSaveGroup = () => {
    if (!isFormValid()) return;

    const members = parseParticipants(formData.participants);
    const now = new Date();

    if (editingGroup) {
      const updatedGroup: GroupData = {
        ...editingGroup,
        type: formData.category,
        title: formData.name.trim(),
        leaderName: formData.leader.trim() || undefined,
        members,
        updatedAt: now
      };
      setGroups(prev => prev.map(g => g.id === editingGroup.id ? updatedGroup : g));
    } else {
      const newGroup: GroupData = {
        id: `grp-${Date.now()}`,
        type: formData.category,
        title: formData.name.trim(),
        leaderName: formData.leader.trim() || undefined,
        members,
        createdAt: now,
        updatedAt: now
      };
      setGroups(prev => [...prev, newGroup]);
    }

    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmGroup) return;
    setGroups(prev => prev.filter(g => g.id !== deleteConfirmGroup.id));
    setDeleteConfirmGroup(null);
  };

  const getCategoryStyle = (type: NodeType) => {
    switch (type) {
      case 'superior':
        return { accent: 'border-l-teal-500', badge: 'bg-teal-50 text-teal-600', label: 'Superior' };
      case 'medio-a':
        return { accent: 'border-l-amber-500', badge: 'bg-amber-50 text-amber-600', label: 'Turma A' };
      case 'medio-b':
        return { accent: 'border-l-violet-500', badge: 'bg-violet-50 text-violet-600', label: 'Turma B' };
    }
  };

  const stats = {
    total: groups.length,
    superior: groups.filter(g => g.type === 'superior').length,
    medioA: groups.filter(g => g.type === 'medio-a').length,
    medioB: groups.filter(g => g.type === 'medio-b').length,
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
            <h1 className="text-xl font-bold text-slate-800">Grupos</h1>
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
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 border-l-4 border-l-teal-500">
            <p className="text-xs text-slate-400 mb-1">Superior</p>
            <p className="text-2xl font-bold text-slate-800">{stats.superior}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 border-l-4 border-l-amber-500">
            <p className="text-xs text-slate-400 mb-1">Turma A</p>
            <p className="text-2xl font-bold text-slate-800">{stats.medioA}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 border-l-4 border-l-violet-500">
            <p className="text-xs text-slate-400 mb-1">Turma B</p>
            <p className="text-2xl font-bold text-slate-800">{stats.medioB}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
              </span>
              <input
                type="text"
                placeholder="Buscar grupos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as NodeType | 'all')}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Todos</option>
              <option value="superior">Superior</option>
              <option value="medio-a">Turma A</option>
              <option value="medio-b">Turma B</option>
            </select>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Novo Grupo
          </button>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-teal-500"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-slate-300">folder_off</span>
            <p className="text-slate-400 mt-2">Nenhum grupo encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map(group => {
              const style = getCategoryStyle(group.type);
              return (
                <div
                  key={group.id}
                  className={`bg-white rounded-lg border border-slate-200 border-l-4 ${style.accent} p-4 hover:shadow-md transition-shadow group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{group.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${style.badge}`}>{style.label}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(group)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmGroup(group)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                      </button>
                    </div>
                  </div>

                  {group.leaderName && (
                    <p className="text-sm text-slate-500 mb-2">Líder: {group.leaderName}</p>
                  )}

                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>group</span>
                    <span>{group.members.length} membros</span>
                  </div>

                  {group.currentGrade != null && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-sm text-emerald-600 font-semibold">
                        Nota: {group.currentGrade.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as NodeType })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="superior">Superior</option>
                  <option value="medio-a">Turma A</option>
                  <option value="medio-b">Turma B</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Nome do grupo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Líder</label>
                <input
                  type="text"
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Nome do líder"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Participantes *</label>
                <textarea
                  value={formData.participants}
                  onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Um nome por linha"
                />
                <p className="text-xs text-slate-400 mt-1">{parseParticipants(formData.participants).length} participantes</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveGroup}
                disabled={!isFormValid()}
                className="px-4 py-2 text-sm text-white bg-teal-500 hover:bg-teal-600 rounded-lg disabled:bg-slate-300"
              >
                {editingGroup ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setDeleteConfirmGroup(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Grupo</h3>
            <p className="text-sm text-slate-600 mb-4">
              Excluir "{deleteConfirmGroup.title}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmGroup(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GroupsPage() {
  return (
    <AdminGuard>
      <GroupsContent />
    </AdminGuard>
  );
}
