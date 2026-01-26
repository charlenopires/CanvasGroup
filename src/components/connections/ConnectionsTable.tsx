'use client';

import React from 'react';

export interface ConnectionData {
  id: string;
  appName: string;
  deletedAt: string | null;
  createdAt: string;
  source: {
    id: string;
    name: string;
    type: string;
  };
  target: {
    id: string;
    name: string;
    type: string;
  };
}

interface ConnectionsTableProps {
  connections: ConnectionData[];
  onDelete: (connection: ConnectionData) => void;
  isLoading?: boolean;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) {
    return date.toLocaleDateString('pt-BR');
  } else if (diffDays > 0) {
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  } else if (diffHours > 0) {
    return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
  } else if (diffMins > 0) {
    return `${diffMins} min atrás`;
  } else {
    return 'agora';
  }
}

export const ConnectionsTable: React.FC<ConnectionsTableProps> = ({
  connections,
  onDelete,
  isLoading,
}) => {
  if (isLoading && connections.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
          link_off
        </span>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Nenhuma conexão encontrada
        </p>
      </div>
    );
  }

  // Determine which group is Superior and which is Middle School
  const getGroupsByType = (conn: ConnectionData) => {
    const superior = conn.source.type === 'superior' ? conn.source : conn.target;
    const middle = conn.source.type === 'superior' ? conn.target : conn.source;
    return { superior, middle };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Grupo Superior
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Grupo Médio
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              App
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Criado em
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Status
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {connections.map((conn, index) => {
            const { superior, middle } = getGroupsByType(conn);
            const isDeleted = conn.deletedAt !== null;

            return (
              <tr
                key={conn.id}
                className={`
                  ${index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'}
                  ${isDeleted ? 'opacity-60' : ''}
                  hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
                `}
              >
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {superior.name}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      middle.type === 'medio-a'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {middle.type === 'medio-a' ? 'A' : 'B'}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {middle.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {conn.appName}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {formatRelativeTime(conn.createdAt)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {isDeleted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      <span className="material-symbols-outlined text-[14px]">cancel</span>
                      Removida
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Ativa
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {!isDeleted && (
                    <button
                      onClick={() => onDelete(conn)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remover conexão"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ConnectionsTable;
