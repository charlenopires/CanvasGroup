'use client';

import { useState, useEffect, useRef } from 'react';

interface AppNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appName: string) => void;
  sourceTitle?: string;
  targetTitle?: string;
}

export function AppNameModal({
  isOpen,
  onClose,
  onSave,
  sourceTitle,
  targetTitle,
}: AppNameModalProps) {
  const [appName, setAppName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAppName('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (appName.trim()) {
      onSave(appName.trim());
      setAppName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && appName.trim()) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md transform rounded-2xl bg-white dark:bg-slate-800 p-6 text-left shadow-xl transition-all border border-slate-100 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">
              link
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Criar Conexão
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Vincule grupos com um nome de projeto
            </p>
          </div>
        </div>

        {/* Connection preview */}
        {sourceTitle && targetTitle && (
          <div className="mb-5 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                {sourceTitle}
              </span>
              <span className="material-symbols-outlined text-primary mx-2">
                arrow_forward
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                {targetTitle}
              </span>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Nome do Aplicativo / Projeto <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                apps
              </span>
            </span>
            <input
              ref={inputRef}
              type="text"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-3 py-3 text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm placeholder-slate-400"
              placeholder="Ex: Rastreador de Energia Solar"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Este nome será exibido na linha de conexão
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!appName.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Criar Conexão
          </button>
        </div>
      </div>
    </div>
  );
}
