'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  FileText,
  ArrowLeft,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Printer,
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils';

interface ReservationDetailViewProps {
  reservation: any;
  businessSettings: any;
}

export function ReservationDetailView({
  reservation,
  businessSettings,
}: ReservationDetailViewProps) {
  const router = useRouter();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Calcular balance real a partir de pagos registrados
  const totalPaid = reservation.payments.reduce((acc: number, p: any) => acc + p.amount, 0);
  const balance = Math.max(0, reservation.totalAmount - totalPaid);

  // Sugerencia de anticipo 30%
  const suggestedDeposit = Math.round(reservation.totalAmount * 0.3);

  // Formulario de pago
  const [amount, setAmount] = useState(totalPaid === 0 ? suggestedDeposit : balance);
  const [paymentType, setPaymentType] = useState(totalPaid === 0 ? 'DEPOSIT' : 'PARTIAL');
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const badge = getStatusBadge(reservation.status);

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPayment(true);
    setPaymentError(null);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: reservation.id,
          customerId: reservation.customerId,
          amount: Number(amount),
          paymentType,
          paymentMethod,
          reference: reference || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar el pago');
      }

      setPaymentModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setPaymentError(err.message);
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/reservations" className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Reservaciones</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-slate-800">{reservation.folio}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/calendar?date=${reservation.eventDate.split('T')[0]}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Ver en Calendario</span>
          </Link>

          <Link
            href={`/contracts/${reservation.contracts?.[0]?.id || 'preview'}?reservationId=${reservation.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Ver Contrato</span>
          </Link>

          {balance > 0 && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Anticipo / Pago</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Reservation Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                {reservation.folio}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cliente: <strong className="text-slate-800">{reservation.customer.name}</strong> • Tel: {reservation.customer.phone}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Espacio</span>
              <strong className="text-slate-800">{reservation.venue.name}</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Fecha Evento</span>
              <strong className="text-slate-800">{formatDate(reservation.eventDate, 'd MMM, yyyy')}</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Horario</span>
              <strong className="text-slate-800">{reservation.startTime} - {reservation.endTime}</strong>
            </div>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Inversión Total
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {formatCurrency(reservation.totalAmount)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Monto Pagado / Anticipos
            </span>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              {formatCurrency(totalPaid)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              Saldo Pendiente
            </span>
            <p className="text-2xl font-black text-rose-600 mt-1 font-mono">
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Payments History Timeline */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Historial de Pagos y Abonos Registrados ({reservation.payments.length})</span>
            </h3>

            {balance > 0 && (
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Abono</span>
              </button>
            )}
          </div>

          {reservation.payments.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Aún no se han registrado pagos para esta reservación</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Para confirmar la fecha se recomienda registrar el anticipo del 30% ({formatCurrency(suggestedDeposit)}).
              </p>
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                Registrar Anticipo del 30%
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {reservation.payments.map((p: any) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-800">{p.folio}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                          {p.paymentType === 'DEPOSIT' ? 'ANTICIPO' : 'ABONO'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(p.paymentDate, "d 'de' MMMM, yyyy")} • Método: {p.paymentMethod}
                        {p.reference && ` • Ref: ${p.reference}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600 font-mono">
                      +{formatCurrency(p.amount)}
                    </span>
                    {p.receivedBy && (
                      <p className="text-[10px] text-slate-400">Recibió: {p.receivedBy.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Registrar Pago / Anticipo */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Registrar Pago / Anticipo</h3>
                  <p className="text-[11px] text-slate-400">Folio: {reservation.folio}</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="p-5 space-y-4">
              {paymentError && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">
                  {paymentError}
                </div>
              )}

              {/* Botón rápido sugerencia 30% */}
              {totalPaid === 0 && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-900 block">Anticipo Sugerido (30%)</span>
                    <span className="text-[11px] text-indigo-600">Requerido para apartado formal</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAmount(suggestedDeposit);
                      setPaymentType('DEPOSIT');
                    }}
                    className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-xs"
                  >
                    Usar {formatCurrency(suggestedDeposit)}
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monto a Registrar *</label>
                <input
                  type="number"
                  required
                  step="any"
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-bold text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Saldo pendiente actual: {formatCurrency(balance)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Pago</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="DEPOSIT">Anticipo</option>
                    <option value="PARTIAL">Abono Parcial</option>
                    <option value="SETTLEMENT">Liquidación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="TRANSFER">Transferencia SPEI</option>
                    <option value="CASH">Efectivo</option>
                    <option value="CARD">Tarjeta Débito/Crédito</option>
                    <option value="BANK_DEPOSIT">Depósito Bancario</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Referencia o Folio Bancario</label>
                <input
                  type="text"
                  placeholder="Ej. SPEI-984723 o No. de Autorización"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas</label>
                <textarea
                  rows={2}
                  placeholder="Notas internas sobre el comprobante..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingPayment && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Aplicar Pago</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
