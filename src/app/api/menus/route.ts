import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = user.tenantId || 'tenant-salon-imperial';

    const menus = await prisma.menu.findMany({
      where: { tenantId, isActive: true },
      orderBy: { adultPrice: 'asc' },
    });

    return NextResponse.json(menus);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar menús' }, { status: 500 });
  }
}
