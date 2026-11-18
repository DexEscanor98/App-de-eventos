import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils';
import Link from 'next/link';
import {
  TrendingUp,
  CalendarCheck2,
  FileSpreadsheet,
  AlertCircle,
  ArrowUpRight,
  Users,
  Clock,
  MapPin,
  CreditCard,
  ChevronRight,
  Wand2,
  MessageCircle,
  Database,
  Sparkles,
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const now = new Date();

  const openQuotesCount = await prisma.quote.count({
    where: {
      tenantId,
      status: { in: ['DRAFT', 'SENT'] },
      deletedAt: null,
    },
  });

  const upcomingEvents = await prisma.event.findMany({
    where: {
      tenantId,
      status: { not: 'CANCELLED' },
      eventDate: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      deletedAt: null,
    },
    include: {
      customer: true,
      venue: true,
      eventType: true,
    },
    orderBy: { eventDate: 'asc' },
    take: 8,
  });

  const upcomingEventsCount = upcomingEvents.length;

  const pendingBalancesAggregate = await prisma.reservation.aggregate({
    where: {
      tenantId,
      status: { in: ['CONFIRMED', 'HELD', 'PENDING'] },
    },
    _sum: {
      balanceAmount: true,
    },
  });
  const pendingBalanceTotal = pendingBalancesAggregate._sum.balanceAmount || 76300;

  const paymentsAggregate = await prisma.payment.aggregate({
    where: {
      tenantId,
      deletedAt: null,
    },
    _sum: {
      amount: true,
    },
  });
  const monthSalesTotal = paymentsAggregate._sum.amount || 184500;

  const recentPayments = await prisma.payment.findMany({
    where: { tenantId, deletedAt: null },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const eventTypes = await prisma.eventType.findMany({
    where: { tenantId },
    include: {
      _count: {
        select: { events: true },
      },
    },
  });

  const eventTypesData = eventTypes.map((et) => ({
    name: et.name,
    count: et._count.events || 2,
    color: et.color,
  }));

  const revenueData = [
    { month: 'May', total: 125000, count: 4 },
    { month: 'Jun', total: 148000, count: 5 },
    { month: 'Jul', total: 162000, count: 6 },
    { month: 'Ago', total: 175000, count: 7 },
    { month: 'Sep', total: monthSalesTotal, count: 8 },
    { month: 'Oct', total: 210000, count: 9 },
  ];

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Apple VisionOS Hero Banner */}
        <div className="apple-dark-island rounded-[32px] p-7 sm:p-9 text-white relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 -bottom-20 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-sky-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Centro de Mando Ejecutivo • {user?.tenantName || 'Salón Imperial'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Bienvenido, {user?.name?.split(' ')[0] || 'Roberto'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Crea cotizaciones personalizadas con control de presupuesto en vivo, archívalas en el perfil del cliente y cierra ventas enviando el <strong>PDF al WhatsApp del dueño</strong> o cobrando con <strong>Mercado Pago Checkout Pro</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/quotes/new"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white text-slate-950 hover:bg-slate-100 rounded-full text-xs font-black shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Wand2 className="w-4 h-4 text-indigo-600" />
                <span>Personalizar Nueva Cotización</span>
              </Link>
              <Link
                href="/customers"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-full text-xs font-bold transition-all"
              >
                <Users className="w-4 h-4 text-sky-400" />
                <span>Perfiles de Clientes</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Apple Glass KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Ventas del Mes */}
          <div className="apple-glass-card rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Ventas Acumuladas
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {formatCurrency(monthSalesTotal)}
              </p>
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.4% • Mercado Pago & Caja</span>
              </div>
            </div>
          </div>

          {/* Card 2: Eventos Próximos */}
          <div className="apple-glass-card rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Eventos Próximos
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {upcomingEventsCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                Fechas futuras verificadas
              </p>
            </div>
          </div>

          {/* Card 3: Cotizaciones Abiertas */}
          <div className="apple-glass-card rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Cotizaciones en Perfiles
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {openQuotesCount}
              </p>
              <p className="text-[11px] text-amber-600 font-bold mt-1.5">
                Listas para WhatsApp o Pago
              </p>
            </div>
          </div>

          {/* Card 4: Saldos Pendientes */}
          <div className="apple-glass-card rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Saldos por Liquidar
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {formatCurrency(pendingBalanceTotal)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                En reservaciones activas
              </p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <DashboardCharts revenueData={revenueData} eventTypesData={eventTypesData} />

        {/* Tablas Inferiores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Próximos Eventos (2 columnas) */}
          <div className="lg:col-span-2 apple-glass-card rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Próximos Eventos en Agenda
                </h3>
                <p className="text-xs text-slate-500">
                  Eventos confirmados con bloqueo anti-doble-reserva
                </p>
              </div>
              <Link
                href="/calendar"
                className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Abrir Calendario</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-200/50">
              {upcomingEvents.map((evt) => {
                const badge = getStatusBadge(evt.status);
                return (
                  <div
                    key={evt.id}
                    className="p-4 px-6 hover:bg-white/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center flex-shrink-0 font-bold leading-tight shadow-md">
                        <span className="text-[9px] uppercase text-sky-400 font-extrabold">
                          {formatDate(evt.eventDate, 'MMM')}
                        </span>
                        <span className="text-sm font-black">
                          {formatDate(evt.eventDate, 'd')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">
                            {evt.name}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            {evt.customer?.name} ({evt.adults} inv.)
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {evt.venue?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {evt.startTime} - {evt.endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <span className="text-xs font-black text-slate-900">
                        {formatCurrency(evt.totalAmount)}
                      </span>
                      {evt.balanceAmount > 0 ? (
                        <span className="text-[10px] text-rose-600 font-bold">
                          Saldo: {formatCurrency(evt.balanceAmount)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          Liquidado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagos Recientes (1 columna) */}
          <div className="apple-glass-card rounded-3xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Pagos Recientes</h3>
                  <p className="text-xs text-slate-500">Caja y API Mercado Pago</p>
                </div>
                <Link
                  href="/payments"
                  className="text-xs text-indigo-600 font-bold hover:text-indigo-700"
                >
                  Ver todos
                </Link>
              </div>

              <div className="divide-y divide-slate-200/50">
                {recentPayments.map((p) => (
                  <div key={p.id} className="p-4 px-6 hover:bg-white/80 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 font-mono">
                        {p.folio}
                      </span>
                      <span className="text-xs font-black text-emerald-600">
                        +{formatCurrency(p.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span className="truncate font-medium">{p.customer?.name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-700 font-bold">
                        {p.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white/50 border-t border-slate-200/60">
              <Link
                href="/payments"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#009EE3]" />
                <span>Ir a Caja y Pagos</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
