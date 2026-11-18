import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt, TrendingUp, ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const [expenses, events] = await Promise.all([
    prisma.expense.findMany({
      where: { tenantId },
      include: { event: true, supplier: true },
      orderBy: { date: 'desc' },
    }),
    prisma.event.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        expenses: true,
        payments: { where: { deletedAt: null } },
      },
      orderBy: { eventDate: 'desc' },
    }),
  ]);

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalRevenue = events.reduce((acc, ev) => acc + ev.totalAmount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const marginPercentage = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Control de Gastos y Utilidades
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Costos operativos de banquete, personal, música y cálculo de utilidad neta
            </p>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ingresos Totales por Eventos
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Venta bruta contratada</span>
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Gastos Operativos Totales
            </span>
            <p className="text-2xl font-black text-rose-600 mt-1 font-mono">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Proveedores, insumos y staff</span>
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Utilidad Neta Calculada
            </span>
            <p className="text-2xl font-black text-indigo-600 mt-1 font-mono">
              {formatCurrency(netProfit)}
            </p>
            <p className="text-[11px] text-indigo-600 font-bold mt-1">
              Margen promedio: {marginPercentage}%
            </p>
          </div>
        </div>

        {/* Profitability Per Event */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Margen de Utilidad por Evento (Ingresos - Gastos)
          </h3>

          <div className="space-y-4">
            {events.slice(0, 6).map((evt) => {
              const evtCost = evt.expenses.reduce((acc, exp) => acc + exp.amount, 0);
              const evtProfit = evt.totalAmount - evtCost;
              const evtMargin = evt.totalAmount > 0 ? Math.round((evtProfit / evt.totalAmount) * 100) : 0;

              return (
                <div key={evt.id} className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">{evt.folio}</span>
                      <span className="font-bold text-slate-900 text-sm">{evt.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Fecha: {formatDate(evt.eventDate, 'd MMM yyyy')}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Ingreso</span>
                      <strong className="text-slate-900 font-mono">{formatCurrency(evt.totalAmount)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Gastos</span>
                      <strong className="text-rose-600 font-mono">-{formatCurrency(evtCost)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Utilidad</span>
                      <strong className="text-emerald-600 font-mono text-sm">{formatCurrency(evtProfit)}</strong>
                    </div>
                    <div className="hidden sm:block">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold rounded-lg text-xs border border-indigo-100">
                        {evtMargin}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
