'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  FileSpreadsheet,
  BookmarkCheck,
  PartyPopper,
  Users,
  Building2,
  UtensilsCrossed,
  Package,
  Music2,
  Sparkles,
  CreditCard,
  Truck,
  UserCheck,
  Boxes,
  Receipt,
  BarChart3,
  Settings,
  ShieldAlert,
  ChevronRight,
  Database,
  MapPin,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole?: string;
  tenantName?: string;
  customerId?: string | null;
}

export const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', href: '/calendar', icon: Calendar },
  { name: 'Cotizaciones', href: '/quotes', icon: FileSpreadsheet },
  { name: 'Reservaciones', href: '/reservations', icon: BookmarkCheck },
  { name: 'Eventos', href: '/events', icon: PartyPopper },
  { name: 'Clientes & Perfiles', href: '/customers', icon: Users },
  {
    category: 'Catálogos & Mapas GPS',
    items: [
      { name: 'Salones y Mapas GPS', href: '/venues', icon: Building2 },
      { name: 'Menús y Banquetes', href: '/menus', icon: UtensilsCrossed },
      { name: 'Paquetes', href: '/packages', icon: Package },
      { name: 'Entretenimiento', href: '/entertainment', icon: Music2 },
      { name: 'Servicios Extras', href: '/services', icon: Sparkles },
    ],
  },
  {
    category: 'Finanzas & Operación',
    items: [
      { name: 'Pagos & Mercado Pago', href: '/payments', icon: CreditCard },
      { name: 'Proveedores', href: '/suppliers', icon: Truck },
      { name: 'Personal Operativo', href: '/staff', icon: UserCheck },
      { name: 'Inventario', href: '/inventory', icon: Boxes },
      { name: 'Gastos y Utilidad', href: '/expenses', icon: Receipt },
      { name: 'Reportes y Métricas', href: '/reports', icon: BarChart3 },
    ],
  },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export function getClientNavigationItems(customerId?: string | null) {
  const profileHref = customerId ? `/customers/${customerId}?tab=quotes` : '/customers';
  const quoteWizardHref = customerId ? `/quotes/new?customerId=${customerId}` : '/quotes/new';

  return [
    { name: 'Mi Perfil & Cotizaciones', href: profileHref, icon: Users },
    { name: 'Personalizar Cotización', href: quoteWizardHref, icon: Wand2 },
    { name: 'Disponibilidad y Agenda', href: '/calendar', icon: Calendar },
    {
      category: 'Explorar Salón y Catálogos',
      items: [
        { name: 'Salones y Ubicación GPS', href: '/venues', icon: Building2 },
        { name: 'Menús y Banquetes', href: '/menus', icon: UtensilsCrossed },
        { name: 'Paquetes de Evento', href: '/packages', icon: Package },
        { name: 'Música y Entretenimiento', href: '/entertainment', icon: Music2 },
        { name: 'Servicios Adicionales', href: '/services', icon: Sparkles },
      ],
    },
  ];
}

export function Sidebar({
  userRole = 'ADMIN',
  tenantName = 'Salón Imperial',
  customerId = null,
}: SidebarProps) {
  const pathname = usePathname();
  const isClient = userRole === 'CLIENT';
  const activeMenu = isClient ? getClientNavigationItems(customerId) : navigationItems;

  return (
    <>
      {/* Desktop Sidebar (PC / Laptop) */}
      <aside className="no-print hidden lg:flex w-64 bg-slate-950/95 backdrop-blur-2xl text-slate-200 flex-col h-screen border-r border-white/10 select-none shadow-2xl z-40 flex-shrink-0">
        {/* Apple-style Window Controls + Brand Header */}
        <div className="px-5 pt-4 pb-3.5 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-inner" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-inner" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-inner" />
            <span className="ml-auto text-[9px] font-semibold uppercase tracking-widest text-slate-500">
              PWA Ready
            </span>
          </div>

          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-sky-400 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              E
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tight text-white text-base leading-none">
                EVENTIA <span className="font-light text-xs text-sky-400">OS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 truncate max-w-[140px]">
                {tenantName}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs scrollbar-thin">
          {isClient && (
            <div className="mb-3 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-sky-500/15 border border-emerald-500/30">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-300 block">
                Portal VIP de Cliente
              </span>
              <span className="text-[11px] font-bold text-white block mt-0.5">
                Personaliza, envía por WhatsApp al dueño o paga en línea
              </span>
            </div>
          )}

          {activeMenu.map((entry, idx) => {
            if ('category' in entry && entry.items) {
              return (
                <div key={idx} className="pt-4 pb-1">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500/90 mb-1.5">
                    {entry.category}
                  </p>
                  <div className="space-y-0.5">
                    {entry.items.map((subItem) => {
                      const isActive =
                        pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                      const Icon = subItem.icon;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all duration-200 group',
                            isActive
                              ? 'bg-white/12 text-white shadow-sm backdrop-blur-md border border-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-4 h-4 transition-transform duration-200 group-hover:scale-110',
                              isActive
                                ? 'text-sky-400'
                                : 'text-slate-400 group-hover:text-slate-200'
                            )}
                          />
                          <span className="truncate">{subItem.name}</span>
                          {isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const item = entry as { name: string; href: string; icon: any };
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-sky-500/90 text-white shadow-lg shadow-indigo-500/25 border border-white/15'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white/[0.06] text-slate-300 group-hover:text-white'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}

          {userRole === 'SUPER_ADMIN' && (
            <div className="pt-4 border-t border-white/10 mt-4">
              <Link
                href="/super-admin"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-xs">SaaS Super Admin</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </Link>
            </div>
          )}
        </nav>

        {/* Footer: Local DB + PWA Status */}
        <div className="p-3 border-t border-white/10 bg-black/30">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <Database className="w-3 h-3 text-sky-400" />
              DB Local & PWA
            </span>
            <span className="font-mono text-[9px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
              v2.0
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile iOS Floating Bottom Tab Bar (Visible en teléfonos y tablets < lg) */}
      <nav className="no-print lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-slate-950/90 backdrop-blur-2xl border border-white/15 rounded-3xl px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.45)] flex items-center justify-around">
        <Link
          href={isClient && customerId ? `/customers/${customerId}?tab=quotes` : '/dashboard'}
          className={cn(
            'flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl text-[10px] font-bold transition-all',
            pathname === '/dashboard' || (isClient && pathname.startsWith('/customers'))
              ? 'text-sky-400'
              : 'text-slate-400'
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>{isClient ? 'Mi Perfil' : 'Inicio'}</span>
        </Link>

        <Link
          href="/calendar"
          className={cn(
            'flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl text-[10px] font-bold transition-all',
            pathname.startsWith('/calendar') ? 'text-sky-400' : 'text-slate-400'
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda</span>
        </Link>

        <Link
          href={isClient && customerId ? `/quotes/new?customerId=${customerId}` : '/quotes/new'}
          className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-500 to-sky-400 text-white shadow-lg shadow-indigo-500/40 active:scale-95 transition-transform"
        >
          <Wand2 className="w-5 h-5" />
        </Link>

        <Link
          href="/venues"
          className={cn(
            'flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl text-[10px] font-bold transition-all',
            pathname.startsWith('/venues') ? 'text-sky-400' : 'text-slate-400'
          )}
        >
          <MapPin className="w-4 h-4" />
          <span>Mapas</span>
        </Link>

        <Link
          href={isClient && customerId ? `/customers/${customerId}?tab=payments` : '/customers'}
          className={cn(
            'flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl text-[10px] font-bold transition-all',
            pathname.startsWith('/customers') ? 'text-sky-400' : 'text-slate-400'
          )}
        >
          <Users className="w-4 h-4" />
          <span>{isClient ? 'Pagos' : 'Clientes'}</span>
        </Link>
      </nav>
    </>
  );
}
