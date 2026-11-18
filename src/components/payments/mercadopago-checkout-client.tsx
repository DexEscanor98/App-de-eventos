'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  QrCode,
  Wallet,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Loader2,
  MessageCircle,
  Download,
  UserCheck,
  Calendar,
  MapPin,
  Receipt,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { buildOwnerWhatsAppUrl, saveLocalQuote } from '@/lib/local-db';

interface MercadoPagoCheckoutClientProps {
  quote: any;
  businessSettings: any;
  initialAmountType: 'DEPOSIT' | 'FULL';
  preferenceId: string;
}

export function MercadoPagoCheckoutClient({
  quote,
  businessSettings,
  initialAmountType,
  preferenceId,
}: MercadoPagoCheckoutClientProps) {
  const router = useRouter();
  const [amountType, setAmountType] = useState<'DEPOSIT' | 'FULL'>(initialAmountType);
  const [selectedMethod, setSelectedMethod] = useState<'CARD' | 'MP_WALLET' | 'SPEI'>('CARD');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(quote.customer?.name?.toUpperCase() || 'JUAN PEREZ');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [installments, setInstallments] = useState('1');
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const depositAmount = Math.round(quote.total * 0.3 * 100) / 100;
  const fullAmount = Math.round(quote.total * 100) / 100;
  const currentAmount = amountType === 'FULL' ? fullAmount : depositAmount;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      const methodLabel =
        selectedMethod === 'CARD'
          ? `Tarjeta Crédito/Débito (${installments}x MSI)`
          : selectedMethod === 'MP_WALLET'
          ? 'Dinero en Cuenta Mercado Pago'
          : 'Transferencia SPEI Inmediata';

      const res = await fetch('/api/payments/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote.id,
          action: 'CONFIRM_PAYMENT',
          amountType,
          paymentMethodDetail: methodLabel,
          cardLast4: cardNumber.slice(-4) || '4242',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el pago en Mercado Pago');
      }

      // Actualizar estado local en el navegador para el perfil del cliente
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
        depositRequired: depositAmount,
        status: 'CONVERTED',
        customItems: [],
        pdfUrl: `/quotes/${quote.id}?print=pdf`,
        createdAt: quote.createdAt,
      });

      setPaymentResult(data);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  const whatsappUrl = buildOwnerWhatsAppUrl({
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
    deposit: currentAmount,
    quoteId: quote.id,
    itemsSummary: [
      ...(quote.items || []).map((i: any) => `${i.name}: ${formatCurrency(i.total)}`),
      paymentResult ? `✅ PAGO APROBADO MERCADO PAGO (${paymentResult.mpReference}): ${formatCurrency(currentAmount)}` : '',
    ].filter(Boolean),
  });

  if (paymentResult) {
    return (
      <div className="min-h-screen apple-mesh-bg flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-xl w-full apple-glass-card rounded-[32px] p-8 sm:p-10 shadow-2xl border border-white/80 text-center space-y-6 animate-apple-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
            <CheckCircle2 className="w-11 h-11" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#009EE3]/10 text-[#009EE3] border border-[#009EE3]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Mercado Pago • Pago Aprobado
            </span>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              ¡Tu evento está reservado!
            </h1>
            <p className="text-sm text-slate-500">
              La cotización <strong className="text-slate-800">{quote.folio}</strong> fue guardada en tu perfil y tu pago se acreditó al instante.
            </p>
          </div>

          {/* Ticket Digital Apple Wallet Style */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 text-left space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-[#009EE3]/20 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  Referencia Mercado Pago
                </p>
                <p className="font-mono text-sm font-bold text-[#009EE3]">
                  {paymentResult.mpReference}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  Monto Pagado
                </p>
                <p className="text-xl font-black text-emerald-400">
                  {formatCurrency(currentAmount)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">CLIENTE</span>
                <strong className="text-white">{quote.customer.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ESPACIO RESERVADO</span>
                <strong className="text-white">{quote.venue.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">FECHA DEL EVENTO</span>
                <strong className="text-white">{formatDate(quote.eventDate, 'd MMM yyyy')}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SALDO RESTANTE</span>
                <strong className="text-amber-300">{formatCurrency(paymentResult.newBalanceAmount)}</strong>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold text-sm shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Enviar Comprobante y PDF al WhatsApp del Dueño</span>
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href={`/customers/${quote.customerId}?tab=quotes`}
                className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Ver en Mi Perfil (Cotizaciones)</span>
              </Link>
              <Link
                href={`/quotes/${quote.id}?print=pdf`}
                className="py-3 px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Cotización PDF</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-900 pb-16">
      {/* Top Bar Oficial Mercado Pago + Apple Glass */}
      <header className="sticky top-0 z-40 bg-[#009EE3] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/quotes/${quote.id}`}
              className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-[#009EE3] flex items-center justify-center font-black text-sm shadow-sm">
                MP
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight block leading-none">
                  Mercado Pago Checkout Pro
                </span>
                <span className="text-[11px] text-white/80">
                  {businessSettings?.commercialName || 'Salón Imperial'} • Compra 100% Protegida
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-white/15 px-3 py-1.5 rounded-full font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Encriptación TLS 256-bits</span>
            <span className="font-mono text-[10px] opacity-80">({preferenceId})</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Métodos de pago y Formulario */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selector de Modalidad de Pago: Anticipo 30% vs Pago Total */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">
                1. Elige cuánto deseas abonar hoy
              </h2>
              <span className="text-[11px] font-semibold text-[#009EE3] bg-[#009EE3]/10 px-2.5 py-1 rounded-full">
                Apartado inmediato
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setAmountType('DEPOSIT')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  amountType === 'DEPOSIT'
                    ? 'border-[#009EE3] bg-[#009EE3]/5 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#009EE3]">
                    Anticipo 30% (Recomendado)
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      amountType === 'DEPOSIT' ? 'border-[#009EE3]' : 'border-slate-300'
                    }`}
                  >
                    {amountType === 'DEPOSIT' && <div className="w-2 h-2 rounded-full bg-[#009EE3]" />}
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-1.5">
                  {formatCurrency(depositAmount)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Congela el precio y bloquea tu fecha en el calendario oficial.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAmountType('FULL')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  amountType === 'FULL'
                    ? 'border-[#009EE3] bg-[#009EE3]/5 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Liquidación Total 100%
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      amountType === 'FULL' ? 'border-[#009EE3]' : 'border-slate-300'
                    }`}
                  >
                    {amountType === 'FULL' && <div className="w-2 h-2 rounded-full bg-[#009EE3]" />}
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-1.5">
                  {formatCurrency(fullAmount)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Liquida el evento completo sin saldos pendientes.
                </p>
              </button>
            </div>
          </div>

          {/* Selector de Medio de Pago en Mercado Pago */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">
            <h2 className="text-base font-extrabold text-slate-900">
              2. Selecciona tu medio de pago en Mercado Pago
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                  selectedMethod === 'CARD'
                    ? 'border-[#009EE3] bg-[#009EE3]/5 text-[#009EE3]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-bold">Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('MP_WALLET')}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                  selectedMethod === 'MP_WALLET'
                    ? 'border-[#009EE3] bg-[#009EE3]/5 text-[#009EE3]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span className="text-xs font-bold">Saldo Mercado Pago</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('SPEI')}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                  selectedMethod === 'SPEI'
                    ? 'border-[#009EE3] bg-[#009EE3]/5 text-[#009EE3]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs font-bold">SPEI / Efectivo</span>
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleProcessPayment} className="space-y-4">
              {selectedMethod === 'CARD' && (
                <>
                  {/* Tarjeta Visual Estilo Apple Card / Mercado Pago */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#009EE3] text-white shadow-xl space-y-6 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-widest uppercase opacity-80">
                        Mercado Pago • Checkout Pro
                      </span>
                      <Sparkles className="w-5 h-5 text-sky-300" />
                    </div>
                    <p className="font-mono text-xl sm:text-2xl tracking-widest font-bold">
                      {cardNumber || '4532 •••• •••• 4242'}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase opacity-60 block">TITULAR</span>
                        <span className="font-bold tracking-wider">{cardHolder}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase opacity-60 block">VENCE</span>
                        <span className="font-bold">{cardExpiry}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Número de tarjeta
                      </label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#009EE3]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre del titular
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#009EE3]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Vencimiento
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#009EE3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#009EE3]"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mensualidades disponibles
                      </label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#009EE3]"
                      >
                        <option value="1">1 pago de {formatCurrency(currentAmount)} (Sin intereses)</option>
                        <option value="3">3 meses sin intereses de {formatCurrency(currentAmount / 3)}</option>
                        <option value="6">6 meses sin intereses de {formatCurrency(currentAmount / 6)}</option>
                        <option value="12">12 meses sin intereses de {formatCurrency(currentAmount / 12)}</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {selectedMethod === 'MP_WALLET' && (
                <div className="p-5 rounded-2xl bg-[#009EE3]/5 border border-[#009EE3]/20 space-y-2 text-xs text-slate-700">
                  <p className="font-bold text-slate-900 text-sm">
                    Usar saldo disponible en tu cuenta de Mercado Pago
                  </p>
                  <p>
                    Se acreditará instantáneamente usando tu cuenta vinculada de Mercado Libre / Mercado Pago sin comisiones adicionales.
                  </p>
                </div>
              )}

              {selectedMethod === 'SPEI' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                  <p className="font-bold text-slate-900 text-sm">
                    Transferencia CLABE SPEI Inmediata (STP / Mercado Pago)
                  </p>
                  <p className="font-mono text-sm bg-white p-3 rounded-xl border border-slate-200 font-bold text-slate-900">
                    CLABE: 646180157042891042
                  </p>
                  <p>Al presionar confirmar se conciliará tu transferencia en tiempo real.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 px-6 rounded-2xl bg-[#009EE3] hover:bg-[#0089c7] text-white font-extrabold text-sm shadow-lg shadow-[#009EE3]/30 flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Procesando pago seguro en Mercado Pago...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pagar {formatCurrency(currentAmount)} con Mercado Pago</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Resumen de la Cotización Personalizada */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 sticky top-24 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Resumen de Compra
                </span>
                <h3 className="text-lg font-black text-slate-900">{quote.folio}</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                {quote.eventType.name}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>
                  Cliente: <strong className="text-slate-900">{quote.customer.name}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>
                  Salón: <strong className="text-slate-900">{quote.venue.name}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Fecha: <strong className="text-slate-900">{formatDate(quote.eventDate, 'EEEE d MMM yyyy')}</strong> ({quote.startTime} - {quote.endTime})
                </span>
              </div>
            </div>

            {quote.estimatedBudget > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                <span className="text-slate-500 font-medium">Tu Presupuesto Registrado:</span>
                <strong className="text-slate-900 font-bold">
                  {formatCurrency(quote.estimatedBudget)}
                </strong>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
              {(quote.items || []).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-slate-600">
                  <span className="truncate pr-3">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total de la Cotización:</span>
                <span className="font-bold text-slate-800">{formatCurrency(quote.total)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-black text-slate-900 pt-1">
                <span>Total a Pagar Hoy:</span>
                <span className="text-2xl text-[#009EE3]">{formatCurrency(currentAmount)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>¿Prefieres enviar primero el PDF por WhatsApp al dueño?</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
