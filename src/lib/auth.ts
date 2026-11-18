import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
  tenantName?: string;
  tenantSlug?: string;
  avatarUrl?: string | null;
  phone?: string | null;
  customerId?: string | null;
}

const SESSION_COOKIE_NAME = 'eventia_session_token';

/**
 * Obtiene el usuario de la sesión actual leyendo las cookies HTTP
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    if (!payload?.id) return null;

    // Verificar que el usuario continúe activo en BD y cargar su avatarUrl desde SQLite
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        tenant: true,
      },
    });

    if (!dbUser || !dbUser.isActive) return null;

    // Buscar si el usuario tiene perfil de Cliente vinculado (por userId o por email)
    let linkedCustomerId: string | null = null;
    if (dbUser.role === 'CLIENT' || dbUser.email.includes('cliente')) {
      const linkedCustomer = await prisma.customer.findFirst({
        where: {
          OR: [{ userId: dbUser.id }, { email: dbUser.email }],
        },
        select: { id: true },
      });
      linkedCustomerId = linkedCustomer?.id || null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      tenantId: dbUser.tenantId,
      tenantName: dbUser.tenant?.name,
      tenantSlug: dbUser.tenant?.slug,
      avatarUrl: dbUser.avatarUrl,
      phone: dbUser.phone,
      customerId: linkedCustomerId,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Autentica usuario con email y contraseña
 */
export async function authenticateUser(email: string, passwordPlain: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      tenant: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isValid) {
    return null;
  }

  let linkedCustomerId: string | null = null;
  if (user.role === 'CLIENT' || user.email.includes('cliente')) {
    const linkedCustomer = await prisma.customer.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }],
      },
      select: { id: true },
    });
    linkedCustomerId = linkedCustomer?.id || null;
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    tenantName: user.tenant?.name,
    tenantSlug: user.tenant?.slug,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    customerId: linkedCustomerId,
  };

  await setSessionCookie(sessionUser);
  return sessionUser;
}

/**
 * Establece la cookie de sesión HTTPOnly (solo guarda metadatos ligeros para evitar exceder 4KB con fotos Base64)
 */
export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies();
  const compactPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    tenantName: user.tenantName,
    tenantSlug: user.tenantSlug,
  };
  const token = Buffer.from(JSON.stringify(compactPayload)).toString('base64');

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
}

/**
 * Cierra la sesión
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Para cambio ultra rápido de usuario demo en 1 clic
 */
export async function loginAsDemoUser(email: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      tenant: true,
    },
  });

  if (!user) return null;

  let linkedCustomerId: string | null = null;
  if (user.role === 'CLIENT' || user.email.includes('cliente')) {
    const linkedCustomer = await prisma.customer.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }],
      },
      select: { id: true },
    });
    linkedCustomerId = linkedCustomer?.id || null;
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    tenantName: user.tenant?.name,
    tenantSlug: user.tenant?.slug,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    customerId: linkedCustomerId,
  };

  await setSessionCookie(sessionUser);
  return sessionUser;
}
