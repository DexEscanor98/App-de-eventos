import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkVenueAvailability } from '@/lib/availability';
import { generateFolio } from '@/lib/folios';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    // 1. Obtener la cotización
    const quote = await prisma.quote.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        venue: true,
        eventType: true,
        items: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }

    // 2. Comprobar disponibilidad del salón y horario (Anti Double Booking)
    const availability = await checkVenueAvailability(
      tenantId,
      quote.venueId,
      quote.eventDate,
      quote.startTime,
      quote.endTime
    );

    if (!availability.isAvailable) {
      return NextResponse.json(
        {
          error: 'Conflicto de Horario detectado',
          message: availability.message,
          conflictingItem: availability.conflictingItem,
        },
        { status: 409 }
      );
    }

    // 3. Generar Folios RES y EVT
    const folioRes = await generateFolio(tenantId, 'RES');
    const folioEvt = await generateFolio(tenantId, 'EVT');

    // 4. Crear Reservación
    const reservation = await prisma.reservation.create({
      data: {
        folio: folioRes,
        tenantId,
        quoteId: quote.id,
        customerId: quote.customerId,
        venueId: quote.venueId,
        eventTypeId: quote.eventTypeId,
        eventDate: quote.eventDate,
        startTime: quote.startTime,
        endTime: quote.endTime,
        adults: quote.adults,
        children: quote.children,
        totalAmount: quote.total,
        paidAmount: 0,
        balanceAmount: quote.total,
        status: 'CONFIRMED',
        notes: `Convertida desde cotización ${quote.folio}`,
        createdById: user.id,
      },
    });

    // 5. Crear Evento asociado
    const event = await prisma.event.create({
      data: {
        folio: folioEvt,
        tenantId,
        reservationId: reservation.id,
        customerId: quote.customerId,
        venueId: quote.venueId,
        eventTypeId: quote.eventTypeId,
        name: `${quote.eventType.name} - ${quote.customer.name}`,
        eventDate: quote.eventDate,
        startTime: quote.startTime,
        endTime: quote.endTime,
        adults: quote.adults,
        children: quote.children,
        totalAmount: quote.total,
        paidAmount: 0,
        balanceAmount: quote.total,
        status: 'SCHEDULED',
        notes: quote.notes,
        items: {
          create: quote.items.map((it) => ({
            type: it.type,
            name: it.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
          })),
        },
      },
    });

    // 6. Actualizar status de cotización a CONVERTED
    await prisma.quote.update({
      where: { id: quote.id },
      data: { status: 'CONVERTED' },
    });

    // 7. Auditoría
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        action: 'UPDATE',
        entity: 'Quote',
        entityId: quote.id,
        metadata: JSON.stringify({
          action: 'CONVERT_TO_RESERVATION',
          reservationFolio: reservation.folio,
          eventFolio: event.folio,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      reservation,
      event,
    });
  } catch (error: any) {
    console.error('Error converting quote to reservation:', error);
    return NextResponse.json({ error: 'Error al convertir cotización' }, { status: 500 });
  }
}
