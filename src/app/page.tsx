'use client';

import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  setMonth,
  parseISO,
} from 'date-fns';
import { it } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  BookOpen,
  Calendar as CalendarIcon,
  PenTool,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useAgendaStore } from '@/store/useAgendaStore';

export default function EliteAgenda() {
  const {
    selectedDateStr,
    notes,
    tasks,
    setSelectedDateStr,
    updateNote,
    addTask,
    toggleTask,
    deleteTask,
  } = useAgendaStore();

  const [currentMonthDate, setCurrentMonthDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [rightTab, setRightTab] = useState<'all' | 'tasks' | 'notes'>('all');
  // Su mobile mostra di default il Foglio del Giorno pronto per scrivere
  const [mobilePage, setMobilePage] = useState<'calendar' | 'notebook'>('notebook');
  const [newTaskText, setNewTaskText] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setCurrentMonthDate(new Date());
    setIsMounted(true);
  }, []);

  if (!isMounted || !currentMonthDate) {
    return <div className="h-[100dvh] w-screen bg-[#141413]" />;
  }

  const selectedDate = parseISO(selectedDateStr);
  const currentNote = notes[selectedDateStr] || '';
  const currentTasks = tasks[selectedDateStr] || [];

  // Calcolo griglia calendario (Lunedì - Domenica)
  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const monthsOfYear = Array.from({ length: 12 }, (_, i) =>
    setMonth(currentMonthDate, i)
  );

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(selectedDateStr, newTaskText.trim());
    setNewTaskText('');
  };

  const handleSelectDay = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    setSelectedDateStr(formatted);
    if (!isSameMonth(day, currentMonthDate)) {
      setCurrentMonthDate(day);
    }
    // Su smartphone, toccando una data apre subito il foglio di quel giorno
    setMobilePage('notebook');
  };

  const shiftSelectedDay = (direction: 'prev' | 'next') => {
    const nextDate =
      direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    setSelectedDateStr(format(nextDate, 'yyyy-MM-dd'));
    if (!isSameMonth(nextDate, currentMonthDate)) {
      setCurrentMonthDate(nextDate);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDateStr(format(today, 'yyyy-MM-dd'));
    setCurrentMonthDate(today);
    setViewMode('month');
  };

  const completedCount = currentTasks.filter((t) => t.completed).length;

  return (
    <main className="h-[100dvh] w-full bg-[#141413] flex flex-col lg:items-center lg:justify-center p-0 sm:p-3 lg:p-6 overflow-hidden select-none">
      
      {/* CORNICE / COPERTINA IN PELLE */}
      <div className="w-full max-w-[1400px] h-full lg:h-[92dvh] bg-[#1f1d1b] sm:rounded-2xl lg:rounded-3xl p-0 sm:p-2.5 lg:p-5 shadow-[0_25px_70px_rgba(0,0,0,0.9)] border-0 sm:border border-[#332f2c] relative flex flex-col overflow-hidden">
        
        {/* Impuntura artigianale sulla pelle (Visibile da Tablet/Desktop) */}
        <div className="hidden sm:block absolute inset-2 lg:inset-2.5 rounded-xl lg:rounded-2xl border border-dashed border-[#4a433d]/45 pointer-events-none z-20" />

        {/* Segnalibro Rosso Centrale (Desktop) */}
        <div className="hidden lg:block absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-10 bg-gradient-to-b from-[#8b1e1e] to-[#5e1111] shadow-md z-40 rounded-b-sm" />

        {/* CONTENITORE PAGINE DELL'AGENDA */}
        <div className="flex-grow w-full h-full bg-[#faf7f0] sm:rounded-xl lg:rounded-2xl shadow-inner overflow-hidden flex flex-col lg:flex-row relative">
          
          {/* RILEGATURA CENTRALE CON ANELLI (Solo su Schermi Grandi lg+) */}
          <div className="hidden lg:flex absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 z-30 flex-col justify-evenly items-center pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-black/[0.06] via-black/20 to-black/[0.06]" />
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-black/30" />
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-2.5 rounded-full bg-gradient-to-r from-[#5a554c] via-[#e6dec8] to-[#5a554c] shadow-[0_2px_4px_rgba(0,0,0,0.6)] border border-[#3d3933] z-10"
              />
            ))}
          </div>

          {/* =========================================================
              PAGINA SINISTRA: CALENDARIO (MENSILE & ANNUALE)
          ========================================================= */}
          <section
            className={`w-full lg:w-1/2 h-full p-4 sm:p-7 lg:pr-11 flex-col justify-between dot-paper overflow-y-auto ${
              mobilePage === 'calendar' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div>
              {/* Barra Superiore Sinistra */}
              <div className="flex items-center justify-between border-b border-[#e2dcd0] pb-3.5 mb-5">
                <div className="flex items-center gap-2">
                  <BookOpen size={17} className="text-[#8c734b] shrink-0" />
                  <span className="text-[11px] uppercase tracking-[0.22em] text-[#787065] font-semibold truncate">
                    Calendario Perpetuo
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#efeae0] p-1 rounded-lg border border-[#dfd8c8]">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      viewMode === 'month'
                        ? 'bg-[#2c2a29] text-[#faf7f0] shadow-xs'
                        : 'text-[#6e675f] hover:text-[#2c2a29]'
                    }`}
                  >
                    Mese
                  </button>
                  <button
                    onClick={() => setViewMode('year')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      viewMode === 'year'
                        ? 'bg-[#2c2a29] text-[#faf7f0] shadow-xs'
                        : 'text-[#6e675f] hover:text-[#2c2a29]'
                    }`}
                  >
                    Anno
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-2 py-1 rounded-md text-xs font-medium text-[#8c734b] hover:bg-black/5 transition-colors flex items-center gap-1"
                    title="Torna a Oggi"
                  >
                    <RotateCcw size={12} />
                    <span>Oggi</span>
                  </button>
                </div>
              </div>

              {/* Selettore Mese / Anno */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-[#2c2a29] capitalize tracking-tight">
                    {viewMode === 'month'
                      ? format(currentMonthDate, 'MMMM', { locale: it })
                      : format(currentMonthDate, 'yyyy', { locale: it })}
                  </h2>
                  {viewMode === 'month' && (
                    <button
                      onClick={() => setViewMode('year')}
                      className="text-xs sm:text-sm font-serif-luxury italic text-[#8c734b] hover:underline mt-0.5 block"
                    >
                      Anno {format(currentMonthDate, 'yyyy')} ▾
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() =>
                      setCurrentMonthDate(
                        viewMode === 'month'
                          ? subMonths(currentMonthDate, 1)
                          : subYears(currentMonthDate, 1)
                      )
                    }
                    className="p-2.5 rounded-full border border-[#dcd4c6] bg-[#faf7f0] hover:bg-[#efeae0] text-[#2c2a29] transition-all active:scale-95"
                    aria-label="Precedente"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentMonthDate(
                        viewMode === 'month'
                          ? addMonths(currentMonthDate, 1)
                          : addYears(currentMonthDate, 1)
                      )
                    }
                    className="p-2.5 rounded-full border border-[#dcd4c6] bg-[#faf7f0] hover:bg-[#efeae0] text-[#2c2a29] transition-all active:scale-95"
                    aria-label="Successivo"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* GRIGLIA MENSILE */}
              {viewMode === 'month' ? (
                <div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 text-center">
                    {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(
                      (dayName, idx) => (
                        <div
                          key={dayName}
                          className={`text-[10px] sm:text-[11px] uppercase tracking-widest font-semibold py-1 ${
                            idx >= 5 ? 'text-[#b56357]' : 'text-[#8c8275]'
                          }`}
                        >
                          {dayName}
                        </div>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {calendarDays.map((day) => {
                      const dKey = format(day, 'yyyy-MM-dd');
                      const isSelected = dKey === selectedDateStr;
                      const isCurrentMonth = isSameMonth(day, currentMonthDate);
                      const isDayToday = isToday(day);

                      const dayTasks = tasks[dKey] || [];
                      const hasNote = (notes[dKey] || '').trim().length > 0;
                      const hasTasks = dayTasks.length > 0;

                      return (
                        <button
                          key={dKey}
                          onClick={() => handleSelectDay(day)}
                          className={`
                            relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-150 border
                            ${
                              !isCurrentMonth
                                ? 'opacity-30 border-transparent text-[#8c8275]'
                                : 'border-[#e6dfd3]'
                            }
                            ${
                              isSelected
                                ? 'bg-[#2c2a29] text-[#faf7f0] border-[#2c2a29] shadow-md scale-[1.03] z-10'
                                : 'bg-[#faf7f0]/85 hover:bg-[#efeae0] active:bg-[#e5dec9] text-[#2c2a29]'
                            }
                            ${
                              isDayToday && !isSelected
                                ? 'ring-2 ring-[#c5a059] border-transparent font-bold'
                                : ''
                            }
                          `}
                        >
                          <span className="font-serif-luxury text-sm sm:text-lg leading-none">
                            {format(day, 'd')}
                          </span>

                          {/* Indicatori presenza Task o Note */}
                          <div className="flex items-center gap-1 mt-1 h-1.5">
                            {hasTasks && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-[#c5a059]' : 'bg-[#1a2a44]'
                                }`}
                              />
                            )}
                            {hasNote && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-[#e8b4b4]' : 'bg-[#b56357]'
                                }`}
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* GRIGLIA ANNUALE (12 MESI) */
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 my-2">
                  {monthsOfYear.map((m) => {
                    const isCurrentM = isSameMonth(m, currentMonthDate);
                    return (
                      <button
                        key={m.toString()}
                        onClick={() => {
                          setCurrentMonthDate(m);
                          setViewMode('month');
                        }}
                        className={`p-3.5 sm:p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isCurrentM
                            ? 'bg-[#2c2a29] text-[#faf7f0] border-[#2c2a29] shadow-md'
                            : 'bg-[#faf7f0]/90 hover:bg-[#efeae0] border-[#e2dcd0] text-[#2c2a29]'
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest opacity-60">
                          {format(m, 'MM')}
                        </span>
                        <span className="font-serif-luxury text-base sm:text-xl capitalize font-semibold mt-1 truncate">
                          {format(m, 'MMMM', { locale: it })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legenda e Stato sul fondo della pagina sinistra */}
            <div className="mt-6 pt-3.5 border-t border-[#e2dcd0] flex items-center justify-between text-xs text-[#787065]">
              <div className="flex items-center gap-3.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1a2a44]" /> To-Do
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#b56357]" /> Diario
                </span>
              </div>
              <span className="font-serif-luxury italic">
                Tocca un giorno per aprire il foglio
              </span>
            </div>
          </section>

          {/* =========================================================
              PAGINA DESTRA: FOGLIO DEL GIORNO (TO-DO + DIARIO A RIGHE)
          ========================================================= */}
          <section
            className={`w-full lg:w-1/2 h-full flex-col justify-between bg-[#faf7f0] relative overflow-hidden ${
              mobilePage === 'notebook' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Header Fisso del Foglio Destro */}
            <header className="px-4 sm:px-8 lg:pl-12 pt-4 sm:pt-6 pb-3.5 border-b-2 border-[#2c2a29]/80 bg-[#faf7f0] z-10 shrink-0">
              <div className="flex items-center justify-between gap-2">
                {/* Navigazione rapida Giorno Precedente / Successivo */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <button
                    onClick={() => shiftSelectedDay('prev')}
                    className="p-1.5 sm:p-2 rounded-lg border border-[#dcd4c6] hover:bg-[#efeae0] text-[#2c2a29] active:scale-95 transition-all"
                    title="Giorno precedente"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[#8c734b] font-semibold">
                      <CalendarIcon size={12} />
                      <span>{format(selectedDate, 'MMMM yyyy', { locale: it })}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#2c2a29] capitalize leading-tight">
                      {format(selectedDate, 'EEEE d', { locale: it })}
                    </h1>
                  </div>

                  <button
                    onClick={() => shiftSelectedDay('next')}
                    className="p-1.5 sm:p-2 rounded-lg border border-[#dcd4c6] hover:bg-[#efeae0] text-[#2c2a29] active:scale-95 transition-all"
                    title="Giorno successivo"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Selettore Modalità Foglio (Tutto / Solo Task / Solo Note) */}
                <div className="flex items-center gap-1 bg-[#efeae0] p-1 rounded-lg border border-[#dfd8c8] shrink-0">
                  {(
                    [
                      { id: 'all', label: 'Tutto' },
                      { id: 'tasks', label: 'Task' },
                      { id: 'notes', label: 'Note' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setRightTab(tab.id)}
                      className={`px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        rightTab === tab.id
                          ? 'bg-[#2c2a29] text-[#faf7f0] shadow-2xs'
                          : 'text-[#6e675f] hover:text-[#2c2a29]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* Corpo Scorrevole su Carta a Righe */}
            <div className="flex-grow overflow-y-auto ruled-paper px-4 sm:px-8 lg:pl-12 pl-9 sm:pl-14 pt-3 pb-6 flex flex-col gap-5">
              
              {/* SEZIONE 1: TO-DO LIST */}
              {(rightTab === 'all' || rightTab === 'tasks') && (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#787065] font-semibold flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#c5a059]" />
                      <span>To-Do List</span>
                    </h3>
                    {currentTasks.length > 0 && (
                      <span className="text-xs font-serif-luxury italic text-[#787065]">
                        {completedCount}/{currentTasks.length} completati
                      </span>
                    )}
                  </div>

                  {/* Input Aggiunta Task */}
                  <form
                    onSubmit={handleAddTask}
                    className="flex items-center gap-2 border-b border-dashed border-[#c7bfb1] pb-1 mb-2"
                  >
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Aggiungi un task a penna..."
                      className="w-full bg-transparent outline-none font-pen text-2xl sm:text-[26px] text-[#1a2a44] placeholder:text-[#a39b8b]"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-lg bg-[#2c2a29] text-[#faf7f0] hover:bg-[#403d3b] active:scale-95 transition-all shrink-0"
                      aria-label="Aggiungi Task"
                    >
                      <Plus size={16} />
                    </button>
                  </form>

                  {/* Elenco Task */}
                  <ul className="divide-y divide-transparent">
                    {currentTasks.length === 0 ? (
                      <li className="font-pen text-xl sm:text-2xl text-[#a39b8b] italic leading-[36px]">
                        Nessuna attività in programma per oggi...
                      </li>
                    ) : (
                      currentTasks.map((task) => (
                        <li
                          key={task.id}
                          className="group flex items-center justify-between min-h-[36px] py-0.5 hover:bg-black/[0.02] rounded px-1 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => toggleTask(selectedDateStr, task.id)}
                            className="flex items-center gap-3 text-left flex-grow py-0.5"
                          >
                            <span
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
                                task.completed
                                  ? 'bg-[#1a2a44] border-[#1a2a44] text-white'
                                  : 'border-[#8c8275] bg-[#faf7f0]'
                              }`}
                            >
                              {task.completed && <Check size={13} />}
                            </span>
                            <span
                              className={`font-pen text-2xl sm:text-[26px] leading-[32px] transition-all break-words ${
                                task.completed
                                  ? 'line-through text-[#9e9587]'
                                  : 'text-[#1a2a44]'
                              }`}
                            >
                              {task.text}
                            </span>
                          </button>

                          {/* Bottone cestino sempre visibile su mobile e all'hover su desktop */}
                          <button
                            type="button"
                            onClick={() => deleteTask(selectedDateStr, task.id)}
                            className="opacity-70 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 text-[#b56357] hover:bg-[#b56357]/10 rounded transition-all shrink-0"
                            aria-label="Elimina task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}

              {/* SEZIONE 2: DIARIO & APPUNTI LIBERI SU RIGHE */}
              {(rightTab === 'all' || rightTab === 'notes') && (
                <div className="flex-grow flex flex-col w-full">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#787065] font-semibold">
                      Foglio Appunti & Diario
                    </h3>
                    <span className="text-[11px] text-[#9e9587] italic font-serif-luxury">
                      Memoria automatica
                    </span>
                  </div>

                  <textarea
                    value={currentNote}
                    onChange={(e) => updateNote(selectedDateStr, e.target.value)}
                    placeholder="Scrivi qui appunti, pensieri o programmi della giornata..."
                    className={`w-full flex-grow resize-none outline-none bg-transparent font-pen text-2xl sm:text-[27px] text-[#1a2a44] placeholder:text-[#a39b8b] leading-[36px] select-text ${
                      rightTab === 'notes' ? 'min-h-[380px]' : 'min-h-[240px]'
                    }`}
                    spellCheck={false}
                  />
                </div>
              )}
            </div>

            {/* Footer Pagina Destra */}
            <footer className="px-4 sm:px-8 lg:pl-12 py-2.5 border-t border-[#e2dcd0] bg-[#faf7f0] flex items-center justify-between text-xs text-[#8c8275] font-serif-luxury italic shrink-0">
              <span>Taccuino Personale</span>
              <span>Giorno {format(selectedDate, 'DDD')} dell&apos;anno</span>
            </footer>
          </section>
        </div>

        {/* =========================================================
            BOTTOM DOCK MOBILE (Visibile solo su Smartphone/Piccoli Tablet)
        ========================================================= */}
        <nav className="lg:hidden flex items-center justify-around bg-[#1f1d1b] border-t border-[#332f2c] py-2 px-3 shrink-0 z-40">
          <button
            onClick={() => setMobilePage('notebook')}
            className={`flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-xs font-medium transition-all w-1/2 ${
              mobilePage === 'notebook'
                ? 'bg-[#c5a059] text-[#141413] font-semibold shadow-sm'
                : 'text-[#a39b8b] hover:text-white'
            }`}
          >
            <PenTool size={15} />
            <span>Foglio del Giorno</span>
          </button>

          <button
            onClick={() => setMobilePage('calendar')}
            className={`flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-xs font-medium transition-all w-1/2 ${
              mobilePage === 'calendar'
                ? 'bg-[#c5a059] text-[#141413] font-semibold shadow-sm'
                : 'text-[#a39b8b] hover:text-white'
            }`}
          >
            <CalendarIcon size={15} />
            <span>Calendario ({format(selectedDate, 'd MMM', { locale: it })})</span>
          </button>
        </nav>
      </div>
    </main>
  );
}