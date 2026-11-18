import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    const body = await req.json();

    const updated = await prisma.businessSettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        commercialName: body.commercialName || 'Salón Imperial',
        slogan: body.slogan,
        address: body.address,
        phone: body.phone,
        whatsapp: body.whatsapp,
        email: body.email,
        currency: body.currency || 'MXN',
        timezone: body.timezone || 'America/Mexico_City',
        taxRate: Number(body.taxRate) || 0.16,
        depositPercentage: Number(body.depositPercentage) || 30.0,
        extraHourPrice: Number(body.extraHourPrice) || 1500,
        policiesText: body.policiesText,
      },
      update: {
        commercialName: body.commercialName,
        slogan: body.slogan,
        address: body.address,
        phone: body.phone,
        whatsapp: body.whatsapp,
        email: body.email,
        currency: body.currency,
        timezone: body.timezone,
        taxRate: Number(body.taxRate),
        depositPercentage: Number(body.depositPercentage),
        extraHourPrice: Number(body.extraHourPrice),
        policiesText: body.policiesText,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
