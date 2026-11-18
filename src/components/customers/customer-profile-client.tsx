'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet,
  CreditCard,
  Plus,
  ArrowLeft,
  MessageCircle,
  Download,
  Wallet,
  Calendar,
  Sparkles,
  CheckCircle2,
  Building2,
  Camera,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils';
import {
  buildOwnerWhatsAppUrl,
  getCustomerLocalQuotes,
  LocalQuoteRecord,
} from '@/lib/local-db';
import { ProfilePhotoPicker } from '@/components/profile/profile-photo-picker';
import { triggerPushNotification } from '@/lib/api-resilience';

interface CustomerProfileClientProps {
  customer: any;
  businessSettings: any;
  initialTab?: string;
  highlightQuoteId?: string;
}

export function CustomerProfileClient({
  customer,
  businessSettings,
  initialTab = 'quotes',
  highlightQuoteId,
}: CustomerProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'quotes' | 'payments' | 'events'>(
    initialTab === 'payments' ? 'payments' : initialTab === 'events' ? 'events' : 'quotes'
  );
  const [localQuotes, setLocalQuotes] = useState<LocalQuoteRecord[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(customer.avatarUrl || null);
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);

  const handleSaveNewAvatar = async (newDataUrl: string | null) => {
    setCurrentAvatar(newDataUrl);
    try {
      await fetch('/api/profile/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customer.id, avatarUrl: newDataUrl }),
      });
      await triggerPushNotification({
        title: 'Foto de Perfil Actualizada',
        body: `Se guardó la nueva foto de perfil de ${customer.name}.`,
        category: 'SYSTEM',
      });
    } catch {
      // ignore error
    }
  };

  useEffect(() => {
    setLocalQuotes(getCustomerLocalQuotes(customer.id));
  }, [customer.id]);

  // Combinar cotizaciones de SQLite con cualquier respaldo en LocalStorage sin duplicar
  const dbQuoteIds = new Set((customer.quotes || []).map((q: any) => q.id));
  const extraLocalQuotes = localQuotes.filter((lq) => !dbQuoteIds.has(lq.id));

  const totalInvoiced =
    customer.events.reduce((acc: number, ev: any) => acc + ev.totalAmount, 0) ||
    customer.reservations.reduce((acc: number, res: any) => acc + res.totalAmount, 0);
  const totalPaid = customer.payments.reduce((acc: number, p: any) => acc + p.amount, 0);
  const pendingBalance = Math.max(0, totalInvoiced - totalPaid);

  const ownerWhatsapp =
    businessSettings?.whatsapp || businessSettings?.phone || '5215512345678';

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-14">
      {/* Breadcrumb Navigation & Client Portal Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/venues"
            className="hover:text-indigo-600 flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Explorar Salones y Mapas GPS</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Mi Portal de Cliente ({customer.name})</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-3.5 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Paso 1: Cotiza • Paso 2: Envía por WhatsApp al Dueño • Paso 3: Paga con Mercado Pago</span>
        </div>
      </div>

      {/* Apple Profile Hero Card */}
      <div className="apple-glass-card rounded-[32px] p-7 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-indigo-500/30 ring-4 ring-white">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={customer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                customer.name.charAt(0)
              )}
            </div>
            <button
              type="button"
              onClick={() => setPhotoEditorOpen(!photoEditorOpen)}
              className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white shadow-lg transition-all"
              title="Cambiar foto (Selfie o Galería)"
            >
              <Camera className="w-3.5 h-3.5 text-sky-400" />
            </button>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Portal del Cliente
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 text-[10px] font-extrabold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                WhatsApp Real Verificado
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {customer.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp: <strong className="text-slate-700">{customer.whatsapp || customer.phone}</strong>
              </span>
              {customer.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  {customer.email}
                </span>
              )}
              {customer.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  {customer.address}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setPhotoEditorOpen(!photoEditorOpen)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
            <span>{photoEditorOpen ? 'Cerrar Cámara' : 'Selfie / Cambiar Foto'}</span>
          </button>

          <Link
            href={`/quotes/new?customerId=${customer.id}`}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-full text-xs font-extrabold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Personalizar Nueva Cotización</span>
          </Link>
        </div>
      </div>

      {/* Panel Desplegable para Tomarse una Selfie o Subir Foto desde el Perfil */}
      {photoEditorOpen && (
        <div className="apple-glass-card rounded-3xl p-6 animate-apple-in">
          <ProfilePhotoPicker
            value={currentAvatar}
            onChange={handleSaveNewAvatar}
            userName={customer.name}
            label={`Actualizar Foto de Perfil de ${customer.name} (Selfie en Vivo o Subir de Galería)`}
          />
        </div>
      )}

      {/* 4 Apple KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="apple-glass-card p-5 rounded-3xl">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Cotizaciones en Perfil
          </span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {customer.quotes.length + extraLocalQuotes.length}
          </p>
          <span className="text-[11px] text-slate-500">Guardadas con PDF listo</span>
        </div>

        <div className="apple-glass-card p-5 rounded-3xl">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Total Contratado
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(totalInvoiced)}
          </p>
          <span className="text-[11px] text-slate-500">En eventos confirmados</span>
        </div>

        <div className="apple-glass-card p-5 rounded-3xl">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Total Abonado
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatCurrency(totalPaid)}
          </p>
          <span className="text-[11px] text-slate-500">Pagos y Mercado Pago</span>
        </div>

        <div className="apple-glass-card p-5 rounded-3xl">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Saldo Pendiente
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {formatCurrency(pendingBalance)}
          </p>
          <span className="text-[11px] text-slate-500">Por liquidar</span>
        </div>
      </div>

      {/* Segmented Control Tabs (Apple Style) */}
      <div className="inline-flex p-1.5 rounded-full apple-glass-card">
        <button
          type="button"
          onClick={() => setActiveTab('quotes')}
          className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'quotes'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Mis Cotizaciones ({customer.quotes.length + extraLocalQuotes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Historial de Pagos ({customer.payments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'events'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Reservaciones y Eventos ({customer.events.length})</span>
        </button>
      </div>

      {/* APARTADO 1: COTIZACIONES DEL CLIENTE (CON PDF, WHATSAPP DUEÑO Y MERCADO PAGO) */}
      {activeTab === 'quotes' && (
        <div className="space-y-4 animate-apple-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Apartado de Cotizaciones Personalizadas
              </h2>
              <p className="text-xs text-slate-500">
                Desde aquí puedes descargar tu PDF, enviarlo al WhatsApp del dueño del salón o pagar en línea con Mercado Pago.
              </p>
            </div>
          </div>

          {customer.quotes.length === 0 && extraLocalQuotes.length === 0 ? (
            <div className="apple-glass-card rounded-3xl p-12 text-center space-y-3">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                Aún no tienes cotizaciones guardadas en tu perfil
              </p>
              <Link
                href={`/quotes/new?customerId=${customer.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Mi Primera Cotización Personalizada</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {customer.quotes.map((q: any) => {
                const badge = getStatusBadge(q.status);
                const isHighlighted = highlightQuoteId === q.id;
                const waUrl = buildOwnerWhatsAppUrl({
                  ownerWhatsapp,
                  salonName: businessSettings?.commercialName || 'Salón Imperial',
                  folio: q.folio,
                  customerName: customer.name,
                  customerPhone: customer.phone,
                  venueName: q.venue?.name || 'Salón',
                  eventTypeName: q.eventType?.name || 'Evento',
                  eventDate: formatDate(q.eventDate, 'dd/MM/yyyy'),
                  startTime: q.startTime,
                  endTime: q.endTime,
                  guests: q.adults + q.children,
                  estimatedBudget: q.estimatedBudget || 0,
                  total: q.total,
                  deposit: Math.round(q.total * 0.3),
                  quoteId: q.id,
                });

                return (
                  <div
                    key={q.id}
                    className={`apple-glass-card rounded-3xl p-6 flex flex-col justify-between space-y-5 transition-all ${
                      isHighlighted
                        ? 'ring-2 ring-indigo-500 shadow-xl'
                        : 'hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-slate-900">
                            {q.folio}
                          </span>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(q.createdAt, 'd MMM yyyy')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/60 text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                            {q.venue?.name} • {q.eventType?.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Fecha Evento: <strong>{formatDate(q.eventDate, 'd MMM yyyy')}</strong> ({q.adults + q.children} inv.)
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Total Cotizado
                          </span>
                          <span className="text-lg font-black text-slate-900">
                            {formatCurrency(q.total)}
                          </span>
                        </div>
                      </div>

                      {q.estimatedBudget > 0 && (
                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5 text-indigo-500" />
                            Presupuesto registrado:
                          </span>
                          <strong className="text-slate-800">
                            {formatCurrency(q.estimatedBudget)}
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* Botones de Acción de la Cotización en el Perfil */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp al Dueño</span>
                        </a>

                        <Link
                          href={`/checkout/mercadopago/${q.id}?type=DEPOSIT`}
                          className="py-2.5 px-3 rounded-2xl bg-[#009EE3] hover:bg-[#0088c6] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pagar (Mercado Pago)</span>
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/quotes/${q.id}?print=pdf`}
                          className="py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Descargar PDF</span>
                        </Link>

                        <Link
                          href={`/quotes/${q.id}`}
                          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Ver Detalle Completo →</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* APARTADO 2: HISTORIAL DE PAGOS */}
      {activeTab === 'payments' && (
        <div className="apple-glass-card rounded-3xl p-6 space-y-4 animate-apple-in">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Pagos y Abonos Registrados ({customer.payments.length})</span>
          </h3>

          {customer.payments.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No registra pagos hasta el momento. Puedes pagar cualquier cotización con Mercado Pago.
            </p>
          ) : (
            <div className="space-y-2.5">
              {customer.payments.map((p: any) => (
                <div
                  key={p.id}
                  className="p-4 bg-white/90 rounded-2xl border border-slate-200/70 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900">
                        {p.folio}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                        {p.paymentMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {formatDate(p.paymentDate, 'd MMM yyyy')} • {p.reference || 'Abono confirmado'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600">
                      +{formatCurrency(p.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APARTADO 3: RESERVACIONES Y EVENTOS */}
      {activeTab === 'events' && (
        <div className="apple-glass-card rounded-3xl p-6 space-y-4 animate-apple-in">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Eventos Confirmados ({customer.events.length})</span>
          </h3>

          {customer.events.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              Aún no tiene eventos confirmados.
            </p>
          ) : (
            <div className="space-y-2.5">
              {customer.events.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-4 bg-white/90 rounded-2xl border border-slate-200/70 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-sm text-slate-900">{ev.name}</p>
                    <p className="text-xs text-slate-500">
                      {ev.venue?.name} • {formatDate(ev.eventDate, 'd MMM yyyy')} ({ev.startTime} - {ev.endTime})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 block">
                      {formatCurrency(ev.totalAmount)}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      Pagado: {formatCurrency(ev.paidAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
