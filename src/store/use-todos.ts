import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Priority, Todo, TodoDraft } from '@/types/todo';
import { addDays, todayKey } from '@/utils/date';

const STORAGE_KEY = 'qingtodo.todos.v1';
const SEEDED_KEY = 'qingtodo.seeded.v1';

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** 未完成在前；同日期的按优先级、再按创建时间倒序 */
export function sortTodos(list: Todo[]): Todo[] {
  return [...list].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.completed) {
      return (b.completedAt ?? '').localeCompare(a.completedAt ?? '');
    }
    if (a.dueDate !== b.dueDate) {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.priority !== b.priority) {
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

function buildSeed(): Todo[] {
  const now = new Date().toISOString();
  const today = todayKey();
  return [
    {
      id: uid(),
      title: '给阳台上的绿萝浇水',
      note: '顺便擦一下叶片，看起来会更精神。',
      category: 'life',
      priority: 'low',
      dueDate: today,
      completed: false,
      completedAt: null,
      createdAt: now,
    },
    {
      id: uid(),
      title: '整理这周的设计稿反馈',
      note: '把散落在群里的意见收集到一处。',
      category: 'work',
      priority: 'high',
      dueDate: today,
      completed: false,
      completedAt: null,
      createdAt: now,
    },
    {
      id: uid(),
      title: '读 30 页《小径分岔的花园》',
      note: '',
      category: 'study',
      priority: 'medium',
      dueDate: addDays(today, 1),
      completed: false,
      completedAt: null,
      createdAt: now,
    },
    {
      id: uid(),
      title: '傍晚散步 4 公里',
      note: '沿着河边走，风很舒服。',
      category: 'personal',
      priority: 'medium',
      dueDate: today,
      completed: true,
      completedAt: now,
      createdAt: now,
    },
  ];
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!alive) return;
        if (raw) {
          const parsed = JSON.parse(raw) as Todo[];
          if (Array.isArray(parsed)) setTodos(parsed);
        } else {
          const seeded = await AsyncStorage.getItem(SEEDED_KEY);
          if (!seeded) {
            setTodos(buildSeed());
            await AsyncStorage.setItem(SEEDED_KEY, '1');
          }
        }
      } catch {
        // 读取失败时从空列表开始，不阻塞使用
      } finally {
        if (alive) {
          hydrated.current = true;
          setReady(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos)).catch(() => {});
  }, [todos]);

  const addTodo = useCallback((draft: TodoDraft) => {
    const todo: Todo = {
      id: uid(),
      title: draft.title.trim(),
      note: draft.note.trim(),
      category: draft.category,
      priority: draft.priority,
      dueDate: draft.dueDate,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [todo, ...prev]);
    return todo.id;
  }, []);

  const updateTodo = useCallback((id: string, draft: TodoDraft) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              title: draft.title.trim(),
              note: draft.note.trim(),
              category: draft.category,
              priority: draft.priority,
              dueDate: draft.dueDate,
            }
          : t,
      ),
    );
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : null,
            }
          : t,
      ),
    );
  }, []);

  const removeTodo = useCallback((id: string) => {
    let removed: Todo | undefined;
    setTodos((prev) => {
      removed = prev.find((t) => t.id === id);
      return prev.filter((t) => t.id !== id);
    });
    return removed;
  }, []);

  const restoreTodo = useCallback((todo: Todo) => {
    setTodos((prev) => (prev.some((t) => t.id === todo.id) ? prev : [todo, ...prev]));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }, []);

  return {
    todos,
    ready,
    addTodo,
    updateTodo,
    toggleTodo,
    removeTodo,
    restoreTodo,
    clearCompleted,
  };
}
