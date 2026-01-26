'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/canvas');
      }
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      setError(null);
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (err) {
      setError('Falha ao entrar. Por favor, tente novamente.');
      console.error('Login error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

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

  return (
    <div className="font-display bg-background text-[#0d161c] dark:text-white antialiased overflow-x-hidden transition-colors duration-300 min-h-screen flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-[var(--color-background)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-6">
        <div className="bg-white dark:bg-[#152028] rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="flex items-center justify-center size-14 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 mb-5">
                <span className="material-symbols-outlined text-3xl">hub</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#0d161c] dark:text-white mb-2">
                Prof Charleno Canvas
              </h1>
            </div>

            <div className="space-y-8">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={isSigningIn}
                className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-white dark:bg-[#1e2936] px-6 py-4 text-base font-bold text-[#0d161c] dark:text-white shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-[#2a3644] hover:ring-slate-300 dark:hover:ring-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-[#101b22] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-primary"></div>
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <img
                      alt="Google G Logo"
                      className="h-6 w-6"
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    />
                    <span>Entrar com Google</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                  Organize e avalie conexões entre grupos diretamente no seu canvas interativo usando sua conta institucional.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#1a252e] py-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-center">
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
