import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, Plus, Tag } from 'lucide-react';
import Link from 'next/link';

export default async function ServicesPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const services = await prisma.additionalService.findMany({
    where: { tenantId },
    orderBy: { price: 'asc' },
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Servicios Extras y Adicionales
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Decoración temática, centros de mesa, mesas de dulces, barra libre y personal
            </p>
          </div>
          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Agregar Extras a Cotización</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-premium transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{srv.name}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md flex-shrink-0 uppercase">
                    {srv.billingType === 'PER_PERSON' ? 'Por persona' : srv.billingType === 'PER_UNIT' ? 'Por unidad' : 'Precio Fijo'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tarifa</span>
                  <span className="text-base font-black text-slate-900">
                    {formatCurrency(srv.price)}
                  </span>
                  {srv.billingType === 'PER_PERSON' && (
                    <span className="text-[10px] text-slate-400 block">x cada invitado</span>
                  )}
                </div>
                <Link
                  href={`/quotes/new`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Agregar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
