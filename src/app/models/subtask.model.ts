import { Status } from './status.model';

export interface Subtask {
  id: number;
  taskId: number;
  title: string;
  description: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubtaskRequest {
  taskId: number;
  title: string;
  description?: string;
}