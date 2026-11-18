import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateQuote } from '@/lib/pricing-engine';
import { generateFolio } from '@/lib/folios';
import { z } from 'zod';

const customItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().positive().default(1),
});

const quoteCreateSchema = z.object({
  customerId: z.string().min(1, 'Cliente requerido'),
  venueId: z.string().min(1, 'Salón requerido'),
  packageId: z.string().optional().nullable(),
  menuId: z.string().optional().nullable(),
  eventTypeId: z.string().min(1, 'Tipo de evento requerido'),
  eventDate: z.string().min(1, 'Fecha de evento requerida'),
  startTime: z.string().default('14:00'),
  endTime: z.string().default('19:00'),
  durationHours: z.number().int().positive().default(5),
  extraHours: z.number().int().nonnegative().default(0),
  adults: z.number().int().nonnegative().default(100),
  children: z.number().int().nonnegative().default(0),
  estimatedBudget: z.number().nonnegative().default(0),
  entertainmentIds: z.array(z.string()).default([]),
  serviceIds: z.array(z.string()).default([]),
  customItems: z.array(customItemSchema).default([]),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional().nullable(),
  discountValue: z.number().nonnegative().default(0),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const quotes = await prisma.quote.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
      },
      include: {
        customer: true,
        venue: true,
        eventType: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error getting quotes:', error);
    return NextResponse.json({ error: 'Error al consultar cotizaciones' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    const body = await req.json();
    const validated = quoteCreateSchema.parse(body);

    // Validación estricta de fecha: prohibido fechas anteriores a hoy
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const inputDateStr = validated.eventDate.split('T')[0];

    if (inputDateStr < todayStr) {
      return NextResponse.json(
        { error: 'La fecha del evento no puede ser anterior al día de hoy. Por favor selecciona una fecha actual o futura.' },
        { status: 400 }
      );
    }

    // 1. Obtener datos de la base de datos para el cálculo
    const venue = await prisma.venue.findUnique({ where: { id: validated.venueId } });
    if (!venue) return NextResponse.json({ error: 'Salón no encontrado' }, { status: 404 });

    let pkg = null;
    if (validated.packageId) {
      pkg = await prisma.package.findUnique({ where: { id: validated.packageId } });
    }

    let menu = null;
    if (validated.menuId) {
      menu = await prisma.menu.findUnique({ where: { id: validated.menuId } });
    }

    const entertainments = validated.entertainmentIds.length > 0
      ? await prisma.entertainment.findMany({ where: { id: { in: validated.entertainmentIds } } })
      : [];

    const services = validated.serviceIds.length > 0
      ? await prisma.additionalService.findMany({ where: { id: { in: validated.serviceIds } } })
      : [];

    const settings = await prisma.businessSettings.findUnique({ where: { tenantId } });
    const extraHourPrice = settings?.extraHourPrice || 1500;

    // Incorporar conceptos personalizados del cliente como servicios adicionales fijos para el motor
    const combinedServices = [
      ...services.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        billingType: s.billingType as any,
      })),
      ...validated.customItems.map((ci, idx) => ({
        id: ci.id || `custom-${idx}`,
        name: `${ci.name} (Personalizado)`,
        price: ci.price * ci.quantity,
        billingType: 'FIXED' as const,
      })),
    ];

    // 2. Ejecutar motor de cálculo centralizado
    const pricing = calculateQuote({
      adults: validated.adults,
      children: validated.children,
      venuePrice: venue.basePrice,
      packagePrice: pkg?.basePrice,
      packageIncludedGuests: pkg?.includedGuests,
      packageExtraGuestPrice: pkg?.extraGuestPrice,
      menuAdultPrice: menu?.adultPrice,
      menuChildPrice: menu?.childPrice,
      extraHours: validated.extraHours,
      extraHourPrice,
      entertainments: entertainments.map((e) => ({
        id: e.id,
        name: e.name,
        price: e.price,
      })),
      services: combinedServices,
      discount: validated.discountValue > 0 && validated.discountType
        ? { type: validated.discountType, value: validated.discountValue }
        : undefined,
      taxRate: 0,
    });

    // 3. Generar Folio único COT-2026-XXXXX
    const folio = await generateFolio(tenantId, 'COT');

    // 4. Crear Cotización con Snapshots inmutables en QuoteItem y Presupuesto registrado
    const quote = await prisma.quote.create({
      data: {
        folio,
        tenantId,
        customerId: validated.customerId,
        venueId: validated.venueId,
        packageId: validated.packageId || null,
        menuId: validated.menuId || null,
        eventTypeId: validated.eventTypeId,
        eventDate: new Date(`${inputDateStr}T12:00:00`),
        startTime: validated.startTime,
        endTime: validated.endTime,
        durationHours: validated.durationHours,
        extraHours: validated.extraHours,
        adults: validated.adults,
        children: validated.children,
        estimatedBudget: validated.estimatedBudget || 0,
        customItemsJson: validated.customItems.length > 0 ? JSON.stringify(validated.customItems) : null,
        baseVenuePrice: pricing.baseVenuePrice,
        packagePrice: pricing.packagePrice,
        menuPrice: pricing.menuPrice,
        entertainmentTotal: pricing.entertainmentTotal,
        servicesTotal: pricing.servicesTotal,
        extraHoursTotal: pricing.extraHoursTotal,
        subtotal: pricing.subtotal,
        discountType: pricing.discountType,
        discountValue: pricing.discountValue,
        discountTotal: pricing.discountTotal,
        taxRate: pricing.taxRate,
        taxTotal: pricing.taxTotal,
        total: pricing.total,
        status: 'SENT',
        notes: validated.notes || null,
        createdById: user.id,
        items: {
          create: pricing.items.map((item) => ({
            type: item.type,
            referenceId: item.referenceId || null,
            name: item.name,
            description: item.description || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
        venue: true,
        eventType: true,
      },
    });

    // 5. Registrar en Auditoría
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        action: 'CREATE',
        entity: 'Quote',
        entityId: quote.id,
        metadata: JSON.stringify({
          folio: quote.folio,
          total: quote.total,
          estimatedBudget: quote.estimatedBudget,
          customer: quote.customer.name,
        }),
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quote:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al procesar la cotización' }, { status: 500 });
  }
}
