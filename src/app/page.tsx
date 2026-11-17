'use client'

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAgendaStore } from '@/store/useAgendaStore';

export default function EliteAgenda() {
  const { selectedDate, notes, setSelectedDate, updateNote } = useAgendaStore();
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Forza l'esecuzione del dato temporale solo lato client (bypassando il blocco Vercel)
  useEffect(() => {
    setCurrentMonth(new Date());
    setIsMounted(true);
  }, []);

  // Schermata vuota istantanea fino al completamento dell'idratazione
  if (!isMounted || !currentMonth) return null;

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const currentNote = notes[dateKey] || '';

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  return (
    <main className="flex w-full h-full flex-col md:flex-row bg-[#1a1a1a] p-2 md:p-6 gap-6">
      
      {/* SEZIONE SINISTRA: Calendario */}
      <section className="w-full md:w-[350px] flex-shrink-0 bg-[#222] rounded-2xl p-6 text-white shadow-2xl border border-[#333] flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-[#333] rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-medium tracking-wide uppercase">
            {format(currentMonth, 'MMMM yyyy', { locale: it })}
          </h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-[#333] rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs text-gray-500 uppercase font-bold">
          {['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'].map(day => <div key={day}>{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2 flex-grow">
          {daysInMonth.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const hasNote = notes[format(day, 'yyyy-MM-dd')]?.trim().length > 0;
            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative h-10 w-full rounded-lg flex items-center justify-center text-sm font-medium transition-all
                  ${isSelected ? 'bg-white text-black shadow-lg scale-110 z-10' : 'hover:bg-[#333] text-gray-300'}
                  ${isToday(day) && !isSelected ? 'border border-gray-600' : ''}
                `}
              >
                {format(day, 'd')}
                {hasNote && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 bg-gray-400 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* SEZIONE DESTRA: Taccuino */}
      <section className="flex-grow bg-[#fdfbf7] rounded-r-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-l-4 border-[#111]">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent z-10 pointer-events-none"></div>
        
        <header className="px-10 py-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm z-20">
          <h1 className="text-3xl font-bold text-gray-800">
            {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: it })}
          </h1>
        </header>

        <textarea
          value={currentNote}
          onChange={(e) => updateNote(dateKey, e.target.value)}
          placeholder="Inizia a scrivere i task operativi..."
          className="flex-grow w-full resize-none outline-none p-10 notebook-paper font-pen text-gray-900 bg-transparent z-0"
          spellCheck="false"
        />
      </section>

    </main>
  );
}