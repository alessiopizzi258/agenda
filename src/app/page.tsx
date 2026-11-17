'use client'

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, addYears, subYears, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, setMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useAgendaStore } from '@/store/useAgendaStore';

export default function EliteAgenda() {
  const { selectedDate, notes, setSelectedDate, updateNote } = useAgendaStore();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'year'>('month');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setCurrentDate(new Date());
    setIsMounted(true);
  }, []);

  if (!isMounted || !currentDate) return null;

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const currentNote = notes[dateKey] || '';

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const months = Array.from({ length: 12 }, (_, i) => setMonth(currentDate, i));

  return (
    <main className="h-screen w-screen flex items-center justify-center p-2 md:p-8">
      
      {/* L'Agenda Aperta */}
      <div className="w-full max-w-[1200px] h-full md:h-[90vh] bg-[var(--paper-bg)] shadow-2xl flex flex-col md:flex-row relative rounded-sm border border-[#d1cfc7]">
        
        {/* Rilegatura centrale (Spine) visibile solo su Desktop */}
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-16 -ml-8 bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none z-50"></div>

        {/* PAGINA SINISTRA: Calendario */}
        <section className="w-full md:w-1/2 h-1/2 md:h-full p-6 md:p-12 flex flex-col relative border-b md:border-b-0 border-[#d1cfc7]">
          
          <header className="flex justify-between items-center mb-8">
            <div className="flex gap-4 items-center">
              <button onClick={() => setView(view === 'month' ? 'year' : 'month')} className="text-gray-400 hover:text-black transition-colors">
                <CalendarIcon size={20} />
              </button>
              <h2 className="text-2xl md:text-3xl font-serif-luxury font-semibold text-[#2c2c2c] capitalize">
                {view === 'month' ? format(currentDate, 'MMMM yyyy', { locale: it }) : format(currentDate, 'yyyy', { locale: it })}
              </h2>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : subYears(currentDate, 1))} 
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addYears(currentDate, 1))} 
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </header>

          {/* VISTA MENSILE */}
          {view === 'month' && (
            <div className="flex-grow flex flex-col">
              <div className="grid grid-cols-7 gap-1 mb-4 text-center text-xs text-gray-400 uppercase font-medium tracking-widest">
                {['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'].map(day => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 flex-grow auto-rows-fr">
                {daysInMonth.map(day => {
                  const isSelected = isSameDay(day, selectedDate);
                  const hasNote = notes[format(day, 'yyyy-MM-dd')]?.trim().length > 0;
                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative w-full rounded-md flex items-center justify-center text-sm md:text-base transition-all font-serif-luxury
                        ${isSelected ? 'bg-[#2c2c2c] text-white shadow-md z-10' : 'hover:bg-black/5 text-[#4a4a4a]'}
                        ${isToday(day) && !isSelected ? 'border border-[#2c2c2c]/20' : ''}
                      `}
                    >
                      {format(day, 'd')}
                      {hasNote && !isSelected && (
                        <span className="absolute bottom-1 md:bottom-2 w-1 md:w-1.5 h-1 md:h-1.5 bg-[#1a365d] rounded-full opacity-70"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA ANNUALE */}
          {view === 'year' && (
            <div className="grid grid-cols-3 gap-4 flex-grow content-start">
              {months.map(month => (
                <button
                  key={month.toString()}
                  onClick={() => {
                    setCurrentDate(month);
                    setView('month');
                  }}
                  className="p-4 rounded-md hover:bg-black/5 flex items-center justify-center font-serif-luxury text-lg capitalize transition-colors"
                >
                  {format(month, 'MMM', { locale: it })}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* PAGINA DESTRA: Taccuino */}
        <section className="w-full md:w-1/2 h-1/2 md:h-full relative flex flex-col p-6 md:p-12 pl-6 md:pl-16">
          <header className="mb-6 flex flex-col items-end">
             <h1 className="text-3xl md:text-4xl font-serif-luxury font-bold text-[#2c2c2c] capitalize text-right border-b-2 border-black/10 pb-2 inline-block">
               {format(selectedDate, 'EEEE', { locale: it })}
             </h1>
             <span className="text-lg font-serif-luxury text-gray-500 italic mt-1">
               {format(selectedDate, 'd MMMM yyyy', { locale: it })}
             </span>
          </header>

          <textarea
            value={currentNote}
            onChange={(e) => updateNote(dateKey, e.target.value)}
            placeholder="Scrivi qui..."
            className="flex-grow w-full resize-none outline-none notebook-paper font-pen bg-transparent z-0"
            spellCheck="false"
          />
        </section>

      </div>
    </main>
  );
}