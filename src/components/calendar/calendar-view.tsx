'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Building2,
  Clock,
  Users,
  CreditCard,
  MapPin,
  X,
  ExternalLink,
  Plus,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, getStatusBadge } from '@/lib/utils';

interface CalendarEventItem {
  id: string;
  folio: string;
  title: string;
  customerName: string;
  customerPhone?: string;
  venueId: string;
  venueName: string;
  eventTypeName: string;
  eventColor: string;
  eventDate: string | Date;
  startTime: string;
  endTime: string;
  adults: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  type: 'RESERVATION' | 'EVENT';
}

interface CalendarViewProps {
  initialEvents: CalendarEventItem[];
  venues: { id: string; name: string }[];
}

export function CalendarView({ initialEvents, venues }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVenueFilter, setSelectedVenueFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Filtrar eventos por salón
  const filteredEvents = useMemo(() => {
    if (selectedVenueFilter === 'ALL') return initialEvents;
    return initialEvents.filter((e) => e.venueId === selectedVenueFilter);
  }, [initialEvents, selectedVenueFilter]);

  // Obtener eventos para un día en particular
  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((e) => {
      const eDate = typeof e.eventDate === 'string' ? parseISO(e.eventDate) : e.eventDate;
      return isSameDay(eDate, day);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Agenda del Salón
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calendario operativo de fechas apartadas, eventos confirmados y disponibilidad
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Salón */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedVenueFilter}
              onChange={(e) => setSelectedVenueFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Espacios</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 capitalize min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Hoy
          </button>

          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Fecha</span>
          </Link>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/80 text-center py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
          <span>Dom</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[600px]">
          {daysInMonth.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`p-2 transition-colors min-h-[110px] flex flex-col justify-between ${
                  isCurrentToday ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrentToday
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-700'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-extrabold text-indigo-600">
                      {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
                    </span>
                  )}
                </div>

                {/* Day events pills */}
                <div className="space-y-1 overflow-y-auto max-h-24 scrollbar-none flex-1">
                  {dayEvents.map((ev) => {
                    const badge = getStatusBadge(ev.status);
                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="p-1.5 rounded-lg border text-left cursor-pointer transition-all bg-white hover:border-indigo-400 shadow-sm text-[11px] border-slate-200/90"
                      >
                        <div className="flex items-center gap-1 font-bold text-slate-800 truncate">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: ev.eventColor || '#6366f1' }}
                          />
                          <span className="truncate">{ev.title}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                          <span className="truncate">{ev.venueName}</span>
                          <span className="font-mono text-slate-600">{ev.startTime}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Quick Inspection Modal / Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: selectedEvent.eventColor || '#6366f1' }}
                />
                <h3 className="font-bold text-slate-900 text-sm">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {selectedEvent.folio}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    getStatusBadge(selectedEvent.status).className
                  }`}
                >
                  {getStatusBadge(selectedEvent.status).label}
                </span>
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Espacio: <strong>{selectedEvent.venueName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Fecha: <strong>{format(parseISO(selectedEvent.eventDate as string), "d 'de' MMMM, yyyy", { locale: es })}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Horario: <strong>{selectedEvent.startTime} - {selectedEvent.endTime}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Cliente: <strong>{selectedEvent.customerName}</strong> ({selectedEvent.adults} personas)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-700 block uppercase font-semibold">Total Evento</span>
                  <span className="text-sm font-bold text-indigo-950 font-mono">
                    {formatCurrency(selectedEvent.totalAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-indigo-700 block uppercase font-semibold">Saldo Pendiente</span>
                  <span className="text-sm font-bold text-rose-600 font-mono">
                    {formatCurrency(selectedEvent.balanceAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  Cerrar
                </button>
                <Link
                  href={
                    selectedEvent.type === 'RESERVATION'
                      ? `/reservations/${selectedEvent.id}`
                      : `/events`
                  }
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <span>Abrir Ficha Completa</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
