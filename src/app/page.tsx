'use client';

import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
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
  Sparkles,
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
  const [newTaskText, setNewTaskText] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Inizializzazione sicura lato client per superare il prerender di Next.js 16
  useEffect(() => {
    setCurrentMonthDate(new Date());
    setIsMounted(true);
  }, []);

  if (!isMounted || !currentMonthDate) {
    return <div className="h-screen w-screen bg-[#141413]" />;
  }

  const selectedDate = parseISO(selectedDateStr);
  const currentNote = notes[selectedDateStr] || '';
  const currentTasks = tasks[selectedDateStr] || [];

  // Calcolo griglia calendario (partenza dal Lunedì)
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
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDateStr(format(today, 'yyyy-MM-dd'));
    setCurrentMonthDate(today);
    setViewMode('month');
  };

  const completedCount = currentTasks.filter((t) => t.completed).length;

  return (
    <main className="min-h-screen w-full bg-[#141413] flex items-center justify-center p-2 sm:p-4 md:p-8 select-none">
      {/* COPERTINA IN PELLE DELL'AGENDA */}
      <div className="w-full max-w-[1320px] min-h-[94vh] md:h-[90vh] bg-[#1f1d1b] rounded-2xl md:rounded-3xl p-2 sm:p-3 md:p-5 shadow-[0_30px_70px_rgba(0,0,0,0.85)] border border-[#332f2c] relative flex flex-col">
        
        {/* Effetto cucitura perimetrale sulla pelle */}
        <div className="hidden md:block absolute inset-2.5 rounded-2xl border border-dashed border-[#4a433d]/50 pointer-events-none" />

        {/* Segnalibro Rosso in alto */}
        <div className="hidden md:block absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-12 bg-gradient-to-b from-[#8b1e1e] to-[#5e1111] shadow-md z-30 rounded-t-sm" />

        {/* DOPPIA PAGINA INTERNA */}
        <div className="flex-grow w-full h-full bg-[#faf7f0] rounded-xl md:rounded-2xl shadow-inner overflow-hidden flex flex-col md:flex-row relative">
          
          {/* RILEGATURA CENTRALE & ANELLI (Visibile su Desktop) */}
          <div className="hidden md:flex absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-14 z-30 flex-col justify-evenly items-center pointer-events-none">
            {/* Ombra profonda della piega del libro */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent" />
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-black/25" />
            {/* Anelli metallici */}
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-9 h-3 rounded-full bg-gradient-to-r from-[#5a554c] via-[#e6dec8] to-[#5a554c] shadow-[0_2px_4px_rgba(0,0,0,0.6)] border border-[#3d3933] z-10"
              />
            ))}
          </div>

          {/* =========================================================
              PAGINA SINISTRA: CALENDARIO (MENSILE & ANNUALE)
          ========================================================= */}
          <section className="w-full md:w-1/2 md:h-full p-5 sm:p-8 md:pr-12 flex flex-col justify-between dot-paper border-b md:border-b-0 border-[#e0d8c8] relative">
            <div>
              {/* Top Bar Sinistra */}
              <div className="flex items-center justify-between border-b border-[#e2dcd0] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-[#8c734b]" />
                  <span className="text-xs uppercase tracking-[0.25em] text-[#787065] font-semibold">
                    Archivio Temporale
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#efeae0] p-1 rounded-lg border border-[#dfd8c8]">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      viewMode === 'month'
                        ? 'bg-[#2c2a29] text-[#faf7f0] shadow-sm'
                        : 'text-[#6e675f] hover:text-[#2c2a29]'
                    }`}
                  >
                    Mese
                  </button>
                  <button
                    onClick={() => setViewMode('year')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      viewMode === 'year'
                        ? 'bg-[#2c2a29] text-[#faf7f0] shadow-sm'
                        : 'text-[#6e675f] hover:text-[#2c2a29]'
                    }`}
                  >
                    Anno
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-2.5 py-1 rounded-md text-xs font-medium text-[#8c734b] hover:bg-black/5 transition-colors"
                    title="Vai a oggi"
                  >
                    Oggi
                  </button>
                </div>
              </div>

              {/* Intestazione Mese/Anno con Frecce di Navigazione */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-[#2c2a29] capitalize tracking-tight">
                    {viewMode === 'month'
                      ? format(currentMonthDate, 'MMMM', { locale: it })
                      : format(currentMonthDate, 'yyyy', { locale: it })}
                  </h2>
                  {viewMode === 'month' && (
                    <p className="text-sm font-serif-luxury italic text-[#8c8275] mt-0.5">
                      Anno {format(currentMonthDate, 'yyyy')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentMonthDate(
                        viewMode === 'month'
                          ? subMonths(currentMonthDate, 1)
                          : subYears(currentMonthDate, 1)
                      )
                    }
                    className="p-2.5 rounded-full border border-[#dcd4c6] bg-[#faf7f0] hover:bg-[#efeae0] text-[#2c2a29] transition-all shadow-2xs active:scale-95"
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
                    className="p-2.5 rounded-full border border-[#dcd4c6] bg-[#faf7f0] hover:bg-[#efeae0] text-[#2c2a29] transition-all shadow-2xs active:scale-95"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* GRIGLIA MENSILE */}
              {viewMode === 'month' ? (
                <div>
                  {/* Giorni della settimana */}
                  <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
                    {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(
                      (dayName, idx) => (
                        <div
                          key={dayName}
                          className={`text-[11px] uppercase tracking-widest font-semibold py-1 ${
                            idx >= 5 ? 'text-[#b56357]' : 'text-[#8c8275]'
                          }`}
                        >
                          {dayName}
                        </div>
                      )
                    )}
                  </div>

                  {/* Celle dei Giorni */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
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
                            group relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-150 border
                            ${
                              !isCurrentMonth
                                ? 'opacity-30 border-transparent text-[#8c8275]'
                                : 'border-[#e6dfd3]'
                            }
                            ${
                              isSelected
                                ? 'bg-[#2c2a29] text-[#faf7f0] border-[#2c2a29] shadow-md scale-[1.03] z-10'
                                : 'bg-[#faf7f0]/80 hover:bg-[#efeae0] text-[#2c2a29]'
                            }
                            ${
                              isDayToday && !isSelected
                                ? 'ring-2 ring-[#c5a059] border-transparent font-bold'
                                : ''
                            }
                          `}
                        >
                          <span className="font-serif-luxury text-base sm:text-lg leading-none">
                            {format(day, 'd')}
                          </span>

                          {/* Indicatori presenza Note o Task */}
                          <div className="flex items-center gap-1 mt-1.5 h-1.5">
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
                <div className="grid grid-cols-3 gap-3 sm:gap-4 my-2">
                  {monthsOfYear.map((m) => {
                    const isCurrentM = isSameMonth(m, currentMonthDate);
                    return (
                      <button
                        key={m.toString()}
                        onClick={() => {
                          setCurrentMonthDate(m);
                          setViewMode('month');
                        }}
                        className={`p-4 sm:p-6 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isCurrentM
                            ? 'bg-[#2c2a29] text-[#faf7f0] border-[#2c2a29] shadow-md'
                            : 'bg-[#faf7f0]/90 hover:bg-[#efeae0] border-[#e2dcd0] text-[#2c2a29]'
                        }`}
                      >
                        <span className="text-xs uppercase tracking-widest opacity-60">
                          {format(m, 'MM')}
                        </span>
                        <span className="font-serif-luxury text-lg sm:text-xl capitalize font-semibold mt-1">
                          {format(m, 'MMMM', { locale: it })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Pagina Sinistra (Riepilogo rapido) */}
            <div className="mt-6 pt-4 border-t border-[#e2dcd0] flex items-center justify-between text-xs text-[#787065]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1a2a44]" /> To-Do
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#b56357]" /> Appunti
                </span>
              </div>
              <span className="font-serif-luxury italic">
                Memoria locale attiva
              </span>
            </div>
          </section>

          {/* =========================================================
              PAGINA DESTRA: FOGLIO DEL GIORNO (TO-DO + TACCUINO A RIGHE)
          ========================================================= */}
          <section className="w-full md:w-1/2 md:h-full flex flex-col justify-between ruled-paper p-5 sm:p-8 md:pl-14 relative overflow-y-auto">
            {/* Intestazione Data del Foglio Destro */}
            <div>
              <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#2c2a29]/80 pb-4 mb-6 bg-[#faf7f0]/90 backdrop-blur-xs pl-8 -ml-2 pr-2 pt-1 rounded-t-lg">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8c734b] font-semibold">
                    <CalendarIcon size={13} />
                    <span>Pagina Giornaliera</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-[#2c2a29] capitalize mt-1">
                    {format(selectedDate, 'EEEE d', { locale: it })}
                  </h1>
                  <p className="text-sm font-serif-luxury italic text-[#6e675f] capitalize">
                    {format(selectedDate, 'MMMM yyyy', { locale: it })}
                  </p>
                </div>

                {/* Selettore vista interna (Tutto / Solo Task / Solo Diario) */}
                <div className="flex items-center gap-1 mt-3 sm:mt-0 self-start sm:self-end bg-[#efeae0] p-1 rounded-lg border border-[#dfd8c8]">
                  {(
                    [
                      { id: 'all', label: 'Completa' },
                      { id: 'tasks', label: 'To-Do' },
                      { id: 'notes', label: 'Diario' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setRightTab(tab.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        rightTab === tab.id
                          ? 'bg-[#2c2a29] text-[#faf7f0]'
                          : 'text-[#6e675f] hover:text-[#2c2a29]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </header>

              {/* SEZIONE 1: TO-DO LIST CON FONT A PENNA */}
              {(rightTab === 'all' || rightTab === 'tasks') && (
                <div className="mb-6 pl-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-[#787065] font-semibold flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#c5a059]" />
                      Priorità & Task Operativi
                    </h3>
                    {currentTasks.length > 0 && (
                      <span className="text-xs font-serif-luxury italic text-[#787065]">
                        {completedCount} di {currentTasks.length} completati
                      </span>
                    )}
                  </div>

                  {/* Form Aggiunta Task */}
                  <form
                    onSubmit={handleAddTask}
                    className="flex items-center gap-2 border-b border-dashed border-[#c7bfb1] pb-1.5 mb-3"
                  >
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Scrivi un nuovo task a penna e premi Invio..."
                      className="w-full bg-transparent outline-none font-pen text-2xl text-[#1a2a44] placeholder:text-[#a39b8b]"
                    />
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg bg-[#2c2a29] text-[#faf7f0] hover:bg-[#403d3b] transition-colors shrink-0"
                      title="Aggiungi Task"
                    >
                      <Plus size={16} />
                    </button>
                  </form>

                  {/* Lista dei Task */}
                  <ul className="space-y-1 max-h-[210px] overflow-y-auto pr-1">
                    {currentTasks.length === 0 ? (
                      <li className="font-pen text-xl text-[#a39b8b] italic py-1">
                        Nessun task programmato per questa giornata...
                      </li>
                    ) : (
                      currentTasks.map((task) => (
                        <li
                          key={task.id}
                          className="group flex items-center justify-between py-0.5 hover:bg-black/[0.02] rounded px-1 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleTask(selectedDateStr, task.id)
                            }
                            className="flex items-center gap-3 text-left flex-grow"
                          >
                            <span
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
                                task.completed
                                  ? 'bg-[#1a2a44] border-[#1a2a44] text-white'
                                  : 'border-[#8c8275] hover:border-[#1a2a44] bg-[#faf7f0]'
                              }`}
                            >
                              {task.completed && <Check size={13} />}
                            </span>
                            <span
                              className={`font-pen text-2xl leading-tight transition-all ${
                                task.completed
                                  ? 'line-through text-[#9e9587]'
                                  : 'text-[#1a2a44]'
                              }`}
                            >
                              {task.text}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteTask(selectedDateStr, task.id)
                            }
                            className="opacity-0 group-hover:opacity-100 p-1 text-[#b56357] hover:bg-[#b56357]/10 rounded transition-all"
                            title="Elimina task"
                          >
                            <Trash2 size={15} />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}

              {/* SEZIONE 2: FOGLIO A RIGHE PER NOTE LIBERE & DIARIO */}
              {(rightTab === 'all' || rightTab === 'notes') && (
                <div className="flex-grow flex flex-col pl-8">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-[#787065] font-semibold">
                      Taccuino Appunti & Pensieri
                    </h3>
                    <span className="text-[11px] text-[#9e9587]">
                      Salvataggio istantaneo
                    </span>
                  </div>

                  <textarea
                    value={currentNote}
                    onChange={(e) =>
                      updateNote(selectedDateStr, e.target.value)
                    }
                    placeholder="Annota qui appunti, idee, orari o riflessioni del giorno..."
                    className={`w-full resize-none outline-none bg-transparent font-pen text-[26px] text-[#1a2a44] placeholder:text-[#a39b8b] leading-[36px] select-text ${
                      rightTab === 'notes' ? 'min-h-[420px]' : 'min-h-[260px]'
                    }`}
                    spellCheck={false}
                  />
                </div>
              )}
            </div>

            {/* Numero Pagina / Footer Destro */}
            <div className="pl-8 pt-2 border-t border-[#e2dcd0]/70 flex items-center justify-between text-xs text-[#8c8275] font-serif-luxury italic">
              <span>Agenda Personale</span>
              <span>Giorno {format(selectedDate, 'DDD')} dell&apos;anno</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}