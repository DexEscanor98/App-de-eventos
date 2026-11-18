import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency } from '@/lib/utils';
import { UtensilsCrossed, CheckCircle2, Users, GlassWater } from 'lucide-react';
import Link from 'next/link';

export default async function MenusPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const menus = await prisma.menu.findMany({
    where: { tenantId },
    orderBy: { adultPrice: 'asc' },
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Menús y Banquetes
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Catálogo de platillos, bebidas incluidas, precios por adulto y menores
            </p>
          </div>
          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Cotizar con Menú</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => {
            const dishes = menu.includedDishes ? menu.includedDishes.split(',') : [];
            return (
              <div
                key={menu.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-premium transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Mínimo {menu.minGuests} pers.
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{menu.name}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{menu.description}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Incluye:
                    </p>
                    <ul className="space-y-1">
                      {dishes.slice(0, 5).map((dish, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="truncate">{dish.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {menu.includedDrinks && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-[11px] text-slate-600">
                      <GlassWater className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{menu.includedDrinks}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-slate-900">
                        {formatCurrency(menu.adultPrice)}
                      </span>
                      <span className="text-[10px] text-slate-400">/ adulto</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Niños: <strong className="text-slate-700">{formatCurrency(menu.childPrice)}</strong>
                    </span>
                  </div>

                  <Link
                    href={`/quotes/new?menuId=${menu.id}`}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors"
                  >
                    Seleccionar
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
