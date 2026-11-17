import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

interface AgendaState {
  selectedDate: Date;
  notes: Record<string, string>;
  setSelectedDate: (date: Date) => void;
  updateNote: (dateKey: string, text: string) => void;
}

export const useAgendaStore = create<AgendaState>()(
  persist(
    (set) => ({
      selectedDate: new Date(),
      notes: {},
      setSelectedDate: (date) => set({ selectedDate: date }),
      updateNote: (dateKey, text) =>
        set((state) => ({
          notes: { ...state.notes, [dateKey]: text },
        })),
    }),
    {
      name: 'elite-agenda-storage', // Memoria fissa offline-first
    }
  )
);