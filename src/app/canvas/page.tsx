'use client';

import { useCallback, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { GroupNode, ConnectionEdge, AppNameModal, GradeModal, CreateGroupModal, EditGroupModal, SectionHeader } from '@/components/canvas';
import { ConfirmModal } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/constants';
import type { GroupNodeData, ConnectionEdgeData, ActivityLogEntry, NodeType, GroupStatus } from '@/types/canvas';

// Remove default React Flow group node wrapper styles
const customStyles = `
  .react-flow__node-group,
  .react-flow__node.react-flow__node-group {
    border: none !important;
    background: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleId = 'react-flow-custom-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = customStyles;
    document.head.appendChild(style);
  }
}

// Custom node types
const nodeTypes = {
  group: GroupNode,
  sectionHeader: SectionHeader,
};

// Column positions - Left: Médio A, Center: Superior, Right: Médio B
const COLUMN_POSITIONS = {
  'medio-a': { x: 30, headerY: 30 },
  'superior': { x: 420, headerY: 30 },
  'medio-b': { x: 810, headerY: 30 },
};

const CARD_START_Y = 90;
const CARD_SPACING = 250;

// Section header nodes
const sectionHeaders: Node[] = [
  {
    id: 'header-medio-a',
    type: 'sectionHeader',
    position: { x: COLUMN_POSITIONS['medio-a'].x, y: COLUMN_POSITIONS['medio-a'].headerY },
    draggable: false,
    selectable: false,
    data: {
      label: '2º ANO A',
      icon: 'menu_book',
      color: 'amber',
    },
  },
  {
    id: 'header-superior',
    type: 'sectionHeader',
    position: { x: COLUMN_POSITIONS['superior'].x, y: COLUMN_POSITIONS['superior'].headerY },
    draggable: false,
    selectable: false,
    data: {
      label: 'ENSINO SUPERIOR',
      icon: 'school',
      color: 'blue',
    },
  },
  {
    id: 'header-medio-b',
    type: 'sectionHeader',
    position: { x: COLUMN_POSITIONS['medio-b'].x, y: COLUMN_POSITIONS['medio-b'].headerY },
    draggable: false,
    selectable: false,
    data: {
      label: '2º ANO B',
      icon: 'science',
      color: 'violet',
    },
  },
];

// API response type
interface ApiGroup {
  id: string;
  name: string;
  type: 'superior' | 'medio-a' | 'medio-b';
  leaderName: string | null;
  leaderAvatar: string | null;
  projectId: string | null;
  status: 'active' | 'pending' | null;
  positionX: number | null;
  positionY: number | null;
  members: { id: string; name: string }[];
  grade?: number;
  observations?: string;
}

// Transform API data to React Flow nodes - organized in columns
function apiGroupToNode(
  group: ApiGroup,
  indexInColumn: number,
  onGrade: (id: string) => void,
  onEdit?: (id: string) => void,
  canEdit?: boolean
): Node {
  const columnX = COLUMN_POSITIONS[group.type].x;
  const y = CARD_START_Y + (indexInColumn * CARD_SPACING);

  return {
    id: group.id,
    type: 'group',
    position: { x: columnX, y },
    draggable: false,
    selectable: true,
    data: {
      type: group.type as NodeType,
      title: group.name,
      leaderName: group.leaderName || undefined,
      leaderAvatar: group.leaderAvatar || undefined,
      projectId: group.projectId || undefined,
      status: (group.status || 'active') as GroupStatus,
      members: group.members.map(m => m.name),
      grade: group.grade,
      observations: group.observations,
      onGrade,
      onEdit,
      canEdit,
    },
  };
}

// Zoom Controls Component
function ZoomControls() {
  const { zoomIn, zoomOut, getZoom } = useReactFlow();
  const [zoom, setZoom] = useState(85);

  const handleZoomIn = () => {
    zoomIn();
    setZoom(Math.round(getZoom() * 100));
  };

  const handleZoomOut = () => {
    zoomOut();
    setZoom(Math.round(getZoom() * 100));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setZoom(Math.round(getZoom() * 100));
    }, 100);
    return () => clearInterval(interval);
  }, [getZoom]);

  return (
    <div className="fixed bottom-4 right-4 z-20 flex items-center gap-1 bg-white rounded-lg border border-slate-200 shadow-sm">
      <button
        onClick={handleZoomOut}
        className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-l-lg transition-colors"
        title="Diminuir zoom"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>remove</span>
      </button>
      <span className="w-12 text-center text-xs font-medium text-slate-600">{zoom}%</span>
      <button
        onClick={handleZoomIn}
        className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-r-lg transition-colors"
        title="Aumentar zoom"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
      </button>
    </div>
  );
}

function CanvasContent() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([...sectionHeaders] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [edgeToDelete, setEdgeToDelete] = useState<Edge | null>(null);
  const [editingEdge, setEditingEdge] = useState<{ id: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [gradingGroupId, setGradingGroupId] = useState<string | null>(null);
  const [isSavingGrade, setIsSavingGrade] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const openGradeModal = useCallback((groupId: string) => {
    setGradingGroupId(groupId);
  }, []);

  const openEditModal = useCallback((groupId: string) => {
    setEditingGroupId(groupId);
  }, []);

  // Check if user can manage groups (not charleno@gmail.com)
  const canManageGroups = user?.email && user.email.toLowerCase() !== 'charleno@gmail.com';

  // Load groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const apiGroups: ApiGroup[] = await response.json();

          // Group by type and assign index within each column
          const typeCounts: Record<string, number> = { 'superior': 0, 'medio-a': 0, 'medio-b': 0 };

          const groupNodes = apiGroups.map((group) => {
            const indexInColumn = typeCounts[group.type];
            typeCounts[group.type]++;
            return apiGroupToNode(
              group,
              indexInColumn,
              openGradeModal,
              openEditModal,
              !!canManageGroups
            );
          });

          setNodes([...sectionHeaders, ...groupNodes]);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [setNodes, canManageGroups, openGradeModal, openEditModal]);

  // Load connections from API
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch('/api/connections');
        if (response.ok) {
          const data = await response.json();
          const apiConnections = data.data || [];

          const connectionEdges: Edge[] = apiConnections.map((conn: any) => {
            // Determine target handle based on source node type
            const sourceNode = nodes.find(n => n.id === conn.sourceId);
            const sourceType = (sourceNode?.data as GroupNodeData)?.type;

            // Médio A connects to left handle, Médio B connects to right handle
            const targetHandle = sourceType === 'medio-a' ? 'left' : 'right';

            return {
              id: conn.id,
              source: conn.sourceId,
              target: conn.targetId,
              targetHandle,
              type: 'connection',
              animated: true,
              data: { label: conn.appName },
            };
          });

          setEdges(connectionEdges);
        }
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };

    fetchConnections();
  }, [setEdges, nodes]);

  const logActivity = useCallback((
    action: 'create' | 'update' | 'delete',
    entityType: 'group' | 'connection',
    entityId: string,
    entityName: string,
    details?: string
  ) => {
    const entry: ActivityLogEntry = {
      id: `log-${Date.now()}`,
      action,
      entityType,
      entityId,
      entityName,
      timestamp: new Date(),
      details,
    };
    setActivityLog(prev => [entry, ...prev]);
  }, []);

  const isValidConnection = useCallback((connection: Connection): { valid: boolean; error?: string } => {
    const sourceNode = nodes.find(n => n.id === connection.source && n.type === 'group');
    const targetNode = nodes.find(n => n.id === connection.target && n.type === 'group');

    if (!sourceNode || !targetNode) {
      return { valid: false, error: 'Nós inválidos' };
    }

    const sourceData = sourceNode.data as GroupNodeData;
    const targetData = targetNode.data as GroupNodeData;

    if (sourceData.type === 'superior') {
      return { valid: false, error: 'Grupos Superior não podem iniciar conexões' };
    }

    if (targetData.type !== 'superior') {
      return { valid: false, error: 'Só é possível conectar a grupos Superior' };
    }

    // Check if source already has a connection
    const sourceHasConnection = edges.some(e => e.source === connection.source);
    if (sourceHasConnection) {
      return { valid: false, error: 'Este grupo já possui uma conexão ativa' };
    }

    // Determine which target handle should be used based on source type
    const expectedTargetHandle = sourceData.type === 'medio-a' ? 'left' : 'right';

    // Check if the target handle is already in use
    const handleAlreadyUsed = edges.some(e =>
      e.target === connection.target && e.targetHandle === expectedTargetHandle
    );

    if (handleAlreadyUsed) {
      const side = expectedTargetHandle === 'left' ? 'esquerdo' : 'direito';
      return {
        valid: false,
        error: `O conector ${side} deste Superior já está em uso`,
      };
    }

    return { valid: true };
  }, [nodes, edges]);

  const onConnect = useCallback((connection: Connection) => {
    const validation = isValidConnection(connection);

    if (!validation.valid) {
      setConnectionError(validation.error || 'Conexão não permitida');
      setTimeout(() => setConnectionError(null), 3000);
      return;
    }

    setPendingConnection(connection);
    setModalOpen(true);
    setPendingConnection(connection);
    setModalOpen(true);
  }, [isValidConnection]);

  const handleEdgeLabelClick = useCallback((edgeId: string, currentLabel: string) => {
    setEditingEdge({ id: edgeId, label: currentLabel });
    setModalOpen(true);
  }, []);

  const saveConnection = useCallback(async (appName: string) => {
    // Handle Update
    if (editingEdge) {
      try {
        const response = await fetch(`/api/connections/${editingEdge.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appName }),
        });

        if (response.ok) {
          setEdges(eds =>
            eds.map(e =>
              e.id === editingEdge.id
                ? { ...e, data: { ...e.data, label: appName } }
                : e
            )
          );

          // Find nodes for log
          const edge = edges.find(e => e.id === editingEdge.id);
          const sourceNode = nodes.find(n => n.id === edge?.source);
          const targetNode = nodes.find(n => n.id === edge?.target);
          const sourceTitle = (sourceNode?.data as GroupNodeData)?.title || 'Unknown';
          const targetTitle = (targetNode?.data as GroupNodeData)?.title || 'Unknown';

          logActivity('update', 'connection', editingEdge.id, appName, `Updated app name: ${sourceTitle} → ${targetTitle}`);
        }
      } catch (error) {
        console.error('Error updating connection:', error);
        setConnectionError('Falha ao atualizar conexão');
        setTimeout(() => setConnectionError(null), 3000);
      }

      setModalOpen(false);
      setEditingEdge(null);
      return;
    }

    // Handle Create
    if (!pendingConnection) return;

    const sourceNode = nodes.find(n => n.id === pendingConnection.source);
    const targetNode = nodes.find(n => n.id === pendingConnection.target);

    try {
      // Save to API
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: pendingConnection.source,
          targetId: pendingConnection.target,
          appName,
        }),
      });

      if (response.ok) {
        const newConnection = await response.json();

        const newEdge: Edge = {
          id: newConnection.id,
          source: pendingConnection.source!,
          target: pendingConnection.target!,
          sourceHandle: pendingConnection.sourceHandle,
          targetHandle: pendingConnection.targetHandle,
          type: 'connection',
          animated: true,
          data: { label: appName },
        };

        setEdges(eds => addEdge(newEdge, eds));

        const sourceTitle = (sourceNode?.data as GroupNodeData)?.title || 'Unknown';
        const targetTitle = (targetNode?.data as GroupNodeData)?.title || 'Unknown';
        logActivity('create', 'connection', newEdge.id, appName, `${sourceTitle} → ${targetTitle}`);
      }
    } catch (error) {
      console.error('Error saving connection:', error);
      setConnectionError('Falha ao salvar conexão');
      setTimeout(() => setConnectionError(null), 3000);
    }

    setModalOpen(false);
    setPendingConnection(null);
  }, [pendingConnection, editingEdge, nodes, setEdges, edges, logActivity]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setPendingConnection(null);
    setEditingEdge(null);
  }, []);

  const sourceTitle = useMemo(() => {
    if (editingEdge) {
      const edge = edges.find(e => e.id === editingEdge.id);
      const node = nodes.find(n => n.id === edge?.source);
      return (node?.data as GroupNodeData)?.title;
    }
    if (!pendingConnection) return undefined;
    const node = nodes.find(n => n.id === pendingConnection.source);
    return (node?.data as GroupNodeData)?.title;
  }, [pendingConnection, editingEdge, edges, nodes]);

  const targetTitle = useMemo(() => {
    if (editingEdge) {
      const edge = edges.find(e => e.id === editingEdge.id);
      const node = nodes.find(n => n.id === edge?.target);
      return (node?.data as GroupNodeData)?.title;
    }
    if (!pendingConnection) return undefined;
    const node = nodes.find(n => n.id === pendingConnection.target);
    return (node?.data as GroupNodeData)?.title;
  }, [pendingConnection, editingEdge, edges, nodes]);

  const handleEdgeDeleteClick = useCallback((edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId);
    if (edge) {
      setEdgeToDelete(edge);
    }
  }, [edges]);

  const confirmDeleteEdge = useCallback(async () => {
    if (!edgeToDelete) return;

    setIsDeleting(true);
    const edgeData = edgeToDelete.data as ConnectionEdgeData;

    try {
      await fetch(`/api/connections/${edgeToDelete.id}`, { method: 'DELETE' });

      setEdges(eds => eds.filter(e => e.id !== edgeToDelete.id));

      const sourceNode = nodes.find(n => n.id === edgeToDelete.source);
      const targetNode = nodes.find(n => n.id === edgeToDelete.target);
      const sourceTitle = (sourceNode?.data as GroupNodeData)?.title || 'Unknown';
      const targetTitle = (targetNode?.data as GroupNodeData)?.title || 'Unknown';

      logActivity('delete', 'connection', edgeToDelete.id, edgeData?.label || 'Connection', `${sourceTitle} → ${targetTitle}`);
    } catch (error) {
      console.error('Error deleting connection:', error);
      setConnectionError('Falha ao excluir conexão');
      setTimeout(() => setConnectionError(null), 3000);
    } finally {
      setIsDeleting(false);
      setEdgeToDelete(null);
    }
  }, [edgeToDelete, setEdges, nodes, logActivity]);

  const edgeTypes = useMemo(() => ({
    connection: (props: any) => (
      <ConnectionEdge
        {...props}
        onDeleteClick={handleEdgeDeleteClick}
        onLabelClick={handleEdgeLabelClick}
      />
    ),
  }), [handleEdgeDeleteClick, handleEdgeLabelClick]);

  const edgeToDeleteInfo = useMemo(() => {
    if (!edgeToDelete) return null;
    const edgeData = edgeToDelete.data as ConnectionEdgeData;
    const sourceNode = nodes.find(n => n.id === edgeToDelete.source);
    const targetNode = nodes.find(n => n.id === edgeToDelete.target);
    return {
      appName: edgeData?.label || 'Unknown',
      sourceTitle: (sourceNode?.data as GroupNodeData)?.title || 'Unknown',
      targetTitle: (targetNode?.data as GroupNodeData)?.title || 'Unknown',
    };
  }, [edgeToDelete, nodes]);

  const gradingNodeData = useMemo(() => {
    if (!gradingGroupId) return null;
    const node = nodes.find(n => n.id === gradingGroupId);
    return node ? (node.data as GroupNodeData) : null;
  }, [nodes, gradingGroupId]);

  const saveGroup = useCallback(async (data: { name: string; type: 'superior' | 'medio-a' | 'medio-b'; members: string[] }) => {
    if (!user) return;

    setIsSavingGroup(true);
    try {
      // Get userId from API
      const meResponse = await fetch('/api/auth/me', {
        headers: { 'x-firebase-uid': user.uid },
      });
      const meData = await meResponse.json();
      const userId = meData?.id;

      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          members: data.members,
          userId,
        }),
      });

      if (response.ok) {
        const newGroup = await response.json();

        // Calculate index for this type
        const existingNodesOfType = nodes.filter(
          n => n.type === 'group' && (n.data as GroupNodeData)?.type === data.type
        );
        const indexInColumn = existingNodesOfType.length;

        const newNode = apiGroupToNode(
          {
            ...newGroup,
            members: newGroup.members || [],
            grade: undefined,
            observations: undefined,
          },
          indexInColumn,
          openGradeModal,
          openEditModal,
          true
        );

        setNodes(nds => [...nds, newNode]);
        logActivity('create', 'group', newGroup.id, data.name, `Tipo: ${data.type}`);
        setCreateGroupOpen(false);
      } else {
        throw new Error('Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setConnectionError('Falha ao criar grupo');
      setTimeout(() => setConnectionError(null), 3000);
    } finally {
      setIsSavingGroup(false);
    }
  }, [user, nodes, setNodes, logActivity, openGradeModal, openEditModal]);

  const saveGrade = useCallback(async (grade: number, observations: string) => {
    if (!gradingGroupId) return;

    setIsSavingGrade(true);
    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: gradingGroupId,
          grade, // 0-100
          observations,
        }),
      });

      if (response.ok) {
        // Update local state
        setNodes(nds => nds.map(node => {
          if (node.id === gradingGroupId) {
            return {
              ...node,
              data: {
                ...node.data,
                grade,
                observations,
              },
            };
          }
          return node;
        }));

        const node = nodes.find(n => n.id === gradingGroupId);
        const title = (node?.data as GroupNodeData)?.title || 'Unknown';
        logActivity('update', 'group', gradingGroupId, title, `Avaliado com nota ${(grade / 10).toFixed(1)}`);

        setGradingGroupId(null);
      } else {
        throw new Error('Failed to save grade');
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      setConnectionError('Falha ao salvar avaliação');
      setTimeout(() => setConnectionError(null), 3000);
    } finally {
      setIsSavingGrade(false);
    }
  }, [gradingGroupId, nodes, logActivity, setNodes]);

  const editingGroupData = useMemo(() => {
    if (!editingGroupId) return null;
    const node = nodes.find(n => n.id === editingGroupId);
    if (!node) return null;
    const data = node.data as GroupNodeData;
    return {
      id: editingGroupId,
      name: data.title,
      type: data.type,
      leaderName: data.leaderName,
      members: data.members,
    };
  }, [nodes, editingGroupId]);

  const saveEdit = useCallback(async (data: { name: string; leaderName: string | null; members: string[] }) => {
    if (!editingGroupId || !user) return;

    setIsSavingEdit(true);
    try {
      // Get userId from API
      const meResponse = await fetch('/api/auth/me', {
        headers: { 'x-firebase-uid': user.uid },
      });
      const meData = await meResponse.json();
      const userId = meData?.id;

      const response = await fetch(`/api/groups/${editingGroupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          leaderName: data.leaderName,
          members: data.members,
          userId,
        }),
      });

      if (response.ok) {
        // Update local state
        setNodes(nds => nds.map(node => {
          if (node.id === editingGroupId) {
            return {
              ...node,
              data: {
                ...node.data,
                title: data.name,
                leaderName: data.leaderName || undefined,
                members: data.members,
              },
            };
          }
          return node;
        }));

        logActivity('update', 'group', editingGroupId, data.name, `Editado por ${user.displayName || user.email}`);
        setEditingGroupId(null);
      } else {
        throw new Error('Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      setConnectionError('Falha ao atualizar grupo');
      setTimeout(() => setConnectionError(null), 3000);
    } finally {
      setIsSavingEdit(false);
    }
  }, [editingGroupId, user, setNodes, logActivity]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-display">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>hub</span>
          </div>
          <span className="text-base font-bold text-slate-800">Prof Charleno Canvas</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/trabalho')}
            className="px-3 py-1.5 text-sm text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>assignment</span>
            Enviar Trabalho
          </button>
          {canManageGroups && (
            <button
              onClick={() => setCreateGroupOpen(true)}
              className="px-3 py-1.5 text-sm text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Cadastrar Grupo
            </button>
          )}
          {user?.email && isAdminEmail(user.email) && (
            <button
              onClick={() => router.push('/admin')}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Dashboard
            </button>
          )}
          <span className="text-sm text-slate-600">{user?.displayName || 'User'}</span>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-semibold">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
          )}
          <button
            onClick={async () => {
              await signOut();
              router.push('/');
            }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Sair"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
          </button>
        </div>
      </header>

      {/* Canvas */}
      <main className="flex-1 pt-14">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-teal-500"></div>
              <p className="text-sm text-slate-500">Carregando...</p>
            </div>
          </div>
        )}

        {connectionError && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            <span className="text-sm">{connectionError}</span>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          connectionLineStyle={{ stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 4' }}
          defaultEdgeOptions={{ type: 'connection', animated: true }}
          defaultViewport={{ x: 30, y: 10, zoom: 0.85 }}
          className="!bg-white"
          minZoom={0.3}
          maxZoom={1.5}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnDrag={true}
          nodesDraggable={false}
          nodesConnectable={true}
          elementsSelectable={false}
          selectNodesOnDrag={false}
          selectionOnDrag={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={0.8}
            color="#94a3b8"
          />
        </ReactFlow>

        {/* Custom Zoom Controls */}
        <ZoomControls />
      </main>

      <AppNameModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={saveConnection}
        sourceTitle={sourceTitle}
        targetTitle={targetTitle}
        currentAppName={editingEdge?.label}
      />

      <GradeModal
        isOpen={!!gradingGroupId}
        onClose={() => setGradingGroupId(null)}
        onSave={saveGrade}
        groupName={gradingNodeData?.title}
        initialGrade={gradingNodeData?.grade}
        initialObservations={gradingNodeData?.observations}
        isSaving={isSavingGrade}
      />

      <ConfirmModal
        open={!!edgeToDelete}
        onClose={() => setEdgeToDelete(null)}
        onConfirm={confirmDeleteEdge}
        title="Remover Conexão"
        description={edgeToDeleteInfo
          ? `Remover "${edgeToDeleteInfo.appName}" entre ${edgeToDeleteInfo.sourceTitle} e ${edgeToDeleteInfo.targetTitle}?`
          : 'Remover esta conexão?'
        }
        confirmText={isDeleting ? 'Removendo...' : 'Remover'}
        variant="danger"
      />

      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onSave={saveGroup}
        isSaving={isSavingGroup}
      />

      <EditGroupModal
        isOpen={!!editingGroupId}
        onClose={() => setEditingGroupId(null)}
        onSave={saveEdit}
        groupData={editingGroupData}
        isSaving={isSavingEdit}
      />
    </div>
  );
}

export default function CanvasPage() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
