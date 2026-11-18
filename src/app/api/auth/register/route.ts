import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setSessionCookie, SessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('Error fetching tenants for registration:', error);
    return NextResponse.json({ tenants: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountType } = body;

    // ========================================================================
    // 1. REGISTRO DE NUEVO DUEÑO DE SALÓN (CREACIÓN DE TENANT + ONBOARDING)
    // ========================================================================
    if (accountType === 'OWNER') {
      const {
        fullName,
        email,
        password,
        phone,
        whatsapp,
        avatarUrl,
        // Datos del Salón / Negocio
        salonName,
        slogan,
        address,
        plan = 'PRO',
        depositPercentage = 30,
        extraHourPrice = 1500,
        // Configuración inicial (o skipInitialCatalog = true si eligió "Omitir por ahora")
        skipInitialCatalog = false,
        firstVenueName,
        firstVenueCapacity,
        firstVenuePrice,
        firstMenuName,
        firstMenuAdultPrice,
        firstMenuChildPrice,
        firstPackageName,
        firstPackagePrice,
      } = body;

      // Validaciones estrictas
      if (!fullName || fullName.trim().split(/\s+/).length < 2) {
        return NextResponse.json(
          { error: 'Por favor ingresa tu nombre completo (nombre y apellidos).' },
          { status: 400 }
        );
      }

      const cleanEmail = (email || '').toLowerCase().trim();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json(
          { error: 'Por favor ingresa un correo electrónico válido.' },
          { status: 400 }
        );
      }

      const cleanWhatsapp = (whatsapp || phone || '').replace(/\D/g, '');
      if (cleanWhatsapp.length < 10) {
        return NextResponse.json(
          { error: 'Ingresa un número de WhatsApp real de al menos 10 dígitos.' },
          { status: 400 }
        );
      }

      if (!salonName || salonName.trim().length < 3) {
        return NextResponse.json(
          { error: 'Ingresa el nombre comercial de tu salón de eventos.' },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Este correo electrónico ya está registrado. Inicia sesión o usa otro correo.' },
          { status: 400 }
        );
      }

      const baseSlug = salonName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const uniqueSlug = `${baseSlug || 'salon'}-${Date.now().toString().slice(-4)}`;

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password || 'Admin123!', salt);

      // Crear el Tenant, Configuración, Usuario Dueño y Catálogos Iniciales
      const newTenant = await prisma.tenant.create({
        data: {
          name: salonName.trim(),
          slug: uniqueSlug,
          plan,
          status: 'ACTIVE',
        },
      });

      await prisma.businessSettings.create({
        data: {
          tenantId: newTenant.id,
          commercialName: salonName.trim(),
          slogan: slogan?.trim() || 'Experiencias exclusivas y eventos inolvidables',
          address: address?.trim() || 'Av. Principal #100, Ciudad de México',
          phone: phone?.trim() || cleanWhatsapp,
          whatsapp: cleanWhatsapp,
          email: cleanEmail,
          depositPercentage: Number(depositPercentage) || 30,
          extraHourPrice: Number(extraHourPrice) || 1500,
          defaultHours: 5,
        },
      });

      const ownerUser = await prisma.user.create({
        data: {
          tenantId: newTenant.id,
          email: cleanEmail,
          passwordHash,
          name: fullName.trim(),
          role: 'ADMIN',
          phone: cleanWhatsapp,
          avatarUrl: avatarUrl || null,
          isActive: true,
        },
      });

      // Crear Tipos de Evento base para el nuevo salón
      const defaultEventTypes = [
        { name: 'Boda', color: '#ec4899' },
        { name: 'XV Años', color: '#a855f7' },
        { name: 'Bautizo', color: '#38bdf8' },
        { name: 'Cumpleaños', color: '#10b981' },
        { name: 'Graduación', color: '#6366f1' },
        { name: 'Evento Empresarial', color: '#0f172a' },
      ];

      for (const et of defaultEventTypes) {
        await prisma.eventType.create({
          data: {
            tenantId: newTenant.id,
            name: et.name,
            color: et.color,
          },
        });
      }

      // Crear primer Salón/Espacio (personalizado o por defecto si omitió)
      await prisma.venue.create({
        data: {
          tenantId: newTenant.id,
          name:
            !skipInitialCatalog && firstVenueName?.trim()
              ? firstVenueName.trim()
              : `Salón Principal ${salonName.trim()}`,
          description: skipInitialCatalog
            ? 'Espacio principal creado automáticamente. Puedes editarlo en el apartado Salones.'
            : `Espacio principal de ${salonName.trim()} configurado durante el registro.`,
          capacity: !skipInitialCatalog && firstVenueCapacity ? Number(firstVenueCapacity) : 200,
          basePrice: !skipInitialCatalog && firstVenuePrice ? Number(firstVenuePrice) : 12000,
          location: address?.trim() || 'Planta Principal',
          isActive: true,
        },
      });

      // Crear primer Menú
      await prisma.menu.create({
        data: {
          tenantId: newTenant.id,
          name:
            !skipInitialCatalog && firstMenuName?.trim()
              ? firstMenuName.trim()
              : 'Menú Banquete de la Casa',
          description:
            'Menú configurable desde el apartado Menús y Banquetes.',
          adultPrice:
            !skipInitialCatalog && firstMenuAdultPrice ? Number(firstMenuAdultPrice) : 320,
          childPrice:
            !skipInitialCatalog && firstMenuChildPrice ? Number(firstMenuChildPrice) : 180,
          isActive: true,
        },
      });

      // Crear primer Paquete
      await prisma.package.create({
        data: {
          tenantId: newTenant.id,
          name:
            !skipInitialCatalog && firstPackageName?.trim()
              ? firstPackageName.trim()
              : 'Integral Esencial',
          description: 'Incluye renta del salón, mobiliario, mantelería y coordinador.',
          basePrice:
            !skipInitialCatalog && firstPackagePrice ? Number(firstPackagePrice) : 28000,
          includedGuests: 100,
          includedHours: 5,
          includedServices: JSON.stringify([
            'Renta del salón por 5 horas',
            'Mesas, sillas Tiffany y mantelería',
            'Personal de recepción y limpieza',
          ]),
          isActive: true,
        },
      });

      // Crear un entretenimiento y servicio base para que pueda cotizar de inmediato
      await prisma.entertainment.create({
        data: {
          tenantId: newTenant.id,
          name: 'DJ Profesional con Audio e Iluminación',
          price: 5000,
          durationHours: 5,
          isActive: true,
        },
      });

      await prisma.additionalService.create({
        data: {
          tenantId: newTenant.id,
          name: 'Decoración Temática y Centros de Mesa',
          price: 4000,
          billingType: 'FIXED',
          isActive: true,
        },
      });

      // Crear un cliente inicial (el propio dueño o cliente demo) para que el asistente de cotización tenga un perfil listo
      await prisma.customer.create({
        data: {
          tenantId: newTenant.id,
          name: 'Juan Pérez (Cliente Demo)',
          email: 'juan.perez@cliente.demo',
          phone: cleanWhatsapp,
          whatsapp: cleanWhatsapp,
          address: address?.trim() || 'Ciudad de México',
          whatsappVerified: true,
          emailVerified: true,
          notes: 'Cliente de prueba generado para tu nuevo salón.',
        },
      });

      const sessionUser: SessionUser = {
        id: ownerUser.id,
        email: ownerUser.email,
        name: ownerUser.name,
        role: ownerUser.role,
        tenantId: newTenant.id,
        tenantName: newTenant.name,
        tenantSlug: newTenant.slug,
        avatarUrl: ownerUser.avatarUrl,
        phone: ownerUser.phone,
      };

      await setSessionCookie(sessionUser);

      return NextResponse.json(
        {
          success: true,
          accountType: 'OWNER',
          user: sessionUser,
          tenant: newTenant,
          skippedCatalog: skipInitialCatalog,
          redirectUrl: `/dashboard?onboarding=${skipInitialCatalog ? 'skipped' : 'completed'}`,
        },
        { status: 201 }
      );
    }

    // ========================================================================
    // 2. REGISTRO DE NUEVO USUARIO COMO CLIENTE (CON WHATSAPP Y EMAIL VERIFICADO + SELFIE/GALERÍA)
    // ========================================================================
    if (accountType === 'CLIENT') {
      const {
        fullName,
        email,
        password,
        phone,
        whatsapp,
        address,
        notes,
        avatarUrl,
        tenantId = 'tenant-salon-imperial',
        whatsappVerified = false,
      } = body;

      // Validar Nombre Completo (mínimo nombre y apellido)
      if (!fullName || fullName.trim().split(/\s+/).length < 2) {
        return NextResponse.json(
          { error: 'Por favor ingresa tu nombre completo (Nombre y Apellidos reales).' },
          { status: 400 }
        );
      }

      // Validar Correo Electrónico Real
      const cleanEmail = (email || '').toLowerCase().trim();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json(
          { error: 'Ingresa un correo electrónico válido y real (ej. nombre@dominio.com).' },
          { status: 400 }
        );
      }

      // Validar WhatsApp Real (10 a 13 dígitos, sin secuencias falsas como 0000000000)
      const cleanWhatsapp = (whatsapp || phone || '').replace(/\D/g, '');
      if (cleanWhatsapp.length < 10 || /^(\d)\1{9,}$/.test(cleanWhatsapp)) {
        return NextResponse.json(
          { error: 'Por favor ingresa un número de WhatsApp real y válido (10 dígitos).' },
          { status: 400 }
        );
      }

      if (!whatsappVerified) {
        return NextResponse.json(
          { error: 'Debes verificar tu número de WhatsApp con el código de seguridad antes de finalizar.' },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Este correo ya está registrado. Inicia sesión desde la pantalla de acceso.' },
          { status: 400 }
        );
      }

      const targetTenant =
        (await prisma.tenant.findUnique({ where: { id: tenantId } })) ||
        (await prisma.tenant.findFirst({ where: { status: 'ACTIVE' } }));

      if (!targetTenant) {
        return NextResponse.json({ error: 'Salón no encontrado' }, { status: 404 });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password || 'Cliente123!', salt);

      // Crear usuario con rol CLIENT exclusivo para el Portal del Cliente
      const clientUser = await prisma.user.create({
        data: {
          tenantId: targetTenant.id,
          email: cleanEmail,
          passwordHash,
          name: fullName.trim(),
          role: 'CLIENT', // Rol de Cliente VIP: accede a su Portal del Cliente, Cotizador, Mapas GPS y Pagos
          phone: cleanWhatsapp,
          avatarUrl: avatarUrl || null,
          isActive: true,
        },
      });

      // Crear su ficha de Cliente con WhatsApp Verificado, Email Verificado y Foto Selfie/Galería
      const customerRecord = await prisma.customer.create({
        data: {
          tenantId: targetTenant.id,
          userId: clientUser.id,
          name: fullName.trim(),
          email: cleanEmail,
          phone: phone?.trim() || cleanWhatsapp,
          whatsapp: cleanWhatsapp,
          address: address?.trim() || 'Dirección registrada por el cliente',
          avatarUrl: avatarUrl || null,
          whatsappVerified: true,
          emailVerified: true,
          notes: notes?.trim() || 'Cliente registrado desde el portal con WhatsApp verificado.',
        },
      });

      const sessionUser: SessionUser = {
        id: clientUser.id,
        email: clientUser.email,
        name: clientUser.name,
        role: clientUser.role,
        tenantId: targetTenant.id,
        tenantName: targetTenant.name,
        tenantSlug: targetTenant.slug,
        avatarUrl: clientUser.avatarUrl,
        phone: clientUser.phone,
        customerId: customerRecord.id,
      };

      await setSessionCookie(sessionUser);

      return NextResponse.json(
        {
          success: true,
          accountType: 'CLIENT',
          user: sessionUser,
          customer: customerRecord,
          redirectUrl: `/customers/${customerRecord.id}?tab=quotes&welcome=1`,
          quoteWizardUrl: `/quotes/new?customerId=${customerRecord.id}`,
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: 'Tipo de registro inválido' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/auth/register:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar el registro' },
      { status: 500 }
    );
  }
}
