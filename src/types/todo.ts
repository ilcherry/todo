export type CategoryId = 'personal' | 'work' | 'study' | 'life';
export type Priority = 'high' | 'medium' | 'low';
export type TodoFilter = 'all' | 'today' | 'week' | 'done';

export interface Todo {
  id: string;
  title: string;
  note: string;
  category: CategoryId;
  priority: Priority;
  /** 本地日期，格式 YYYY-MM-DD；null 表示随时可做 */
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface TodoDraft {
  title: string;
  note: string;
  category: CategoryId;
  priority: Priority;
  dueDate: string | null;
}
