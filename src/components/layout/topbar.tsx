'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LogOut,
  Building,
  Sparkles,
  ChevronDown,
  Check,
  Wand2,
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { SessionUser } from '@/lib/auth';
import { AppleDynamicIslandHub } from '@/components/pwa/apple-dynamic-island-hub';
import { navigationItems } from './sidebar';

interface TopbarProps {
  user: SessionUser;
}

const DEMO_USERS = [
  { role: 'CLIENT', name: 'Juan Pérez Hernández', email: 'cliente@salonimperial.demo', label: '👤 Cliente VIP (Cotizar & Pagar)' },
  { role: 'ADMIN', name: 'Lic. Roberto Valdés', email: 'admin@salonimperial.demo', label: 'Admin (Total)' },
  { role: 'SALES', name: 'Mariana Silva', email: 'ventas@salonimperial.demo', label: 'Ventas (Cotizaciones)' },
  { role: 'CASHIER', name: 'Carlos Morales', email: 'caja@salonimperial.demo', label: 'Caja (Pagos)' },
  { role: 'COORDINATOR', name: 'Valeria Méndez', email: 'coordinador@salonimperial.demo', label: 'Coordinador (Operación)' },
  { role: 'SUPER_ADMIN', name: 'Super Admin Plataforma', email: 'superadmin@eventia.demo', label: 'Super Admin (SaaS)' },
];

export function Topbar({ user }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleFastSwitch = async (email: string) => {
    setSwitching(true);
    try {
      const res = await fetch('/api/auth/fast-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setDropdownOpen(false);
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          router.refresh();
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Error switching user', err);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Error logging out', err);
    }
  };

  return (
    <>
      <header className="no-print h-16 bg-white/75 backdrop-blur-2xl border-b border-white/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.05)]">
        {/* Left: Mobile Drawer Trigger + Apple Dynamic Island Status Pill */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-2xl bg-slate-900 text-white shadow-sm"
            aria-label="Abrir menú"
          >
            <MenuIcon className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-full text-xs font-medium shadow-md shadow-slate-900/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Building className="w-3.5 h-3.5 text-sky-400 hidden sm:inline" />
            <span className="font-semibold tracking-tight truncate max-w-[120px] sm:max-w-none">
              {user.tenantName || 'Salón Imperial'}
            </span>
          </div>
        </div>

        {/* Right Actions: Push Notifications + API Quotas + PWA Install + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hub Central: Notificaciones Push, Cuotas API, Errores de Red e Instalar PWA */}
          <AppleDynamicIslandHub />

          {/* Fast Action: Personalizar Cotización */}
          <Link
            href="/quotes/new"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Cotizar</span>
          </Link>

          {/* Demo User Switcher / Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 sm:pl-2.5 rounded-full bg-white/90 border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all text-left"
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest">
                  {user.role}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-black text-xs shadow-md overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline mr-1" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-72 apple-glass-card rounded-3xl shadow-2xl border border-white/90 py-2.5 z-50 animate-apple-in">
                <div className="px-4 py-2.5 border-b border-slate-200/60">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Rol activo: {user.role}
                  </span>
                </div>

                {/* Demo Switcher Quick Menu */}
                <div className="px-3 py-2.5 border-b border-slate-200/60">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1 px-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Cambio Rápido Demo (1-Click)
                  </p>
                  <div className="space-y-1">
                    {DEMO_USERS.map((demo) => {
                      const isCurrent = user.email.toLowerCase() === demo.email.toLowerCase();
                      return (
                        <button
                          key={demo.email}
                          disabled={switching || isCurrent}
                          onClick={() => handleFastSwitch(demo.email)}
                          className={`w-full text-left px-3 py-2 rounded-2xl text-xs flex items-center justify-between transition-all ${
                            isCurrent
                              ? 'bg-indigo-600 text-white font-semibold cursor-default shadow-sm'
                              : 'hover:bg-slate-100/80 text-slate-700'
                          }`}
                        >
                          <div className="truncate">
                            <p className="truncate text-[11px] leading-snug">{demo.label}</p>
                            <p className={`text-[10px] truncate ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {demo.email}
                            </p>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Logout */}
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sheet (Navegación Completa para Móvil / Tablet) */}
      {mobileMenuOpen && (
        <div className="no-print lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex animate-apple-in">
          <div className="w-72 bg-slate-950 text-white h-full p-5 flex flex-col justify-between overflow-y-auto shadow-2xl border-r border-white/10">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center font-black text-white">
                    E
                  </div>
                  <div>
                    <span className="font-black text-sm block leading-none">EVENTIA OS</span>
                    <span className="text-[10px] text-sky-400">Menú Móvil & Tablet</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                {navigationItems.map((entry, idx) => {
                  if ('category' in entry && entry.items) {
                    return (
                      <div key={idx} className="pt-3">
                        <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                          {entry.category}
                        </p>
                        {entry.items.map((sub) => {
                          const Icon = sub.icon;
                          const active = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium ${
                                active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  }
                  const item = entry as { name: string; href: string; icon: any };
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold ${
                        active ? 'bg-indigo-600 text-white' : 'text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}
