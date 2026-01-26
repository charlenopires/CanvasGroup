// Activity types
export type ActivityActionType = 'login' | 'logout' | 'create' | 'update' | 'delete';
export type EntityType = 'user' | 'group' | 'connection' | 'grade';

export interface ActivityLogItem {
  id: string;
  userId: string | null;
  action: ActivityActionType;
  entityType: string | null;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    displayName: string | null;
    photoURL: string | null;
    email: string;
  } | null;
}

// Action type display configuration
export interface ActionConfig {
  label: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

export const actionConfig: Record<string, ActionConfig> = {
  'login_user': {
    label: 'Login',
    icon: 'login',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  'logout_user': {
    label: 'Logout',
    icon: 'logout',
    bgColor: 'bg-slate-100 dark:bg-slate-700',
    textColor: 'text-slate-600 dark:text-slate-400',
  },
  'create_connection': {
    label: 'Conexão criada',
    icon: 'link',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  'delete_connection': {
    label: 'Conexão excluída',
    icon: 'link_off',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-600 dark:text-red-400',
  },
  'create_group': {
    label: 'Grupo criado',
    icon: 'group_add',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  'update_group': {
    label: 'Grupo atualizado',
    icon: 'edit',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  'delete_group': {
    label: 'Grupo excluído',
    icon: 'group_remove',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-600 dark:text-red-400',
  },
  'create_grade': {
    label: 'Nota atribuída',
    icon: 'grade',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
};

export function getActionKey(action: string, entityType: string | null): string {
  return `${action}_${entityType || 'unknown'}`;
}

export function getActionConfig(action: string, entityType: string | null): ActionConfig {
  const key = getActionKey(action, entityType);
  return actionConfig[key] || {
    label: action,
    icon: 'info',
    bgColor: 'bg-slate-100 dark:bg-slate-700',
    textColor: 'text-slate-600 dark:text-slate-400',
  };
}

// Period filter types
export type PeriodFilter = 'today' | 'week' | 'month' | 'custom' | 'all';

export function getPeriodDates(period: PeriodFilter): { startDate: Date; endDate: Date } | null {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  switch (period) {
    case 'today': {
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      return { startDate: startOfToday, endDate };
    }
    case 'week': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);
      return { startDate: startOfWeek, endDate };
    }
    case 'month': {
      const startOfMonth = new Date(now);
      startOfMonth.setDate(startOfMonth.getDate() - 30);
      startOfMonth.setHours(0, 0, 0, 0);
      return { startDate: startOfMonth, endDate };
    }
    case 'custom':
    case 'all':
      return null;
    default:
      return null;
  }
}

// Filter options for dropdown
export const ACTION_FILTER_OPTIONS = [
  { value: '', label: 'Todas as ações' },
  { value: 'login_user', label: 'Login' },
  { value: 'logout_user', label: 'Logout' },
  { value: 'create_connection', label: 'Conexão criada' },
  { value: 'delete_connection', label: 'Conexão excluída' },
  { value: 'create_group', label: 'Grupo criado' },
  { value: 'update_group', label: 'Grupo atualizado' },
  { value: 'delete_group', label: 'Grupo excluído' },
  { value: 'create_grade', label: 'Nota atribuída' },
];

export const PERIOD_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mês' },
  { value: 'custom', label: 'Personalizado' },
];

// Parse combined filter value to action and entityType
export function parseActionFilter(filterValue: string): { action?: string; entityType?: string } {
  if (!filterValue) return {};
  const parts = filterValue.split('_');
  if (parts.length === 2) {
    return { action: parts[0], entityType: parts[1] };
  }
  return { action: filterValue };
}
