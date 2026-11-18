import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const customerSchema = z.object({
  name: z
    .string()
    .min(4, 'Ingresa nombre y apellido completo')
    .refine((v) => v.trim().split(/\s+/).length >= 2, {
      message: 'El cliente debe tener nombre y apellido completos',
    }),
  phone: z.string().min(8, 'Teléfono requerido'),
  whatsapp: z.string().optional().nullable(),
  whatsappVerified: z.boolean().optional(),
  email: z.string().email('Correo electrónico válido requerido').optional().or(z.literal('')).nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const customers = await prisma.customer.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(query
          ? {
              OR: [
                { name: { contains: query } },
                { phone: { contains: query } },
                { email: { contains: query } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            quotes: true,
            reservations: true,
            events: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Error al consultar clientes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    const body = await req.json();
    const validated = customerSchema.parse(body);

    const newCustomer = await prisma.customer.create({
      data: {
        tenantId,
        name: validated.name.trim(),
        phone: validated.phone,
        whatsapp: validated.whatsapp || validated.phone,
        whatsappVerified: validated.whatsappVerified ?? false,
        email: validated.email || null,
        emailVerified: Boolean(validated.email),
        address: validated.address || null,
        notes: validated.notes || null,
        avatarUrl: validated.avatarUrl || null,
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        action: 'CREATE',
        entity: 'Customer',
        entityId: newCustomer.id,
        metadata: JSON.stringify({ name: newCustomer.name, phone: newCustomer.phone }),
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 });
  }
}
