import { Category } from './category.model';
import { Status } from './status.model';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  category: Category;
  status: Status;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  categoryId: number;
  userId?: number;
}

export interface UpdateTaskStatusRequest {
  status: string;
}