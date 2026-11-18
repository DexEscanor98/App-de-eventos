import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency } from '@/lib/utils';
import { Music2, Clock, Truck, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function EntertainmentPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const entertainments = await prisma.entertainment.findMany({
    where: { tenantId },
    orderBy: { price: 'asc' },
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Entretenimiento y Shows
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              DJs, grupos versátiles, mariachis, shows infantiles, pistas y cabinas 360°
            </p>
          </div>
          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20"
          >
            <Music2 className="w-4 h-4" />
            <span>Agregar a Cotización</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entertainments.map((ent) => (
            <div
              key={ent.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-premium transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{ent.name}</h3>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md flex-shrink-0">
                    {ent.durationHours} hrs
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {ent.description}
                </p>

                {ent.providerName && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Proveedor: <strong className="text-slate-700">{ent.providerName}</strong></span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tarifa Show</span>
                  <span className="text-base font-black text-slate-900">
                    {formatCurrency(ent.price)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    +{formatCurrency(ent.extraHourPrice)}/hr extra
                  </span>
                </div>
                <Link
                  href={`/quotes/new`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Cotizar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
