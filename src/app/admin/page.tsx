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
}

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  details: string | null;
  createdAt: string;
  user: { displayName: string | null; email: string } | null;
}

function AdminContent() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [groups, setGroups] = useState<GroupData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch groups
        const groupsRes = await fetch('/api/groups');
        if (groupsRes.ok) {
          const data = await groupsRes.json();
          setGroups(data.map((g: any) => ({
            id: g.id,
            type: g.type,
            title: g.name,
            members: g.members?.map((m: any) => m.name) || [],
            leaderName: g.leaderName || undefined,
            currentGrade: g.currentGrade ?? null,
          })));
        }

        // Fetch connections count
        const connRes = await fetch('/api/connections?limit=1');
        if (connRes.ok) {
          const data = await connRes.json();
          setConnectionsCount(data.pagination?.total || 0);
        }

        // Fetch recent activity
        const actRes = await fetch('/api/activity-logs?limit=5');
        if (actRes.ok) {
          const data = await actRes.json();
          setRecentActivity(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    total: groups.length,
    superior: groups.filter(g => g.type === 'superior').length,
    medioA: groups.filter(g => g.type === 'medio-a').length,
    medioB: groups.filter(g => g.type === 'medio-b').length,
    connections: connectionsCount,
  };

  const getTypeStyle = (type: NodeType) => {
    switch (type) {
      case 'superior': return { accent: 'border-l-teal-500', badge: 'bg-teal-50 text-teal-600' };
      case 'medio-a': return { accent: 'border-l-amber-500', badge: 'bg-amber-50 text-amber-600' };
      case 'medio-b': return { accent: 'border-l-violet-500', badge: 'bg-violet-50 text-violet-600' };
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'create': return { icon: 'add_circle', color: 'text-emerald-500' };
      case 'update': return { icon: 'edit', color: 'text-blue-500' };
      case 'delete': return { icon: 'remove_circle', color: 'text-red-500' };
      case 'login': return { icon: 'login', color: 'text-teal-500' };
      case 'logout': return { icon: 'logout', color: 'text-slate-500' };
      default: return { icon: 'info', color: 'text-slate-400' };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Agora';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-display">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>dashboard</span>
            </div>
            <span className="text-lg font-bold text-slate-800">Prof Charleno Canvas</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              <button className="px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm font-medium">
                Painel
              </button>
              <button onClick={() => router.push('/groups')} className="px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 text-sm">
                Grupos
              </button>
              <button onClick={() => router.push('/connections')} className="px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 text-sm">
                Conexões
              </button>
              <button onClick={() => router.push('/canvas')} className="px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 text-sm">
                Canvas
              </button>
            </nav>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 hidden sm:block">{user?.displayName}</span>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-semibold">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <button
                onClick={async () => { await signOut(); router.push('/'); }}
                className="p-2 text-slate-400 hover:text-slate-600"
                title="Sair"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Bem-vindo, {user?.displayName?.split(' ')[0] || 'Admin'}!</h1>
          <p className="text-slate-500">Visão geral do sistema de grupos e conexões.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-1">Total Grupos</p>
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
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-1">Conexões</p>
            <p className="text-2xl font-bold text-teal-600">{stats.connections}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent Groups */}
          <div className="md:col-span-2 bg-white rounded-lg border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Grupos Recentes</h2>
              <button
                onClick={() => router.push('/groups')}
                className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                Ver todos <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-teal-500"></div>
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-3xl text-slate-300">folder_off</span>
                  <p className="text-sm text-slate-400 mt-2">Nenhum grupo cadastrado</p>
                </div>
              ) : (
                groups.slice(0, 5).map(group => {
                  const style = getTypeStyle(group.type);
                  return (
                    <div key={group.id} className={`px-4 py-3 flex items-center justify-between border-l-4 ${style.accent}`}>
                      <div>
                        <p className="font-medium text-slate-800">{group.title}</p>
                        <p className="text-xs text-slate-400">{group.members.length} membros</p>
                      </div>
                      {group.currentGrade != null && (
                        <span className="text-sm font-semibold text-emerald-600">{group.currentGrade.toFixed(1)}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">Atividade Recente</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-teal-500"></div>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-3xl text-slate-300">history</span>
                  <p className="text-sm text-slate-400 mt-2">Nenhuma atividade</p>
                </div>
              ) : (
                recentActivity.map(log => {
                  const iconStyle = getActivityIcon(log.action);
                  return (
                    <div key={log.id} className="px-4 py-3 flex items-start gap-3">
                      <span className={`material-symbols-outlined ${iconStyle.color}`} style={{ fontSize: '18px' }}>
                        {iconStyle.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{log.details || log.action}</p>
                        <p className="text-xs text-slate-400">
                          {log.user?.displayName || log.user?.email || 'Sistema'} - {formatTime(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/groups')}
            className="bg-white rounded-lg border border-slate-200 p-4 text-left hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-teal-500 mb-2">groups</span>
            <p className="font-medium text-slate-800">Gerenciar Grupos</p>
            <p className="text-xs text-slate-400">Criar, editar e excluir grupos</p>
          </button>
          <button
            onClick={() => router.push('/connections')}
            className="bg-white rounded-lg border border-slate-200 p-4 text-left hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-teal-500 mb-2">link</span>
            <p className="font-medium text-slate-800">Ver Conexões</p>
            <p className="text-xs text-slate-400">Gerenciar apps conectados</p>
          </button>
          <button
            onClick={() => router.push('/canvas')}
            className="bg-white rounded-lg border border-slate-200 p-4 text-left hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-teal-500 mb-2">hub</span>
            <p className="font-medium text-slate-800">Abrir Canvas</p>
            <p className="text-xs text-slate-400">Visualizar conexões interativas</p>
          </button>
          <button
            onClick={async () => { await signOut(); router.push('/'); }}
            className="bg-white rounded-lg border border-slate-200 p-4 text-left hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-slate-400 mb-2">logout</span>
            <p className="font-medium text-slate-800">Sair</p>
            <p className="text-xs text-slate-400">Encerrar sessão</p>
          </button>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminContent />
    </AdminGuard>
  );
}
