import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { Truck, Phone, MessageSquare, Tag, Plus } from 'lucide-react';

export default async function SuppliersPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const suppliers = await prisma.supplier.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Proveedores Externos
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Directorio de aliados en alimentos, audio, flores, fotografía y seguridad
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-premium transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    <p className="text-xs text-indigo-600 font-medium">{s.company}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {s.serviceCategory}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.phone}</span>
                  </div>
                  {s.costNotes && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.costNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              {s.notes && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  {s.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
