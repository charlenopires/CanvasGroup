'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input, Select, Label } from '@/components/ui/input';

interface ApiGroup {
  id: string;
  name: string;
  type: 'superior' | 'medio-a' | 'medio-b';
}

const CLASS_TYPES = [
  { value: 'medio-a', label: '2º Ano A' },
  { value: 'medio-b', label: '2º Ano B' },
  { value: 'superior', label: 'Superior' },
];

export default function TrabalhoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Load groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const data: ApiGroup[] = await response.json();
          setGroups(data);
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setIsLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  // Reset group selection when type changes
  useEffect(() => {
    setSelectedGroupId('');
  }, [selectedType]);

  const filteredGroups = groups.filter(g => g.type === selectedType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedGroupId || !projectUrl) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    // Client-side URL validation
    try {
      const url = new URL(projectUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        setError('O link deve começar com http:// ou https://');
        return;
      }
    } catch {
      setError('Insira um link válido (ex: https://hub.docker.com/r/seu-usuario/seu-projeto)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get userId from DB
      let userId: string | undefined;
      if (user?.email) {
        const meResponse = await fetch(`/api/auth/me?email=${encodeURIComponent(user.email)}`);
        if (meResponse.ok) {
          const meData = await meResponse.json();
          userId = meData?.id;
        }
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          projectUrl,
          userId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao enviar trabalho');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar trabalho');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-teal-500"></div>
          <p className="text-sm text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-display">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/canvas')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Voltar ao Canvas"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          </button>
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>assignment</span>
          </div>
          <span className="text-base font-bold text-slate-800">Enviar Trabalho</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{user.displayName || 'User'}</span>
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-semibold">
              {user.displayName?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-600" style={{ fontSize: '22px' }}>assignment</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Enviar Trabalho</h1>
                <p className="text-sm text-slate-500">Envie o link do projeto do seu grupo</p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-6 py-5">
            {success ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-green-600" style={{ fontSize: '28px' }}>check_circle</span>
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Trabalho enviado!</h2>
                <p className="text-sm text-slate-500 mb-6">O link do projeto foi registrado com sucesso.</p>
                <Button variant="primary" onClick={() => router.push('/canvas')}>
                  Voltar ao Canvas
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                    {error}
                  </div>
                )}

                {/* Class Type Select */}
                <div>
                  <Label required>Turma</Label>
                  <Select
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value)}
                  >
                    <option value="">Selecione a turma</option>
                    {CLASS_TYPES.map(ct => (
                      <option key={ct.value} value={ct.value}>{ct.label}</option>
                    ))}
                  </Select>
                </div>

                {/* Group Select */}
                <div>
                  <Label required>Grupo</Label>
                  <Select
                    value={selectedGroupId}
                    onChange={e => setSelectedGroupId(e.target.value)}
                    disabled={!selectedType || isLoadingGroups}
                  >
                    <option value="">
                      {!selectedType
                        ? 'Selecione a turma primeiro'
                        : filteredGroups.length === 0
                          ? 'Nenhum grupo encontrado'
                          : 'Selecione o grupo'}
                    </option>
                    {filteredGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </Select>
                </div>

                {/* Project URL */}
                <div>
                  <Label required>Link do Projeto</Label>
                  <Input
                    type="url"
                    value={projectUrl}
                    onChange={e => setProjectUrl(e.target.value)}
                    placeholder="https://hub.docker.com/r/seu-usuario/seu-projeto"
                    icon={<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>link</span>}
                    iconPosition="left"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => router.push('/canvas')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={isSubmitting || !selectedGroupId || !projectUrl}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                        Enviando...
                      </span>
                    ) : (
                      'Enviar Trabalho'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
