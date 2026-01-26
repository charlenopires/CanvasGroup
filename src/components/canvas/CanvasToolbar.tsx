'use client';

import { cn } from '@/lib/utils';

export type CanvasTool = 'select' | 'add' | 'link';

interface CanvasToolbarProps {
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  className?: string;
}

const tools: { id: CanvasTool; icon: string; label: string }[] = [
  { id: 'select', icon: 'near_me', label: 'Selecionar' },
  { id: 'add', icon: 'add_circle', label: 'Adicionar' },
  { id: 'link', icon: 'link', label: 'Conectar' },
];

export function CanvasToolbar({ activeTool, onToolChange, className }: CanvasToolbarProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
            activeTool === tool.id
              ? 'bg-teal-500 text-white'
              : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-200'
          )}
          title={tool.label}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '20px',
              fontVariationSettings: activeTool === tool.id ? "'FILL' 1" : undefined,
            }}
          >
            {tool.icon}
          </span>
        </button>
      ))}
    </div>
  );
}
