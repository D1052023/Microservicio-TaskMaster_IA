export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  created_at: string;
}

export type CreateTaskPayload = Omit<Task, 'id' | 'created_at'>;
export type UpdateTaskPayload = Partial<CreateTaskPayload>;
