import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatDate(date: Date | string | null | undefined, pattern: string = "d 'de' MMMM, yyyy"): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, pattern, { locale: es });
  } catch {
    return String(date);
  }
}

export function formatShortDate(date: Date | string | null | undefined): string {
  return formatDate(date, 'dd/MM/yyyy');
}

export function getStatusBadge(status: string): { label: string; className: string } {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'SIGNED':
    case 'PAID':
      return {
        label: status === 'CONFIRMED' ? 'Confirmado' : status === 'COMPLETED' ? 'Realizado' : status === 'SIGNED' ? 'Firmado' : status === 'PAID' ? 'Liquidado' : 'Activo',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
      };
    case 'PENDING':
    case 'HELD':
    case 'DRAFT':
    case 'ISSUED':
      return {
        label: status === 'PENDING' ? 'Pendiente' : status === 'HELD' ? 'Apartado' : status === 'DRAFT' ? 'Borrador' : 'Emitido',
        className: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
      };
    case 'SENT':
      return {
        label: 'Enviada',
        className: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20',
      };
    case 'CONVERTED':
      return {
        label: 'Convertida',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20',
      };
    case 'SCHEDULED':
      return {
        label: 'Programado',
        className: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20',
      };
    case 'CANCELLED':
    case 'REJECTED':
    case 'VOID':
      return {
        label: status === 'CANCELLED' ? 'Cancelado' : status === 'REJECTED' ? 'Rechazada' : 'Anulado',
        className: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
      };
    default:
      return {
        label: status || 'General',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}
