import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils';
import Link from 'next/link';
import {
  BookmarkCheck,
  Calendar,
  Building2,
  Users,
  CreditCard,
  ChevronRight,
  Plus,
} from 'lucide-react';

export default async function ReservationsPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const reservations = await prisma.reservation.findMany({
    where: { tenantId },
    include: {
      customer: true,
      venue: true,
      eventType: true,
      payments: { where: { deletedAt: null } },
    },
    orderBy: { eventDate: 'desc' },
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Reservaciones Confirmadas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Control de fechas apartadas, eventos programados, cobranza y contratos
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/calendar"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Ver en Agenda</span>
            </Link>
            <Link
              href="/quotes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Cotización / Reserva</span>
            </Link>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Folio / Fecha</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Espacio / Horario</th>
                  <th className="py-3.5 px-4">Inversión</th>
                  <th className="py-3.5 px-4">Pagado</th>
                  <th className="py-3.5 px-4">Saldo Pendiente</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                      No hay reservaciones registradas.
                    </td>
                  </tr>
                ) : (
                  reservations.map((r) => {
                    const badge = getStatusBadge(r.status);
                    const paid = r.payments.reduce((acc, p) => acc + p.amount, 0) || r.paidAmount;
                    const balance = Math.max(0, r.totalAmount - paid);

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <Link
                            href={`/reservations/${r.id}`}
                            className="font-mono font-bold text-indigo-600 hover:underline block"
                          >
                            {r.folio}
                          </Link>
                          <span className="text-[11px] text-slate-500">
                            {formatDate(r.eventDate, 'd MMM yyyy')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{r.customer.name}</span>
                          <span className="text-[11px] text-slate-400">{r.customer.phone}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">{r.venue.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {r.startTime} - {r.endTime}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          {formatCurrency(r.totalAmount)}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                          {formatCurrency(paid)}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          {balance > 0 ? (
                            <span className="font-black text-rose-600">{formatCurrency(balance)}</span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              Liquidado
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/reservations/${r.id}`}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition-colors"
                            >
                              Gestionar
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
