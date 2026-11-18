import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency } from '@/lib/utils';
import { Boxes, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';

export default async function InventoryPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const items = await prisma.inventoryItem.findMany({
    where: { tenantId },
    orderBy: { category: 'asc' },
  });

  const totalPieces = items.reduce((acc, i) => acc + i.totalQuantity, 0);
  const totalDamaged = items.reduce((acc, i) => acc + i.damagedQuantity, 0);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Control de Inventario y Activos
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Mobiliario, mantelería, vajilla, cristalería, equipo de audio e insumos
            </p>
          </div>
        </div>

        {/* Inventory Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Artículos Registrados
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{items.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">En catálogo activo</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Piezas en Almacén
            </span>
            <p className="text-2xl font-black text-indigo-600 mt-1 font-mono">{totalPieces}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Unidades totales operativas</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Piezas Dañadas / Reparación
            </span>
            <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{totalDamaged}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Para reposición o compostura</p>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Artículo / Categoría</th>
                  <th className="py-3.5 px-4 text-center">Total</th>
                  <th className="py-3.5 px-4 text-center">Disponible</th>
                  <th className="py-3.5 px-4 text-center">En Uso</th>
                  <th className="py-3.5 px-4 text-center">Dañado</th>
                  <th className="py-3.5 px-5 text-right">Costo Reposición</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-900 block">{it.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                        {it.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                      {it.totalQuantity} {it.unit}s
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 font-mono">
                      {it.availableQuantity}
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-slate-600 font-mono">
                      {it.inUseQuantity}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-rose-600 font-mono">
                      {it.damagedQuantity > 0 ? it.damagedQuantity : '-'}
                    </td>

                    <td className="py-3.5 px-5 text-right font-black text-slate-900 font-mono">
                      {formatCurrency(it.unitCost)}
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
