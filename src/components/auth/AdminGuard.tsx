'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="flex items-center justify-center size-16 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">
              block
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Acesso Negado
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Você não tem permissão para acessar o painel administrativo.
            Entre em contato com um administrador se acredita que isso é um erro.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
