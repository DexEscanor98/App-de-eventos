import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const venueSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  description: z.string().optional().nullable(),
  capacity: z.number().int().positive('Capacidad debe ser mayor a 0'),
  basePrice: z.number().nonnegative('Precio base inválido'),
  location: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    const venues = await prisma.venue.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { reservations: true, events: true },
        },
      },
      orderBy: { capacity: 'desc' },
    });

    return NextResponse.json(venues);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar espacios' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    const body = await req.json();
    const validated = venueSchema.parse(body);

    const venue = await prisma.venue.create({
      data: {
        tenantId,
        ...validated,
      },
    });

    return NextResponse.json(venue, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear salón' }, { status: 500 });
  }
}
