import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils';
import Link from 'next/link';
import {
  Plus,
  CreditCard,
  Download,
  UserCheck,
  Wand2,
  Wallet,
} from 'lucide-react';

export default async function QuotesPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const quotes = await prisma.quote.findMany({
    where: { tenantId, deletedAt: null },
    include: {
      customer: true,
      venue: true,
      eventType: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
              <Wand2 className="w-3.5 h-3.5" />
              Presupuestos, WhatsApp PDF & API Mercado Pago
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Cotizaciones y Presupuestos
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Todas las cotizaciones se guardan automáticamente en la Base Local y en el perfil de cada cliente
            </p>
          </div>
          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-full text-xs font-extrabold shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Personalizar Nueva Cotización</span>
          </Link>
        </div>

        {/* Quotes Apple Glass Table */}
        <div className="apple-glass-card rounded-[28px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-900/5 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-5">Folio / Fecha Evento</th>
                  <th className="py-4 px-4">Cliente & Perfil</th>
                  <th className="py-4 px-4">Espacio / Evento</th>
                  <th className="py-4 px-4">Presupuesto Cliente</th>
                  <th className="py-4 px-4">Total Cotizado</th>
                  <th className="py-4 px-4">Estado</th>
                  <th className="py-4 px-5 text-right">Opciones (PDF / Mercado Pago)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      No hay cotizaciones registradas. Crea la primera con el botón superior.
                    </td>
                  </tr>
                ) : (
                  quotes.map((q) => {
                    const badge = getStatusBadge(q.status);
                    return (
                      <tr key={q.id} className="hover:bg-white/90 transition-colors">
                        <td className="py-4 px-5">
                          <Link
                            href={`/quotes/${q.id}`}
                            className="font-mono font-black text-indigo-600 hover:underline text-xs"
                          >
                            {q.folio}
                          </Link>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                            Evento: {formatDate(q.eventDate, 'd MMM yyyy')}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          <Link
                            href={`/customers/${q.customerId}?tab=quotes`}
                            className="font-extrabold text-slate-900 hover:text-indigo-600 flex items-center gap-1"
                          >
                            <span>{q.customer.name}</span>
                            <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                          </Link>
                          <span className="text-[11px] text-slate-400">{q.customer.phone}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-800 block">{q.venue.name}</span>
                          <span className="text-[11px] text-slate-500">
                            {q.eventType.name} ({q.adults + q.children} inv.)
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          {q.estimatedBudget && q.estimatedBudget > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                              <Wallet className="w-3 h-3 text-indigo-600" />
                              {formatCurrency(q.estimatedBudget)}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Abierto</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-sm font-black text-slate-900">
                            {formatCurrency(q.total)}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            Anticipo 30%: {formatCurrency(q.total * 0.3)}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/quotes/${q.id}?print=pdf`}
                              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Descargar PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href={`/checkout/mercadopago/${q.id}?type=DEPOSIT`}
                              className="px-3 py-1.5 bg-[#009EE3] hover:bg-[#0088c6] text-white rounded-full font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-all"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Mercado Pago</span>
                            </Link>
                            <Link
                              href={`/quotes/${q.id}`}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-[11px] transition-colors"
                            >
                              Abrir
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
