'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  X,
  Loader2,
  Calendar,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PaymentItem {
  id: string;
  folio: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  reference?: string | null;
  paymentDate: string | Date;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  reservation?: {
    id: string;
    folio: string;
  } | null;
  receivedBy?: {
    name: string;
  } | null;
}

interface CustomerOption {
  id: string;
  name: string;
  reservations: {
    id: string;
    folio: string;
    balanceAmount: number;
  }[];
}

interface PaymentsViewProps {
  initialPayments: PaymentItem[];
  customers: CustomerOption[];
}

export function PaymentsView({ initialPayments, customers }: PaymentsViewProps) {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentItem[]>(initialPayments);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedReservationId, setSelectedReservationId] = useState('');
  const [amount, setAmount] = useState<number | string>(15000);
  const [paymentType, setPaymentType] = useState('DEPOSIT');
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.folio.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          reservationId: selectedReservationId || undefined,
          amount: Number(amount),
          paymentType,
          paymentMethod,
          reference: reference || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el pago');
      }

      setPayments([data, ...payments]);
      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pagos, Anticipos y Cobranza
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de cobros, transferencias SPEI, anticipos y balance de saldos
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Pago</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Recaudado Histórico
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrency(totalCollected)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Cobranza auditada</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Transacciones Registradas
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {payments.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Comprobantes con folio único
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Promedio por Transacción
          </span>
          <p className="text-2xl font-black text-indigo-600 mt-1 font-mono">
            {formatCurrency(payments.length > 0 ? totalCollected / payments.length : 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Ticket promedio de abono</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por folio PAG-, cliente o referencia bancaria..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Todos los métodos</option>
            <option value="TRANSFER">Transferencia SPEI</option>
            <option value="CASH">Efectivo</option>
            <option value="CARD">Tarjeta</option>
            <option value="BANK_DEPOSIT">Depósito en Ventanilla</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Folio / Fecha</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Reservación</th>
                <th className="py-3.5 px-4">Método / Ref.</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4 text-right">Monto Abonado</th>
                <th className="py-3.5 px-5 text-right">Usuario Receptor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No se encontraron pagos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-slate-900 block">{p.folio}</span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(p.paymentDate, "d 'de' MMM, yyyy")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{p.customer.name}</span>
                      <span className="text-[11px] text-slate-400">{p.customer.phone}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {p.reservation ? (
                        <Link
                          href={`/reservations/${p.reservation.id}`}
                          className="text-indigo-600 font-bold hover:underline"
                        >
                          {p.reservation.folio}
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{p.paymentMethod}</span>
                      {p.reference && (
                        <span className="text-[10px] text-slate-400 font-mono">{p.reference}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.paymentType === 'DEPOSIT' ? 'ANTICIPO' : p.paymentType === 'SETTLEMENT' ? 'LIQUIDACIÓN' : 'ABONO'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-sm text-emerald-600 font-mono">
                      +{formatCurrency(p.amount)}
                    </td>

                    <td className="py-3.5 px-5 text-right text-slate-500 text-[11px]">
                      {p.receivedBy?.name || 'Cajero de Turno'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Pago General */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Registrar Pago a Cuenta</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const cust = customers.find((c) => c.id === e.target.value);
                    if (cust && cust.reservations.length > 0) {
                      setSelectedReservationId(cust.reservations[0].id);
                    } else {
                      setSelectedReservationId('');
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {currentCustomer && currentCustomer.reservations.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reservación / Evento a Aplicar
                  </label>
                  <select
                    value={selectedReservationId}
                    onChange={(e) => setSelectedReservationId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  >
                    <option value="">Abono general sin reservar</option>
                    {currentCustomer.reservations.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.folio} (Saldo actual: {formatCurrency(r.balanceAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monto del Pago (MXN) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-bold text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500"
                />
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Método</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="TRANSFER">Transferencia SPEI</option>
                    <option value="CASH">Efectivo</option>
                    <option value="CARD">Tarjeta</option>
                    <option value="BANK_DEPOSIT">Depósito Ventanilla</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Referencia Bancaria</label>
                <input
                  type="text"
                  placeholder="Ej. SPEI-847294"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Registrar Pago</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
