import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency } from '@/lib/utils';
import { UserCheck, Phone, Mail, Award, Clock } from 'lucide-react';

export default async function StaffPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const staff = await prisma.employee.findMany({
    where: { tenantId },
    orderBy: { roleCategory: 'asc' },
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Personal y Equipo Operativo
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Coordinadores, capitanes de meseros, cocineros, seguridad y limpieza
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {staff.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-100">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 leading-tight">{emp.name}</h3>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      {emp.roleCategory}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{emp.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Tarifa hora:</span>
                <span className="font-black text-slate-800 font-mono">
                  {formatCurrency(emp.hourlyWage)}/hr
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
