import type { Node, Edge } from '@xyflow/react';

export type NodeType = 'superior' | 'medio-a' | 'medio-b';

export type GroupStatus = 'active' | 'pending';

export interface GroupNodeData extends Record<string, unknown> {
  type: NodeType;
  title: string;
  leaderName?: string;
  leaderAvatar?: string;
  members: string[];
  projectId?: string;
  status?: GroupStatus;
  grade?: number;
  observations?: string;
  canEdit?: boolean;
  onEdit?: (id: string) => void;
  onGrade?: (id: string) => void;
}

export type GroupNode = Node<GroupNodeData>;

export interface ConnectionEdgeData extends Record<string, unknown> {
  label: string;
}

export type ConnectionEdge = Edge<ConnectionEdgeData>;

export interface ActivityLogEntry {
  id: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'group' | 'connection';
  entityId: string;
  entityName: string;
  timestamp: Date;
  details?: string;
}
