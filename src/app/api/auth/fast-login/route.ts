import { NextRequest, NextResponse } from 'next/server';
import { loginAsDemoUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') || 'admin@salonimperial.demo';
  const next = searchParams.get('next') || '/dashboard';

  const user = await loginAsDemoUser(email);
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.redirect(new URL(next, req.url));
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const user = await loginAsDemoUser(email);
    if (!user) {
      return NextResponse.json({ error: 'Usuario demo no encontrado' }, { status: 404 });
    }

    const redirectUrl =
      user.role === 'CLIENT' && user.customerId
        ? `/customers/${user.customerId}?tab=quotes`
        : '/dashboard';

    return NextResponse.json({ success: true, user, redirectUrl });
  } catch (error) {
    console.error('Fast login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
