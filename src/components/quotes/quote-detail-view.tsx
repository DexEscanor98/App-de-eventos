'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  BookmarkCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
  CreditCard,
  UserCheck,
  Download,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils';
import { buildOwnerWhatsAppUrl, saveLocalQuote } from '@/lib/local-db';

interface QuoteDetailViewProps {
  quote: any;
  businessSettings: any;
}

export function QuoteDetailView({ quote, businessSettings }: QuoteDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const badge = getStatusBadge(quote.status);
  const printParam = searchParams.get('print');
  const savedProfileParam = searchParams.get('saved_profile');

  // Asegurar que la cotización esté sincronizada en la Base Local del perfil del cliente
  useEffect(() => {
    saveLocalQuote({
      id: quote.id,
      folio: quote.folio,
      customerId: quote.customerId,
      customerName: quote.customer.name,
      customerPhone: quote.customer.phone,
      venueName: quote.venue.name,
      eventTypeName: quote.eventType.name,
      eventDate: new Date(quote.eventDate).toISOString().split('T')[0],
      startTime: quote.startTime,
      endTime: quote.endTime,
      adults: quote.adults,
      children: quote.children,
      estimatedBudget: quote.estimatedBudget || 0,
      total: quote.total,
      depositRequired: Math.round(quote.total * 0.3),
      status: quote.status,
      customItems: [],
      notes: quote.notes,
      pdfUrl: `/quotes/${quote.id}?print=pdf`,
      createdAt: quote.createdAt,
    });

    if (printParam === 'pdf') {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quote, printParam]);

  const handleConvert = async () => {
    if (
      !confirm(
        '¿Deseas convertir esta cotización en una Reservación formal? Se verificará la disponibilidad de salón y horario.'
      )
    ) {
      return;
    }

    setConverting(true);
    setError(null);

    try {
      const res = await fetch(`/api/quotes/${quote.id}/convert`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Error al convertir en reservación');
      }

      router.push(`/reservations/${data.reservation.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setConverting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const ownerWhatsappUrl = buildOwnerWhatsAppUrl({
    ownerWhatsapp: businessSettings?.whatsapp || businessSettings?.phone || '5215512345678',
    salonName: businessSettings?.commercialName || 'Salón Imperial',
    folio: quote.folio,
    customerName: quote.customer.name,
    customerPhone: quote.customer.phone,
    venueName: quote.venue.name,
    eventTypeName: quote.eventType.name,
    eventDate: formatDate(quote.eventDate, 'dd/MM/yyyy'),
    startTime: quote.startTime,
    endTime: quote.endTime,
    guests: quote.adults + quote.children,
    estimatedBudget: quote.estimatedBudget || 0,
    total: quote.total,
    deposit: Math.round(quote.total * 0.3),
    quoteId: quote.id,
    itemsSummary: (quote.items || []).map(
      (i: any) => `${i.quantity}x ${i.name} (${formatCurrency(i.total)})`
    ),
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar Navigation & Actions (Hidden on Print) */}
      <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Link
            href="/quotes"
            className="hover:text-indigo-600 flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cotizaciones</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-slate-900">{quote.folio}</span>
          <span>•</span>
          <Link
            href={`/customers/${quote.customerId}?tab=quotes`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Guardada en Perfil de {quote.customer.name}</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-full text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Descargar / Imprimir PDF</span>
          </button>

          <a
            href={ownerWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-full text-xs font-bold shadow-md shadow-[#25D366]/25 transition-all hover:-translate-y-0.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar PDF al WhatsApp del Dueño</span>
          </a>

          <Link
            href={`/checkout/mercadopago/${quote.id}?type=DEPOSIT`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#009EE3] hover:bg-[#0088c6] text-white rounded-full text-xs font-bold shadow-md shadow-[#009EE3]/25 transition-all hover:-translate-y-0.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pagar con Mercado Pago</span>
          </Link>

          {quote.status !== 'CONVERTED' ? (
            <button
              onClick={handleConvert}
              disabled={converting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {converting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Convertir a Reservación</span>
                </>
              )}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reservada</span>
            </span>
          )}
        </div>
      </div>

      {savedProfileParam && (
        <div className="no-print p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 animate-apple-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>¡Cotización guardada con éxito!</strong> Ya se encuentra archivada en el apartado{' '}
              <strong>&ldquo;Cotizaciones&rdquo;</strong> del perfil de{' '}
              <strong>{quote.customer.name}</strong> y lista para enviar en PDF por WhatsApp o pagar en Mercado Pago.
            </span>
          </div>
          <Link
            href={`/customers/${quote.customerId}?tab=quotes`}
            className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white font-bold whitespace-nowrap hover:bg-emerald-700 transition-colors"
          >
            Ver en Perfil del Cliente →
          </Link>
        </div>
      )}

      {error && (
        <div className="no-print p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <div>
            <p className="font-bold">No fue posible convertir la cotización</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Document / Printable Paper (Apple Clean Editorial Sheet) */}
      <div className="apple-glass-card rounded-[32px] p-8 md:p-12 print-page space-y-8">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              {businessSettings?.commercialName || 'SALÓN IMPERIAL'}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {businessSettings?.slogan || 'Eventos inolvidables y momentos mágicos'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {businessSettings?.address || 'Av. Paseo de la Reforma 450, Col. Juárez, CDMX'} •
              WhatsApp Dueño: {businessSettings?.whatsapp || businessSettings?.phone || '55 1234 5678'}
            </p>
          </div>

          <div className="sm:text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${badge.className}`}
            >
              {badge.label}
            </span>
            <h2 className="text-2xl font-black font-mono text-slate-900">{quote.folio}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Emisión: {formatDate(quote.createdAt, "d 'de' MMMM, yyyy")}
            </p>
          </div>
        </div>

        {/* Info Grid: Cliente & Evento + Presupuesto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50/80 p-6 rounded-3xl border border-slate-200/60 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Datos del Cliente
            </span>
            <h4 className="font-extrabold text-slate-900 text-sm">{quote.customer.name}</h4>
            <p className="text-slate-600 mt-0.5">Teléfono: {quote.customer.phone}</p>
            {quote.customer.email && (
              <p className="text-slate-500">Email: {quote.customer.email}</p>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Detalles del Evento Personalizado
            </span>
            <div className="space-y-1 text-slate-700">
              <p>
                <strong>Celebración:</strong> {quote.eventType.name} •{' '}
                <strong>Espacio:</strong> {quote.venue.name}
              </p>
              <p>
                <strong>Fecha:</strong> {formatDate(quote.eventDate, "EEEE d 'de' MMMM, yyyy")}
              </p>
              <p>
                <strong>Horario:</strong> {quote.startTime} - {quote.endTime} (
                {quote.durationHours} hrs + {quote.extraHours} hrs extra)
              </p>
              <p>
                <strong>Invitados:</strong> {quote.adults} adultos{' '}
                {quote.children > 0 ? `+ ${quote.children} niños` : ''}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" />
              Presupuesto Registrado
            </span>
            <p className="text-lg font-black text-slate-900 mt-1">
              {quote.estimatedBudget && quote.estimatedBudget > 0
                ? formatCurrency(quote.estimatedBudget)
                : formatCurrency(quote.total)}
            </p>
            <span className="text-[10px] text-slate-400">
              Respaldado en Base de Datos Local
            </span>
          </div>
        </div>

        {/* Snapshot Items Table */}
        <div className="overflow-hidden border border-slate-200/80 rounded-3xl">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Concepto / Servicio Personalizado</th>
                <th className="py-3.5 px-3 text-center">Cantidad</th>
                <th className="py-3.5 px-4 text-right">Precio Unitario</th>
                <th className="py-3.5 px-5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {quote.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-5">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    {item.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center font-medium text-slate-700">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600 font-mono">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3.5 px-5 text-right font-black text-slate-900 font-mono">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary Breakdown */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-2">
          <div className="text-xs text-slate-500 max-w-md space-y-2">
            <p className="font-bold text-slate-800">Términos Comerciales y Formas de Pago:</p>
            <p className="leading-relaxed">
              • Cotización válida por 15 días naturales y archivada en el perfil del cliente.
              <br />
              • Puedes apartar tu fecha abonando el 30% mediante <strong>Mercado Pago Checkout Pro</strong> o enviando este documento en PDF al WhatsApp del dueño del salón.
            </p>
          </div>

          <div className="w-full sm:w-80 space-y-2.5 text-xs border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-800">{formatCurrency(quote.subtotal)}</span>
            </div>

            {quote.discountTotal > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Descuento aplicado:</span>
                <span>-{formatCurrency(quote.discountTotal)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900">INVERSIÓN TOTAL:</span>
              <span className="text-2xl font-black text-indigo-600 font-mono">
                {formatCurrency(quote.total)}
              </span>
            </div>

            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-900 flex justify-between">
              <span>Anticipo 30% requerido:</span>
              <strong className="font-black">{formatCurrency(quote.total * 0.3)}</strong>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <span className="font-bold text-slate-700 block mb-1">
              Observaciones Personalizadas:
            </span>
            <p>{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
