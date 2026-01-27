'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { GroupNodeData, NodeType, GroupStatus } from '@/types/canvas';

const nodeStyles = {
  superior: {
    accentColor: 'border-l-teal-400',
    handleColor: 'bg-slate-300 hover:bg-slate-400',
  },
  'medio-a': {
    accentColor: 'border-l-amber-400',
    handleColor: 'bg-slate-300 hover:bg-slate-400',
  },
  'medio-b': {
    accentColor: 'border-l-violet-400',
    handleColor: 'bg-slate-300 hover:bg-slate-400',
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function GroupNodeComponent({
  id,
  data,
  selected,
}: NodeProps) {
  const nodeData = data as GroupNodeData;
  const style = nodeStyles[nodeData.type as NodeType];
  const isMedio = nodeData.type === 'medio-a' || nodeData.type === 'medio-b';
  const isSuperior = nodeData.type === 'superior';
  const status = (nodeData.status || 'active') as GroupStatus;

  return (
    <div
      className={`
        relative w-[260px] bg-white rounded-lg border border-dashed border-slate-300 border-l-[3px] border-l-solid ${style.accentColor}
      `}
      style={{
        borderLeftStyle: 'solid',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Connection Handles for Superior - Left and Right sides (receives from both Médio groups) */}
      {isSuperior && (
        <>
          {/* Left handle - receives from Médio A */}
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            className="!w-2 !h-2 !rounded-full !bg-slate-300 !border-0"
            style={{ left: -4 }}
          />
          {/* Right handle - receives from Médio B */}
          <Handle
            type="target"
            position={Position.Right}
            id="right"
            className="!w-2 !h-2 !rounded-full !bg-slate-300 !border-0"
            style={{ right: -4 }}
          />
        </>
      )}

      {/* Connection Handle for Médio A - Right side (connects to Superior on left) */}
      {nodeData.type === 'medio-a' && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-2 !rounded-full !bg-slate-300 !border-0 cursor-crosshair"
          style={{ right: -4 }}
        />
      )}

      {/* Connection Handle for Médio B - Left side (connects to Superior on right) */}
      {nodeData.type === 'medio-b' && (
        <Handle
          type="source"
          position={Position.Left}
          className="!w-2 !h-2 !rounded-full !bg-slate-300 !border-0 cursor-crosshair"
          style={{ left: -4 }}
        />
      )}

      <div className="p-4">
        {/* Header - Title and Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-bold text-slate-800">
            {nodeData.title}
          </h3>
          <div className="flex items-center gap-1.5">
            {nodeData.canEdit && (
              <button
                onClick={() => (nodeData.onEdit as Function)?.(id)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Editar grupo"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
              </button>
            )}
            <span
              className={`
                px-2 py-0.5 rounded text-[11px] font-medium
                ${status === 'active'
                  ? 'bg-teal-50 text-teal-600 border border-teal-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
                }
              `}
            >
              {status === 'active' ? 'Active' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Group Leader - Only for Superior */}
        {/* Group Leader - For all groups if available */}
        {nodeData.leaderName && (
          <div className="flex items-center gap-3 mb-4">
            {nodeData.leaderAvatar ? (
              <img
                src={nodeData.leaderAvatar}
                alt={nodeData.leaderName}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-xs font-semibold text-slate-500">
                  {getInitials(nodeData.leaderName)}
                </span>
              </div>
            )}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                Líder
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {nodeData.leaderName}
              </p>
            </div>
          </div>
        )}

        {/* Project ID - Only for Médio */}
        {isMedio && nodeData.projectId && (
          <div className="flex items-center gap-2 mb-3 text-slate-400">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>link</span>
            <span className="text-xs">Project ID: {nodeData.projectId}</span>
          </div>
        )}

        {/* Members */}
        {isSuperior ? (
          // Superior: List format
          <div className="space-y-1.5">
            {nodeData.members.slice(0, 4).map((member, index) => (
              <div key={index} className="flex items-center gap-2 text-slate-600">
                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>
                  person
                </span>
                <span className="text-sm">{member}</span>
              </div>
            ))}
            {nodeData.members.length > 4 && (
              <p className="text-xs text-slate-400 pl-6">
                +{nodeData.members.length - 4} mais
              </p>
            )}
          </div>
        ) : (
          // Médio: Tag format
          <div className="flex flex-wrap gap-1.5">
            {nodeData.members.slice(0, 5).map((member, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-md"
              >
                {member}
              </span>
            ))}
            {nodeData.members.length > 5 && (
              <span className="px-2 py-1 text-xs bg-slate-50 text-slate-400 rounded-md">
                +{nodeData.members.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer - Grading */}
      <div className="px-4 pb-3">
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          {typeof nodeData.grade === 'number' ? (
            <div
              className="flex items-center gap-1.5 text-amber-600 font-bold text-sm bg-amber-50 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => (nodeData.onGrade as Function)?.(id)}
              title="Clique para editar avaliação"
            >
              <span className="material-symbols-outlined text-[18px] fill-current">star</span>
              <span>{(nodeData.grade / 10).toFixed(1)}</span>
            </div>
          ) : (
            <button
              onClick={() => (nodeData.onGrade as Function)?.(id)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-600 text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors ml-auto"
              title="Avaliar grupo"
            >
              <span className="material-symbols-outlined text-[16px]">hotel_class</span>
              Avaliar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const GroupNode = memo(GroupNodeComponent);
