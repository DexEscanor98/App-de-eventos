'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Database,
  UserPlus,
  PlusCircle,
} from 'lucide-react';

const DEMO_USERS = [
  {
    role: 'CLIENTE VIP (PORTAL CLIENTE)',
    email: 'cliente@salonimperial.demo',
    pass: 'Cliente123!',
    name: 'Juan Pérez Hernández',
    badge: 'Cotizar, WhatsApp & Pagar',
    badgeColor: 'bg-teal-500/25 text-teal-300 border-teal-400/40',
  },
  {
    role: 'ADMINISTRADOR',
    email: 'admin@salonimperial.demo',
    pass: 'Admin123!',
    name: 'Lic. Roberto Valdés',
    badge: 'Acceso Total',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  {
    role: 'VENTAS & COTIZACIONES',
    email: 'ventas@salonimperial.demo',
    pass: 'Ventas123!',
    name: 'Mariana Silva',
    badge: 'Personalizador & WhatsApp',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    role: 'CAJA & MERCADO PAGO',
    email: 'caja@salonimperial.demo',
    pass: 'Caja123!',
    name: 'Carlos Morales',
    badge: 'Cobros & Saldos',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  {
    role: 'COORDINADOR',
    email: 'coordinador@salonimperial.demo',
    pass: 'Coord123!',
    name: 'Valeria Méndez',
    badge: 'Operación de Eventos',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    role: 'SUPER ADMIN SAAS',
    email: 'superadmin@eventia.demo',
    pass: 'Super123!',
    name: 'Super Admin Plataforma',
    badge: 'Multi-Tenant Global',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@salonimperial.demo');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      router.push(data.redirectUrl || '/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = async (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/fast-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error('Error al ingresar con perfil demo');
      }

      router.push(data.redirectUrl || '/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070e] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Apple VisionOS Ambient Orbs */}
      <div className="absolute -top-24 left-1/4 w-[650px] h-[550px] bg-indigo-600/25 rounded-full blur-[130px] pointer-events-none animate-apple-float" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 animate-apple-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] bg-gradient-to-tr from-indigo-600 via-purple-500 to-sky-400 text-white shadow-2xl shadow-indigo-500/40 mb-4 animate-apple-float">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="px-3 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold uppercase tracking-widest text-sky-300">
            Cupertino OS Edition
          </span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">
          EVENTIA <span className="font-light text-sky-400">PRO</span>
        </h1>
        <p className="mt-1.5 text-xs text-slate-400">
          Arquitectura Multi-Tenant • Cotizaciones Personalizadas • API Mercado Pago
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 space-y-5 animate-apple-in">
        {/* NUEVAS TARJETAS DESTACADAS: REGISTRAR SALÓN (DUEÑO) O REGISTRARSE COMO CLIENTE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/register?mode=owner"
            className="p-4 rounded-3xl bg-gradient-to-br from-indigo-600/25 via-indigo-950/60 to-slate-900/90 border border-indigo-500/40 hover:border-sky-400 text-white shadow-xl flex items-center gap-3.5 group transition-all hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300 block">
                ¿Eres Nuevo Dueño?
              </span>
              <span className="text-xs font-black text-white block leading-snug">
                Registrar Mi Salón de Eventos →
              </span>
            </div>
          </Link>

          <Link
            href="/register?mode=client"
            className="p-4 rounded-3xl bg-gradient-to-br from-emerald-600/25 via-emerald-950/60 to-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 text-white shadow-xl flex items-center gap-3.5 group transition-all hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                ¿Eres Nuevo Cliente?
              </span>
              <span className="text-xs font-black text-white block leading-snug">
                Crear Cuenta y Cotizar Evento →
              </span>
            </div>
          </Link>
        </div>

        <div className="apple-dark-island py-8 px-6 sm:px-10 rounded-[32px] space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario Tradicional */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Apple ID / Correo Corporativo o Cliente
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all placeholder:text-slate-500"
                  placeholder="admin@salonimperial.demo"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all placeholder:text-slate-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-bold py-3.5 px-5 rounded-2xl shadow-xl shadow-indigo-500/30 active:scale-[0.99] transition-all text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Desbloqueando entorno...</span>
                </>
              ) : (
                <>
                  <span>Entrar a EVENTIA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Selección Rápida 1-Click */}
          <div className="pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Cuentas Demo Precargadas (1-Click)
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <Database className="w-3 h-3" />
                Base Local Lista
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectDemo(user.email, user.pass)}
                  className="text-left p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-sky-400/50 hover:bg-white/[0.08] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white group-hover:text-sky-300 transition-colors">
                      {user.role}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${user.badgeColor}`}
                    >
                      1-Click
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 truncate font-medium">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                    {user.email} • Pass: {user.pass}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
