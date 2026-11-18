import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShieldCheck, Building2, Users, Calendar, DollarSign, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function SuperAdminPage() {
  const user = await getCurrentUser();

  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          users: true,
          customers: true,
          events: true,
          quotes: true,
          reservations: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Métricas SaaS Simuladas
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'ACTIVE').length;
  const mrrEstimated = tenants.reduce((acc, t) => {
    if (t.plan === 'BUSINESS') return acc + 2999;
    if (t.plan === 'PRO') return acc + 1899;
    return acc + 999;
  }, 0);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-extrabold uppercase">
                Panel Global SaaS
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Supervisión de Empresas (Tenants)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Control multiempresa, aislamiento de datos, suscripciones e infraestructura global
            </p>
          </div>
        </div>

        {/* Global SaaS KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Empresas Activas
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {activeTenants} / {totalTenants}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% operativas</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              MRR SaaS Estimado
            </span>
            <p className="text-2xl font-black text-indigo-600 mt-1 font-mono">
              {formatCurrency(mrrEstimated)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Ingresos recurrentes mensuales</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Clientes en Plataforma
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {tenants.reduce((acc, t) => acc + t._count.customers, 0)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Total de comensales y solicitantes</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Eventos Administrados
            </span>
            <p className="text-2xl font-black text-purple-600 mt-1 font-mono">
              {tenants.reduce((acc, t) => acc + t._count.events, 0)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Eventos en producción</p>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Directorio de Negocios Registrados</h3>
            <p className="text-xs text-slate-500">Aislamiento por TenantID verificado por backend</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Empresa / Salón</th>
                  <th className="py-3.5 px-4">Slug / Dominio</th>
                  <th className="py-3.5 px-4 text-center">Plan</th>
                  <th className="py-3.5 px-4 text-center">Usuarios</th>
                  <th className="py-3.5 px-4 text-center">Clientes</th>
                  <th className="py-3.5 px-4 text-center">Eventos</th>
                  <th className="py-3.5 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{t.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{t.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {t.slug}.eventia.demo
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          t.plan === 'BUSINESS'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : t.plan === 'PRO'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.plan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {t._count.users}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {t._count.customers}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {t._count.events}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
