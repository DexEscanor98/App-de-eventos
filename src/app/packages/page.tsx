import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency } from '@/lib/utils';
import { Package as PackageIcon, CheckCircle2, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function PackagesPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const packages = await prisma.package.findMany({
    where: { tenantId },
    orderBy: { basePrice: 'asc' },
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Paquetes de Eventos
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configuraciones integrales para bodas, XV años y aniversarios
            </p>
          </div>
          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20"
          >
            <PackageIcon className="w-4 h-4" />
            <span>Crear Cotización con Paquete</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            let services: string[] = [];
            try {
              services = pkg.includedServices ? JSON.parse(pkg.includedServices) : [];
            } catch {
              services = pkg.includedServices ? pkg.includedServices.split(',') : [];
            }

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-premium transition-all p-6 flex flex-col justify-between relative"
              >
                {pkg.name === 'Premium' && (
                  <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    Más Completo
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{pkg.description}</p>

                  <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      {pkg.includedGuests} invitados
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {pkg.includedHours} horas de salón
                    </span>
                  </div>

                  <div className="mt-5 space-y-2">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Servicios Incluidos:
                    </p>
                    <ul className="space-y-1.5">
                      {services.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Inversión Base</span>
                    <span className="text-xl font-black text-slate-900">
                      {formatCurrency(pkg.basePrice)}
                    </span>
                  </div>
                  <Link
                    href={`/quotes/new?packageId=${pkg.id}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
                  >
                    Cotizar
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
