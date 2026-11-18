import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils';
import Link from 'next/link';
import {
  PartyPopper,
  Calendar,
  Building2,
  Users,
  Clock,
  ChevronRight,
  Plus,
} from 'lucide-react';

export default async function EventsPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const events = await prisma.event.findMany({
    where: { tenantId, deletedAt: null },
    include: {
      customer: true,
      venue: true,
      eventType: true,
      payments: { where: { deletedAt: null } },
      staff: { include: { employee: true } },
    },
    orderBy: { eventDate: 'desc' },
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Eventos en Operación
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Control logístico, cronograma, estado de realización y balance final
            </p>
          </div>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Ver Agenda General</span>
          </Link>
        </div>

        {/* Events Grid / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const badge = getStatusBadge(evt.status);
            const totalPaid = evt.payments.reduce((acc, p) => acc + p.amount, 0) || evt.paidAmount;
            const balance = Math.max(0, evt.totalAmount - totalPaid);

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-premium transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-indigo-600">
                        {evt.folio}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{evt.name}</h3>
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.customer.name} ({evt.adults} invitados)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.venue.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(evt.eventDate, 'd MMM yyyy')} • {evt.startTime} - {evt.endTime}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {formatCurrency(evt.totalAmount)}
                    </span>
                    {balance > 0 ? (
                      <span className="text-[10px] text-rose-600 font-semibold block">
                        Saldo: {formatCurrency(balance)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        Liquidado
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/reservations/${evt.reservationId || evt.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                  >
                    Detalles
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
