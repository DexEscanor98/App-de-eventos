'use client';

import Link from 'next/link';
import { ArrowLeft, Printer, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ContractPrintViewProps {
  contract: any;
  reservation: any;
  businessSettings: any;
  policies: any[];
}

export function ContractPrintView({
  contract,
  reservation,
  businessSettings,
  policies,
}: ContractPrintViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalPaid = reservation.payments.reduce((acc: number, p: any) => acc + p.amount, 0);
  const balance = Math.max(0, reservation.totalAmount - totalPaid);

  const contractFolio = contract?.folio || `CON-2026-${reservation.folio.replace('RES-2026-', '')}`;

  return (
    <div className="space-y-6">
      {/* Top Bar for Actions (Hidden in Print) */}
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href={`/reservations/${reservation.id}`} className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Reservación</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-slate-800">{contractFolio}</span>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Guardar en PDF</span>
        </button>
      </div>

      {/* Contract Legal Document */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-10 md:p-14 text-slate-800 print-page space-y-6 font-serif">
        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 font-sans">
            {businessSettings?.commercialName || 'SALÓN IMPERIAL'}
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-1">
            CONTRATO FORMAL DE PRESTACIÓN DE SERVICIOS PARA EVENTO SOCIAL
          </p>
          <p className="text-xs font-mono font-bold text-indigo-600 mt-2">
            FOLIO OFICIAL: {contractFolio}
          </p>
        </div>

        {/* Declarations */}
        <div className="text-xs leading-relaxed space-y-3">
          <p>
            En la Ciudad de México, se celebra el presente contrato de prestación de servicios para la realización de un evento social entre <strong>{businessSettings?.commercialName || 'SALÓN IMPERIAL'}</strong>, a quien en lo sucesivo se denominará como <em>"EL PRESTADOR"</em>, con domicilio en {businessSettings?.address || 'Av. Paseo de la Reforma 450, CDMX'}, y por la otra parte el C. <strong>{reservation.customer.name.toUpperCase()}</strong>, a quien en lo sucesivo se le denominará como <em>"EL CLIENTE"</em>, al tenor de las siguientes:
          </p>

          <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 pt-3 border-t border-slate-100">
            CLÁUSULAS
          </h3>

          <p>
            <strong>PRIMERA. OBJETO DEL EVENTO:</strong> "EL PRESTADOR" se compromete a poner a disposición de "EL CLIENTE" el espacio denominado <strong>{reservation.venue.name}</strong> para la celebración de un evento tipo <strong>{reservation.eventType.name}</strong>.
          </p>

          <p>
            <strong>SEGUNDA. FECHA Y HORARIO:</strong> El evento se llevará a cabo el día <strong>{formatDate(reservation.eventDate, "EEEE d 'de' MMMM de yyyy")}</strong>, dentro del horario acordado de <strong>{reservation.startTime} a {reservation.endTime} horas</strong>. Cualquier hora adicional no contemplada causará un cargo de {formatCurrency(businessSettings?.extraHourPrice || 1500)} M.N. por hora.
          </p>

          <p>
            <strong>TERCERA. CAPACIDAD Y AFORO:</strong> Las partes acuerdan un aforo contratado de <strong>{reservation.adults} adultos</strong> {reservation.children > 0 ? `y ${reservation.children} niños` : ''}, comprometiéndose "EL CLIENTE" a no sobrepasar la capacidad autorizada por protección civil.
          </p>

          <p>
            <strong>CUARTA. PRECIO Y FORMA DE PAGO:</strong>
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans text-xs space-y-1">
            <div className="flex justify-between">
              <span>Importe Total Pactado:</span>
              <strong className="font-mono">{formatCurrency(reservation.totalAmount)} MXN</strong>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Anticipos Cubiertos a la Fecha:</span>
              <strong className="font-mono">{formatCurrency(totalPaid)} MXN</strong>
            </div>
            <div className="flex justify-between text-rose-700">
              <span>Saldo Pendiente de Liquidación:</span>
              <strong className="font-mono">{formatCurrency(balance)} MXN</strong>
            </div>
          </div>

          <p>
            "EL CLIENTE" se obliga a liquidar el saldo total pendiente a más tardar 5 (cinco) días hábiles antes de la fecha programada para el evento.
          </p>

          <p>
            <strong>QUINTA. POLÍTICAS DE CANCELACIÓN Y REEMBOLSO:</strong> Ambas partes convienen libremente en que toda cancelación formal deberá notificarse por escrito, sujetándose al siguiente tabulador:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            {policies.map((p, idx) => (
              <li key={idx}>
                {p.description}
              </li>
            ))}
          </ul>

          <p>
            <strong>SEXTA. CONSERVACIÓN DEL INMUEBLE:</strong> "EL CLIENTE" se hace civilmente responsable por cualquier daño o desperfecto que sus invitados o proveedores externos causen al mobiliario, vajilla, cristalería, audio e instalaciones de "EL PRESTADOR".
          </p>
        </div>

        {/* Signature Block */}
        <div className="pt-16 grid grid-cols-2 gap-12 text-center text-xs font-sans">
          <div className="space-y-1">
            <div className="border-t border-slate-400 pt-2 w-48 mx-auto" />
            <p className="font-bold text-slate-900">{businessSettings?.commercialName || 'SALÓN IMPERIAL'}</p>
            <p className="text-slate-400 text-[11px]">Representante Legal</p>
          </div>

          <div className="space-y-1">
            <div className="border-t border-slate-400 pt-2 w-48 mx-auto" />
            <p className="font-bold text-slate-900">{reservation.customer.name}</p>
            <p className="text-slate-400 text-[11px]">Firma de Conformidad del Cliente</p>
          </div>
        </div>

        {/* Footer legal note */}
        <div className="pt-8 border-t border-slate-200 text-center text-[10px] text-slate-400 font-sans">
          Documento generado electrónicamente por la plataforma EVENTIA SaaS • Validez contractual y fiscal bajo las leyes de los Estados Unidos Mexicanos.
        </div>
      </div>
    </div>
  );
}
