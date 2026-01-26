'use client';

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

interface ConnectionEdgeProps extends EdgeProps {
  onDeleteClick?: (edgeId: string) => void;
}

function ConnectionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  onDeleteClick,
}: ConnectionEdgeProps) {
  const edgeData = data as { label?: string } | undefined;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Animated edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#ef4444' : '#1997f0',
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: '6 4',
        }}
        className="animated-edge"
      />

      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
        >
          <path
            d="M2,2 L10,6 L2,10"
            fill="none"
            stroke={selected ? '#ef4444' : '#1997f0'}
            strokeWidth="1.5"
          />
        </marker>
      </defs>

      {/* Delete button - shown when selected */}
      {selected && (
        <EdgeLabelRenderer>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick?.(id);
            }}
            className="absolute pointer-events-all nodrag nopan bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 35}px)`,
            }}
            title="Remover conexão"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              delete
            </span>
          </button>
        </EdgeLabelRenderer>
      )}

      {/* Edge label with app name */}
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            className={`
              absolute pointer-events-all nodrag nopan
              px-3 py-1.5 rounded-lg
              bg-white dark:bg-slate-800
              border border-primary/30 dark:border-primary/50
              shadow-md
              text-xs font-semibold text-primary
              transition-all duration-200
              ${selected ? 'ring-2 ring-red-500 ring-offset-1 border-red-300' : ''}
            `}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                apps
              </span>
              {edgeData.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const ConnectionEdge = memo(ConnectionEdgeComponent);
