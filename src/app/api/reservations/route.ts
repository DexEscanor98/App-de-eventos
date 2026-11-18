import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    const { searchParams } = new URL(req.url);
    const venueId = searchParams.get('venueId');
    const month = searchParams.get('month'); // YYYY-MM

    const reservations = await prisma.reservation.findMany({
      where: {
        tenantId,
        ...(venueId ? { venueId } : {}),
      },
      include: {
        customer: true,
        venue: true,
        eventType: true,
        payments: true,
      },
      orderBy: { eventDate: 'asc' },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar reservaciones' }, { status: 500 });
  }
}
