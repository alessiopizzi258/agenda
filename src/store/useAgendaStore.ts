import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface AgendaState {
  selectedDateStr: string;
  notes: Record<string, string>;
  tasks: Record<string, Task[]>;
  setSelectedDateStr: (dateStr: string) => void;
  updateNote: (dateStr: string, text: string) => void;
  addTask: (dateStr: string, text: string) => void;
  toggleTask: (dateStr: string, taskId: string) => void;
  deleteTask: (dateStr: string, taskId: string) => void;
}

export const useAgendaStore = create<AgendaState>()(
  persist(
    (set) => ({
      selectedDateStr: format(new Date(), 'yyyy-MM-dd'),
      notes: {},
      tasks: {},
      setSelectedDateStr: (dateStr) => set({ selectedDateStr: dateStr }),
      updateNote: (dateStr, text) =>
        set((state) => ({
          notes: { ...state.notes, [dateStr]: text },
        })),
      addTask: (dateStr, text) =>
        set((state) => {
          const currentTasks = state.tasks[dateStr] || [];
          const newTask: Task = {
            id: Math.random().toString(36).substring(2, 9),
            text,
            completed: false,
          };
          return {
            tasks: {
              ...state.tasks,
              [dateStr]: [...currentTasks, newTask],
            },
          };
        }),
      toggleTask: (dateStr, taskId) =>
        set((state) => {
          const currentTasks = state.tasks[dateStr] || [];
          return {
            tasks: {
              ...state.tasks,
              [dateStr]: currentTasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            },
          };
        }),
      deleteTask: (dateStr, taskId) =>
        set((state) => {
          const currentTasks = state.tasks[dateStr] || [];
          return {
            tasks: {
              ...state.tasks,
              [dateStr]: currentTasks.filter((t) => t.id !== taskId),
            },
          };
        }),
    }),
    {
      name: 'elite-agenda-v2-storage',
    }
  )
);