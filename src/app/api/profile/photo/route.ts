import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { avatarUrl, customerId } = body;

    if (customerId) {
      const updatedCustomer = await prisma.customer.update({
        where: { id: customerId },
        data: { avatarUrl: avatarUrl || null },
      });
      return NextResponse.json({ success: true, customer: updatedCustomer });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: avatarUrl || null },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating profile photo:', error);
    return NextResponse.json(
      { error: 'Error al guardar la foto de perfil' },
      { status: 500 }
    );
  }
}
