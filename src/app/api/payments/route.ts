import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateFolio } from '@/lib/folios';
import { z } from 'zod';

const paymentSchema = z.object({
  reservationId: z.string().optional().nullable(),
  eventId: z.string().optional().nullable(),
  customerId: z.string().min(1, 'Cliente requerido'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  paymentType: z.enum(['DEPOSIT', 'PARTIAL', 'SETTLEMENT', 'REFUND']).default('PARTIAL'),
  paymentMethod: z.enum(['CASH', 'TRANSFER', 'CARD', 'BANK_DEPOSIT', 'OTHER']).default('TRANSFER'),
  reference: z.string().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  paymentDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    const payments = await prisma.payment.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        customer: true,
        reservation: true,
        event: true,
        receivedBy: true,
      },
      orderBy: { paymentDate: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar pagos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    const body = await req.json();
    const validated = paymentSchema.parse(body);

    // 1. Generar Folio PAG-2026-XXXXX
    const folio = await generateFolio(tenantId, 'PAG');

    // 2. Registrar el pago
    const payment = await prisma.payment.create({
      data: {
        folio,
        tenantId,
        reservationId: validated.reservationId || null,
        eventId: validated.eventId || null,
        customerId: validated.customerId,
        amount: validated.amount,
        paymentType: validated.paymentType,
        paymentMethod: validated.paymentMethod,
        reference: validated.reference || null,
        receiptUrl: validated.receiptUrl || null,
        notes: validated.notes || null,
        receivedById: user.id,
        paymentDate: validated.paymentDate ? new Date(validated.paymentDate) : new Date(),
      },
      include: {
        customer: true,
        reservation: true,
      },
    });

    // 3. Si está asociado a una Reservación, recalcular paidAmount y balanceAmount atómicamente
    if (validated.reservationId) {
      const allResPayments = await prisma.payment.findMany({
        where: { reservationId: validated.reservationId, deletedAt: null },
      });
      const totalPaid = allResPayments.reduce((acc, p) => acc + p.amount, 0);

      const reservation = await prisma.reservation.findUnique({
        where: { id: validated.reservationId },
      });

      if (reservation) {
        const newBalance = Math.max(0, reservation.totalAmount - totalPaid);
        await prisma.reservation.update({
          where: { id: validated.reservationId },
          data: {
            paidAmount: totalPaid,
            balanceAmount: newBalance,
            status: newBalance === 0 ? 'CONFIRMED' : reservation.status,
          },
        });
      }
    }

    // 4. Si está asociado a un Evento, recalcular de igual manera
    if (validated.eventId) {
      const allEvtPayments = await prisma.payment.findMany({
        where: { eventId: validated.eventId, deletedAt: null },
      });
      const totalPaid = allEvtPayments.reduce((acc, p) => acc + p.amount, 0);

      const event = await prisma.event.findUnique({
        where: { id: validated.eventId },
      });

      if (event) {
        const newBalance = Math.max(0, event.totalAmount - totalPaid);
        await prisma.event.update({
          where: { id: validated.eventId },
          data: {
            paidAmount: totalPaid,
            balanceAmount: newBalance,
          },
        });
      }
    }

    // 5. Auditoría
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        action: 'PAYMENT',
        entity: 'Payment',
        entityId: payment.id,
        metadata: JSON.stringify({
          folio: payment.folio,
          amount: payment.amount,
          type: payment.paymentType,
          customer: payment.customer.name,
        }),
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al registrar el pago' }, { status: 500 });
  }
}
