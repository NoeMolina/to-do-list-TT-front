import { Task } from "../../models/task.model";

export const NEXT_STATUSES: Record<string, string[]> = {
  PENDIENTE: ['EN_PROGRESO', 'CANCELADO'],
  EN_PROGRESO: ['COMPLETADO'],
  COMPLETADO: [],
  CANCELADO: [],
};

export const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En progreso',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};

export const STATUS_SEVERITY: Record<string, 'info' | 'warn' | 'success' | 'danger'> = {
  PENDIENTE: 'info',
  EN_PROGRESO: 'warn',
  COMPLETADO: 'success',
  CANCELADO: 'danger',
};

export interface BoardColumn {
  key: string;
  title: string;
  tasks: Task[];
}

export const STATUS_BUTTON_CLASSES: Record<string, string> = {
  info: 'text-xs !text-blue-600 !border-blue-300 hover:!bg-blue-50',
  warn: 'text-xs !text-amber-600 !border-amber-300 hover:!bg-amber-50',
  success: 'text-xs !text-green-600 !border-green-300 hover:!bg-green-50',
  danger: 'text-xs !text-red-600 !border-red-300 hover:!bg-red-50'
};
