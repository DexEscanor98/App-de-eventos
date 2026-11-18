const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Eventia SaaS...');

  // Clean old data in safe sequence
  await prisma.auditLog.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.eventStaff.deleteMany();
  await prisma.eventItem.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.event.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.cancellationPolicy.deleteMany();
  await prisma.additionalService.deleteMany();
  await prisma.entertainment.deleteMany();
  await prisma.package.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.businessSettings.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('🧹 Existing data cleaned.');

  // 1. Create Main Tenant: Salón Imperial
  const tenant = await prisma.tenant.create({
    data: {
      id: 'tenant-salon-imperial',
      name: 'Salón Imperial',
      slug: 'salon-imperial',
      logoUrl: '/logos/imperial.png',
      plan: 'BUSINESS',
      status: 'ACTIVE',
    },
  });

  // Secondary demo tenants
  const tenant2 = await prisma.tenant.create({
    data: {
      id: 'tenant-eventos-elegance',
      name: 'Eventos Elegance',
      slug: 'eventos-elegance',
      plan: 'PRO',
      status: 'ACTIVE',
    },
  });

  const tenant3 = await prisma.tenant.create({
    data: {
      id: 'tenant-jardin-real',
      name: 'Jardín Real',
      slug: 'jardin-real',
      plan: 'STARTER',
      status: 'ACTIVE',
    },
  });

  console.log('🏢 Tenants created:', [tenant.name, tenant2.name, tenant3.name]);

  // 2. Business Settings for Salón Imperial
  await prisma.businessSettings.create({
    data: {
      tenantId: tenant.id,
      commercialName: 'Salón Imperial',
      slogan: 'Eventos inolvidables y momentos mágicos',
      address: 'Av. Paseo de la Reforma 450, Col. Juárez, Cuauhtémoc, CDMX',
      phone: '+52 55 1234 5678',
      whatsapp: '+52 55 9876 5432',
      email: 'contacto@salonimperial.demo',
      website: 'https://salonimperial.demo',
      primaryColor: '#4f46e5',
      currency: 'MXN',
      timezone: 'America/Mexico_City',
      taxRate: 0.16,
      depositPercentage: 30.0,
      defaultHours: 5,
      extraHourPrice: 1500.0,
      policiesText: 'Para apartar la fecha se requiere un anticipo del 30% del total. El saldo restante debe liquidarse al menos 5 días hábiles previos a la fecha del evento. Cancelaciones con más de 60 días tienen 80% de reembolso; de 30 a 60 días 50%; con menos de 30 días el anticipo no es reembolsable.',
    },
  });

  // 3. Demo Users
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('Admin123!', salt);
  const ventasHash = await bcrypt.hash('Ventas123!', salt);
  const cajaHash = await bcrypt.hash('Caja123!', salt);
  const coordHash = await bcrypt.hash('Coord123!', salt);
  const superHash = await bcrypt.hash('Super123!', salt);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@eventia.demo',
      passwordHash: superHash,
      name: 'Super Admin Plataforma',
      role: 'SUPER_ADMIN',
      tenantId: null, // SaaS Global
      phone: '+52 55 0000 0000',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@salonimperial.demo',
      passwordHash: adminHash,
      name: 'Lic. Roberto Valdés',
      role: 'ADMIN',
      tenantId: tenant.id,
      phone: '+52 55 1111 2222',
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      email: 'ventas@salonimperial.demo',
      passwordHash: ventasHash,
      name: 'Mariana Silva',
      role: 'SALES',
      tenantId: tenant.id,
      phone: '+52 55 2222 3333',
    },
  });

  const cashierUser = await prisma.user.create({
    data: {
      email: 'caja@salonimperial.demo',
      passwordHash: cajaHash,
      name: 'Carlos Morales',
      role: 'CASHIER',
      tenantId: tenant.id,
      phone: '+52 55 3333 4444',
    },
  });

  const coordUser = await prisma.user.create({
    data: {
      email: 'coordinador@salonimperial.demo',
      passwordHash: coordHash,
      name: 'Valeria Méndez',
      role: 'COORDINATOR',
      tenantId: tenant.id,
      phone: '+52 55 4444 5555',
    },
  });

  const clienteHash = await bcrypt.hash('Cliente123!', salt);
  const clientUser = await prisma.user.create({
    data: {
      email: 'cliente@salonimperial.demo',
      passwordHash: clienteHash,
      name: 'Juan Pérez Hernández',
      role: 'CLIENT',
      tenantId: tenant.id,
      phone: '5512345678',
    },
  });

  console.log('👥 Demo users created for Salón Imperial & SaaS SuperAdmin');

  // 4. Venues / Espacios (3 salones)
  const venuePrincipal = await prisma.venue.create({
    data: {
      tenantId: tenant.id,
      name: 'Salón Principal',
      description: 'Gran salón climatizado con acabados de lujo en madera y mármol, iluminación inteligente y acústica profesional.',
      capacity: 350,
      basePrice: 10000.0,
      location: 'Planta Baja',
      imageUrl: '/venues/salon-principal.jpg',
      isActive: true,
    },
  });

  const venueJardin = await prisma.venue.create({
    data: {
      tenantId: tenant.id,
      name: 'Jardín Imperial',
      description: 'Hermoso jardín arbolado con fuentes iluminadas, pérgola para ceremonias y césped natural.',
      capacity: 220,
      basePrice: 8000.0,
      location: 'Área Exterior',
      imageUrl: '/venues/jardin.jpg',
      isActive: true,
    },
  });

  const venueTerraza = await prisma.venue.create({
    data: {
      tenantId: tenant.id,
      name: 'Terraza Panorámica',
      description: 'Espacio moderno al aire libre con vista a la ciudad, techado retráctil y barra de coctelería.',
      capacity: 130,
      basePrice: 6500.0,
      location: 'Piso 2',
      imageUrl: '/venues/terraza.jpg',
      isActive: true,
    },
  });

  // 5. Event Types (10 types)
  const eventTypeNames = [
    { name: 'Boda', color: '#ec4899', desc: 'Ceremonias nupciales y recepciones de gala' },
    { name: 'XV Años', color: '#a855f7', desc: 'Fiestas de quinceañera con protocolo tradicional y vals' },
    { name: 'Bautizo', color: '#38bdf8', desc: 'Celebraciones familiares y banquetes diurnos' },
    { name: 'Primera Comunión', color: '#fbbf24', desc: 'Reuniones íntimas y familiares de mediodía' },
    { name: 'Cumpleaños', color: '#10b981', desc: 'Festejos de cumpleaños para adultos y jóvenes' },
    { name: 'Graduación', color: '#6366f1', desc: 'Cenas baile y entrega de reconocimientos escolares' },
    { name: 'Evento Empresarial', color: '#0f172a', desc: 'Conferencias, premiaciones, convenciones y brindis de fin de año' },
    { name: 'Aniversario', color: '#f43f5e', desc: 'Bodas de plata, oro y aniversarios corporativos' },
    { name: 'Fiesta Infantil', color: '#f97316', desc: 'Celebraciones con juegos, botargas y shows para niños' },
    { name: 'Evento Personalizado', color: '#64748b', desc: 'Eventos temáticos con requerimientos especiales a medida' },
  ];

  const eventTypes = [];
  for (const et of eventTypeNames) {
    const created = await prisma.eventType.create({
      data: {
        tenantId: tenant.id,
        name: et.name,
        color: et.color,
        description: et.desc,
      },
    });
    eventTypes.push(created);
  }

  // 6. Menus (6 menús)
  const menuCarnitas = await prisma.menu.create({
    data: {
      tenantId: tenant.id,
      name: 'Menú Carnitas',
      description: 'Exquisitas carnitas estilo Michoacán doradas en cazo de cobre, acompañadas de guarniciones tradicionales mexicanas.',
      adultPrice: 300.0,
      childPrice: 180.0,
      maxChildAge: 10,
      freeUnderAge: 3,
      minGuests: 50,
      includedDishes: 'Carnitas surtidas (maciza, costilla, cuerito), Tortillas de comal hechas a mano, Salsa verde cruda, Salsa roja tatemada, Frijoles refritos con totopos, Arroz rojo tradicional, Limones, cebolla y cilantro',
      includedDrinks: 'Aguas frescas de frutas naturales (horchata y jamaica sin límite durante el banquete), Refrescos de línea Coca-Cola y hielo ilimitado',
      imageUrl: '/menus/carnitas.jpg',
      isActive: true,
    },
  });

  const menuGuisados = await prisma.menu.create({
    data: {
      tenantId: tenant.id,
      name: 'Menú Guisados',
      description: 'Tradicional cazuelada mexicana con variedad de 6 guisados gourmet a elegir servidos en barro caliente.',
      adultPrice: 200.0,
      childPrice: 140.0,
      maxChildAge: 10,
      freeUnderAge: 3,
      minGuests: 40,
      includedDishes: 'Tinga de pollo, Chicharrón en salsa verde, Mole poblano con pollo, Rajas poblanas con crema, Cochinita pibil, Picadillo ranchero, Arroz rojo y Frijoles charros',
      includedDrinks: 'Aguas frescas de horchata y tamarindo, refrescos y hielo',
      imageUrl: '/menus/guisados.jpg',
      isActive: true,
    },
  });

  const menuTaquiza = await prisma.menu.create({
    data: {
      tenantId: tenant.id,
      name: 'Menú Taquiza',
      description: 'Auténtica taquiza al pastor con trompo en vivo, bistec con queso, costilla y suadero.',
      adultPrice: 240.0,
      childPrice: 150.0,
      maxChildAge: 10,
      freeUnderAge: 3,
      minGuests: 50,
      includedDishes: 'Pastor con piña, Bistec encebollado, Costilla marinada, Gringas y quesadillas en tortilla de harina y maíz, Nopales asados, Cebollitas cambray y 4 salsas de la casa',
      includedDrinks: 'Aguas frescas artesanales, refresco y hielo',
      imageUrl: '/menus/taquiza.jpg',
      isActive: true,
    },
  });

  const menuBarbacoa = await prisma.menu.create({
    data: {
      tenantId: tenant.id,
      name: 'Menú Barbacoa',
      description: 'Barbacoa de carnero hidalguense cocida en horno de tierra con pencas de maguey y consomé caliente.',
      adultPrice: 320.0,
      childPrice: 190.0,
      maxChildAge: 10,
      freeUnderAge: 3,
      minGuests: 50,
      includedDishes: 'Consomé con garbanzo y arroz, Barbacoa suave de carnero, Pancita rellena, Tortillas azules hechas a mano, Salsa borracha con pulque, Aguacate y cebolla encurtida',
      includedDrinks: 'Aguas frescas de temporada, refresco y café de olla',
      imageUrl: '/menus/barbacoa.jpg',
      isActive: true,
    },
  });

  const menuBuffet = await prisma.menu.create({
    data: {
      tenantId: tenant.id,
      name: 'Menú Buffet Internacional',
      description: 'Banquete de gala a tres tiempos: Crema de nuez de castilla, Medallón de filete en salsa de oporto o Salmón a las finas hierbas y mesa de postres.',
      adultPrice: 450.0,
      childPrice: 250.0,
      maxChildAge: 10,
      freeUnderAge: 3,
      minGuests: 60,
      includedDishes: 'Primer tiempo: Crema de nuez o ensalada mediterránea; Segundo tiempo: Medallón de res con puré trufado y atado de espárragos; Postre: Cheesecake de frutos rojos',
      includedDrinks: 'Barra libre de cócteles sin alcohol, jugos naturales, refrescos, café gourmet y té',
      imageUrl: '/menus/buffet.jpg',
      isActive: true,
    },
  });

  const menuInfantil = await prisma.menu.create({
    data: {
      tenantId: tenant.id,
      name: 'Menú Infantil Especial',
      description: 'Menú dinámico y divertido para los más pequeños con nuggets de pechuga, minihamburguesas y papas.',
      adultPrice: 180.0,
      childPrice: 120.0,
      maxChildAge: 12,
      freeUnderAge: 3,
      minGuests: 20,
      includedDishes: 'Minihamburguesas con queso cheddar, Nuggets de pollo crujientes, Papas a la francesa sazonadas, Gelatina artística y vaso de nieve',
      includedDrinks: 'Jugos infantiles, agua embotellada y refresco',
      imageUrl: '/menus/infantil.jpg',
      isActive: true,
    },
  });

  // 7. Packages (3 paquetes)
  const pkgBasico = await prisma.package.create({
    data: {
      tenantId: tenant.id,
      name: 'Básico',
      description: 'Ideal para eventos sencillos donde el anfitrión provee sus propios alimentos o servicios especiales.',
      basePrice: 15000.0,
      includedGuests: 100,
      includedHours: 5,
      includedServices: JSON.stringify([
        'Salón climatizado por 5 horas de servicio',
        'Mesas redondas y sillas tipo Tiffany con cojín',
        'Mantelería blanca o marfil y cubremantel de color',
        'Personal de limpieza antes, durante y después del evento',
        'Cabina de sanitarios con insumos continuos',
      ]),
      extraGuestPrice: 80.0,
      extraHourPrice: 1500.0,
      isActive: true,
    },
  });

  const pkgIntermedio = await prisma.package.create({
    data: {
      tenantId: tenant.id,
      name: 'Intermedio',
      description: 'El paquete más popular: combina salón, banquete, servicio de meseros y ambientación musical.',
      basePrice: 35000.0,
      includedGuests: 100,
      includedHours: 5,
      includedServices: JSON.stringify([
        'Salón exclusivo por 5 horas de servicio',
        'Mobiliario completo con sillas Tiffany y mantelería fina',
        'Servicio de meseros (1 mesero por cada 20 invitados)',
        'Capitán de meseros y coordinador de tiempos',
        'Menú a elegir a precio preferencial',
        'Música ambiental con equipo de audio profesional',
        'Decoración básica con arreglos florales en mesa principal',
      ]),
      extraGuestPrice: 200.0,
      extraHourPrice: 1500.0,
      isActive: true,
    },
  });

  const pkgPremium = await prisma.package.create({
    data: {
      tenantId: tenant.id,
      name: 'Premium',
      description: 'Experiencia integral de lujo: salón, banquete de gala, DJ con iluminación robótica, barra libre y coordinador VIP.',
      basePrice: 55000.0,
      includedGuests: 100,
      includedHours: 6,
      includedServices: JSON.stringify([
        'Salón exclusivo por 6 horas de evento',
        'Menú gourmet a 3 tiempos incluido',
        'DJ profesional con consola, audio line-array y luces robóticas',
        'Pista de baile iluminada de cristal templado',
        'Decoración floral de autor en todas las mesas y arco de bienvenida',
        'Equipo de meseros uniformados y sommelier de servicio',
        'Pastel temático artesanal para los invitados',
        'Cabina de fotos 360° durante 2 horas con impresiones ilimitadas',
        'Coordinador general VIP dedicado durante toda la planeación',
      ]),
      extraGuestPrice: 350.0,
      extraHourPrice: 1800.0,
      isActive: true,
    },
  });

  // 8. Entertainments (10)
  const djEntertainment = await prisma.entertainment.create({
    data: {
      tenantId: tenant.id,
      name: 'DJ Profesional con Audio e Iluminación',
      description: 'DJ con consola Pioneer, sistema de audio de alta fidelidad, iluminación robótica DMX, rayo láser y micrófonos inalámbricos.',
      price: 5000.0,
      durationHours: 5,
      extraHourPrice: 1000.0,
      providerName: 'Beat & Lights Audio Pro',
      imageUrl: '/entertainment/dj.jpg',
      isActive: true,
    },
  });

  const mariachiEnt = await prisma.entertainment.create({
    data: {
      tenantId: tenant.id,
      name: 'Mariachi Imperial (10 elementos)',
      description: 'Conjunto de mariachi tradicional con trajes de gala, violines, trompetas, guitarrón y repertorio versátil.',
      price: 6500.0,
      durationHours: 1,
      extraHourPrice: 4500.0,
      providerName: 'Mariachi Alma de México',
      imageUrl: '/entertainment/mariachi.jpg',
      isActive: true,
    },
  });

  const bandaEnt = await prisma.entertainment.create({
    data: {
      tenantId: tenant.id,
      name: 'Banda Sinaloense en Vivo',
      description: 'Banda sinaloense de 14 integrantes con metales potentes, tambora y vocalistas.',
      price: 12000.0,
      durationHours: 2,
      extraHourPrice: 5000.0,
      providerName: 'Banda Reyna del Sur',
      isActive: true,
    },
  });

  const grupoMusicalEnt = await prisma.entertainment.create({
    data: {
      tenantId: tenant.id,
      name: 'Grupo Musical Versátil (7 integrantes)',
      description: 'Show en vivo con música de todas las décadas: cumbia, salsa, rock en español, pop y animación con souvenirs.',
      price: 16000.0,
      durationHours: 4,
      extraHourPrice: 3500.0,
      providerName: 'Sonora Dinastía',
      isActive: true,
    },
  });

  const robotLedEnt = await prisma.entertainment.create({
    data: {
      tenantId: tenant.id,
      name: 'Show Robot LED Gigante con Chisperos Fríos',
      description: 'Performance de robot LED de 2.8m con bazuca de co2 criogénico, chisperos fríos pirotécnicos y shots de bienvenida.',
      price: 3500.0,
      durationHours: 1,
      extraHourPrice: 2000.0,
      providerName: 'Robotic Party FX',
      isActive: true,
    },
  });

  const cabinaFotosEnt = await prisma.entertainment.create({
    data: {
      tenantId: tenant.id,
      name: 'Cabina Fotográfica 360° / Photobooth',
      description: 'Plataforma de video giratoria 360 grados con efectos de cámara lenta, filtros digitales y descarga inmediata vía QR.',
      price: 4500.0,
      durationHours: 3,
      extraHourPrice: 1200.0,
      providerName: 'Magic Memories Photobooth',
      isActive: true,
    },
  });

  const payasoEnt = await prisma.entertainment.create({
    data: {
      tenantId: tenant.id,
      name: 'Show Infantil Cómico y Mago',
      description: 'Espectáculo familiar con magia interactiva, rutinas cómicas sanas, malabares y globoflexia para todos los niños.',
      price: 2800.0,
      durationHours: 2,
      extraHourPrice: 900.0,
      providerName: 'Comisónicos Espectáculos',
      isActive: true,
    },
  });

  const animadorEnt = await prisma.entertainment.create({
    data: {
      tenantId: tenant.id,
      name: 'Animador de Protocolo y Maestro de Ceremonias',
      description: 'Conducción formal para presentación de quinceañeras, brindis nupcial, cronograma de protocolo y juegos de integración.',
      price: 3000.0,
      durationHours: 4,
      extraHourPrice: 800.0,
      providerName: 'Voz & Estilo Producciones',
      isActive: true,
    },
  });

  const sonideroEnt = await prisma.entertainment.create({
    data: {
      tenantId: tenant.id,
      name: 'Sonidero Tradicional con Vocoder y Saludos',
      description: 'Auténtico sonido de barrio con iluminación retro, saludos en vivo personalizados y repertorio sonidero clásico.',
      price: 7000.0,
      durationHours: 5,
      extraHourPrice: 1200.0,
      providerName: 'Sonido Sensación Latina',
      isActive: true,
    },
  });

  const inflablesEnt = await prisma.entertainment.create({
    data: {
      tenantId: tenant.id,
      name: 'Castillo Inflable Gigante con Resbaladilla y Monitor',
      description: 'Juego inflable certificado de 7x5 metros con monitor de seguridad para cuidado de los pequeños durante todo el evento.',
      price: 2200.0,
      durationHours: 5,
      extraHourPrice: 400.0,
      providerName: 'BrincaLandia Jumpers',
      isActive: true,
    },
  });

  // 9. Additional Services (10 servicios)
  const decoracionService = await prisma.additionalService.create({
    data: {
      tenantId: tenant.id,
      name: 'Decoración Temática y Arreglos Florales',
      description: 'Diseño integral de ambientación con backdrops personalizados, guirnaldas orgánicas de globos y centros de mesa florales naturales.',
      price: 4000.0,
      billingType: 'FIXED',
      isActive: true,
    },
  });

  const letrasGigantesService = await prisma.additionalService.create({
    data: {
      tenantId: tenant.id,
      name: 'Letras Gigantes Iluminadas (XV / BODA / LOVE / Nombres)',
      description: 'Letras volumétricas de madera de 1.20m de altura con focos vintage tipo Edison cálidos.',
      price: 2500.0,
      billingType: 'FIXED',
      isActive: true,
    },
  });

  const mesaDulcesService = await prisma.additionalService.create({
    data: {
      tenantId: tenant.id,
      name: 'Mesa de Dulces y Postres Gourmet (Candy Bar)',
      description: 'Exclusiva mesa con 12 variedades de dulces finos, botanas saladas, repostería miniatura y montaje temático.',
      price: 35.0,
      billingType: 'PER_PERSON',
      isActive: true,
    },
  });

  const pastelService = await prisma.additionalService.create({
    data: {
      tenantId: tenant.id,
      name: 'Pastel Temático Artesanal de Alta Repostería',
      description: 'Pastel de 3 pisos con diseño personalizado en fondant o buttercream, sabor a elegir entre 6 rellenos gourmet.',
      price: 3500.0,
      billingType: 'FIXED',
      isActive: true,
    },
  });

  const barraLibreService = await prisma.additionalService.create({
    data: {
      tenantId: tenant.id,
      name: 'Barra Libre Internacional de Coctelería (5 hrs)',
      description: 'Servicio de bartenders, licores reconocidos (tequila, ron, vodka, whisky), mezcladores, fruta y cristalería de cóctel.',
      price: 180.0,
      billingType: 'PER_PERSON',
      isActive: true,
    },
  });

  const meseroExtraService = await prisma.additionalService.create({
    data: {
      tenantId: tenant.id,
      name: 'Mesero Adicional Uniformado (Servicio 5 hrs)',
      description: 'Personal de servicio capacitado para atención a mesas o apoyo en barra y bebidas.',
      price: 600.0,
      billingType: 'PER_UNIT',
      isActive: true,
    },
  });

  const valetParkingService = await prisma.additionalService.create({
    data: {
      tenantId: tenant.id,
      name: 'Servicio de Valet Parking y Estacionamiento Seguro',
      description: 'Choferes con gafete, boletos numerados, póliza de seguro vehicular y vigilancia en estacionamiento privado.',
      price: 3200.0,
      billingType: 'FIXED',
      isActive: true,
    },
  });

  const fotografiaService = await prisma.additionalService.create({
    data: {
      tenantId: tenant.id,
      name: 'Cobertura Fotográfica y Video Digital',
      description: 'Fotógrafo profesional, sesión previa en locación, cobertura del evento, video editado en 4K y galería digital en la nube.',
      price: 7500.0,
      billingType: 'FIXED',
      isActive: true,
    },
  });

  const fuenteChocolateService = await prisma.additionalService.create({
    data: {
      tenantId: tenant.id,
      name: 'Fuente de Chocolate Belga con Frutas y Brochetas',
      description: 'Fuente de chocolate de 4 niveles con fresas, plátano, bombones, galletas y barquillos para 100 personas.',
      price: 2800.0,
      billingType: 'FIXED',
      isActive: true,
    },
  });

  const seguridadService = await prisma.additionalService.create({
    data: {
      tenantId: tenant.id,
      name: 'Elemento de Seguridad Privada y Control de Acceso',
      description: 'Guardia capacitado para recepción con lista de invitados, control de accesos y resguardo del perímetro.',
      price: 1200.0,
      billingType: 'PER_UNIT',
      isActive: true,
    },
  });

  // 10. Cancellation Policies
  await prisma.cancellationPolicy.createMany({
    data: [
      {
        tenantId: tenant.id,
        daysBeforeEvent: 60,
        refundPercentage: 80.0,
        description: 'Cancelaciones con más de 60 días naturales de anticipación reciben el 80% de reembolso del anticipo.',
      },
      {
        tenantId: tenant.id,
        daysBeforeEvent: 30,
        refundPercentage: 50.0,
        description: 'Cancelaciones entre 30 y 60 días antes del evento reciben el 50% de reembolso del monto anticipado.',
      },
      {
        tenantId: tenant.id,
        daysBeforeEvent: 0,
        refundPercentage: 0.0,
        description: 'Cancelaciones con menos de 30 días de anticipación no tienen derecho a reembolso de anticipo.',
      },
    ],
  });

  // 11. Suppliers (10 proveedores)
  const suppliersData = [
    { name: 'Alejandro Cárdenas', company: 'Beat & Lights Audio Pro', phone: '55 1234 4321', category: 'AUDIO_ILUMINACION', costNotes: 'Costo regular $3,500 por fecha' },
    { name: 'Chef Rogelio Montes', company: 'Banquetes y Carnitas Don Roge', phone: '55 2345 5432', category: 'ALIMENTOS', costNotes: 'Precio mayoreo por persona $180' },
    { name: 'Brenda Flores', company: 'Florería & Diseño Magnolia', phone: '55 3456 6543', category: 'DECORACION', costNotes: 'Márgenes de comisión 25%' },
    { name: 'Maestro Fernando Ruiz', company: 'Mariachi Alma de México', phone: '55 4567 7654', category: 'MUSICA_EN_VIVO', costNotes: 'Costo por hora $4,500' },
    { name: 'Laura Garza', company: 'Magic Memories Photobooth', phone: '55 5678 8765', category: 'FOTOGRAFIA', costNotes: 'Costo por evento $3,000' },
    { name: 'Ing. Héctor Salazar', company: 'Hielo & Bebidas del Centro', phone: '55 6789 9876', category: 'BEBIDAS', costNotes: 'Distribuidor directo refresquero' },
    { name: 'Claudia Domínguez', company: 'Pastelería Dolce Arte', phone: '55 7890 0987', category: 'REPOSTERIA', costNotes: 'Descuento 20% sobre carta' },
    { name: 'Lic. Gerardo Vega', company: 'Seguridad Privada Centinela', phone: '55 8901 1098', category: 'SEGURIDAD', costNotes: 'Guardia por turno $750' },
    { name: 'Sofía Navarro', company: 'BrincaLandia Inflables', phone: '55 9012 2109', category: 'INFLABLES', costNotes: 'Renta con operador $1,400' },
    { name: 'Marcos Rivas', company: 'Valet & Parking Soluciones', phone: '55 0123 3210', category: 'VALET', costNotes: 'Equipo de 3 choferes $2,000' },
  ];

  for (const s of suppliersData) {
    await prisma.supplier.create({
      data: {
        tenantId: tenant.id,
        name: s.name,
        company: s.company,
        phone: s.phone,
        whatsapp: s.phone,
        serviceCategory: s.category,
        costNotes: s.costNotes,
        notes: 'Proveedor verificado con cumplimiento oportuno.',
      },
    });
  }

  // 12. Employees (15 empleados)
  const employeesData = [
    { name: 'Valeria Méndez', roleCategory: 'COORDINATOR', phone: '55 1010 2020', wage: 150.0 },
    { name: 'Eduardo Rangel', roleCategory: 'CAPTAIN', phone: '55 2020 3030', wage: 120.0 },
    { name: 'Javier Domínguez', roleCategory: 'WAITER', phone: '55 3030 4040', wage: 85.0 },
    { name: 'Gabriel Ortega', roleCategory: 'WAITER', phone: '55 4040 5050', wage: 85.0 },
    { name: 'Daniela Soto', roleCategory: 'WAITER', phone: '55 5050 6060', wage: 85.0 },
    { name: 'Paola Ibarra', roleCategory: 'WAITER', phone: '55 6060 7070', wage: 85.0 },
    { name: 'Mateo Guerrero', roleCategory: 'WAITER', phone: '55 7070 8080', wage: 85.0 },
    { name: 'Carmen Salazar', roleCategory: 'COOK', phone: '55 8080 9090', wage: 110.0 },
    { name: 'Raúl Trejo', roleCategory: 'COOK', phone: '55 9090 0101', wage: 105.0 },
    { name: 'Rosa Hernández', roleCategory: 'CLEANING', phone: '55 0101 1212', wage: 75.0 },
    { name: 'Guadalupe Martínez', roleCategory: 'CLEANING', phone: '55 1212 2323', wage: 75.0 },
    { name: 'Ignacio Peralta', roleCategory: 'SECURITY', phone: '55 2323 3434', wage: 95.0 },
    { name: 'Oscar Velasco', roleCategory: 'DJ', phone: '55 3434 4545', wage: 200.0 },
    { name: 'Lucía Benítez', roleCategory: 'DECORATOR', phone: '55 4545 5656', wage: 130.0 },
    { name: 'Adrián Cordero', roleCategory: 'OTHER', phone: '55 5656 6767', wage: 90.0 },
  ];

  for (const emp of employeesData) {
    await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        name: emp.name,
        roleCategory: emp.roleCategory,
        phone: emp.phone,
        hourlyWage: emp.wage,
        isActive: true,
      },
    });
  }

  // 13. Inventory Items (20 items)
  const inventoryItemsData = [
    { name: 'Mesa redonda para 10 personas', category: 'MOBILIARIO', total: 40, avail: 38, unitCost: 1200 },
    { name: 'Mesa tablón rectangular 2.40m', category: 'MOBILIARIO', total: 25, avail: 25, unitCost: 1100 },
    { name: 'Silla Tiffany blanca con cojín', category: 'MOBILIARIO', total: 400, avail: 385, unitCost: 450 },
    { name: 'Silla Avant Garde plegable madera', category: 'MOBILIARIO', total: 150, avail: 145, unitCost: 550 },
    { name: 'Mantel redondo blanco tergal', category: 'MANTELERIA', total: 50, avail: 48, unitCost: 280 },
    { name: 'Mantel redondo color marfil', category: 'MANTELERIA', total: 45, avail: 45, unitCost: 280 },
    { name: 'Cubremantel satinado variedad colores', category: 'MANTELERIA', total: 120, avail: 110, unitCost: 120 },
    { name: 'Servilleta de tela de algodón', category: 'MANTELERIA', total: 500, avail: 480, unitCost: 35 },
    { name: 'Plato trinchero porcelana blanca 27cm', category: 'VAJILLA', total: 450, avail: 430, damaged: 5, unitCost: 85 },
    { name: 'Plato pastelero porcelana', category: 'VAJILLA', total: 400, avail: 390, unitCost: 55 },
    { name: 'Taza para café con plato porcelana', category: 'VAJILLA', total: 300, avail: 295, unitCost: 65 },
    { name: 'Copa de agua cristalina 12oz', category: 'CRISTALERIA', total: 450, avail: 435, damaged: 8, unitCost: 45 },
    { name: 'Copa de vino tinto cristal', category: 'CRISTALERIA', total: 350, avail: 340, unitCost: 50 },
    { name: 'Vaso highball 10oz para refresco', category: 'CRISTALERIA', total: 500, avail: 490, unitCost: 30 },
    { name: 'Juego de cubiertos de acero inox (3 pzas)', category: 'VAJILLA', total: 450, avail: 440, unitCost: 75 },
    { name: 'Bocina amplificada 15" JBL EON', category: 'AUDIO_LUCES', total: 6, avail: 6, unitCost: 8500 },
    { name: 'Luz robótica LED Wash RGBW', category: 'AUDIO_LUCES', total: 8, avail: 8, unitCost: 4200 },
    { name: 'Reflector par LED para jardín', category: 'AUDIO_LUCES', total: 16, avail: 16, unitCost: 950 },
    { name: 'Carpa impermeable 10x6 metros', category: 'DECORACION', total: 2, avail: 2, unitCost: 18000 },
    { name: 'Calentador ambiental de gas tipo hongo', category: 'MOBILIARIO', total: 6, avail: 6, unitCost: 3500 },
  ];

  for (const inv of inventoryItemsData) {
    await prisma.inventoryItem.create({
      data: {
        tenantId: tenant.id,
        name: inv.name,
        category: inv.category,
        totalQuantity: inv.total,
        availableQuantity: inv.avail,
        inUseQuantity: inv.total - inv.avail - (inv.damaged || 0),
        damagedQuantity: inv.damaged || 0,
        missingQuantity: 0,
        unitCost: inv.unitCost,
      },
    });
  }

  // 14. Customers (20 clientes)
  const customersData = [
    { name: 'Juan Pérez Hernández', email: 'cliente@salonimperial.demo', phone: '55 1234 5678', whatsapp: '5512345678', address: 'Insurgentes Sur 1820, CDMX', notes: 'Cliente VIP interesado en Boda en Salón Principal', userId: clientUser.id, whatsappVerified: true, emailVerified: true },
    { name: 'Patricia Alarcón', email: 'patricia.alarcon@hotmail.com', phone: '55 2345 6789', whatsapp: '5523456789', address: 'Col. Del Valle Norte, CDMX', notes: 'XV Años para su hija en Jardín Imperial' },
    { name: 'Miguel Ángel Navarro', email: 'miguel.navarro@outlook.com', phone: '55 3456 7890', whatsapp: '5534567890', address: 'Coyoacán, CDMX', notes: 'Evento Empresarial Fin de Año' },
    { name: 'Gabriela Montes', email: 'gaby.montes@empresa.com', phone: '55 4567 8901', whatsapp: '5545678901', address: 'Polanco, CDMX', notes: 'Bautizo con menú de guisados' },
    { name: 'Rodrigo Fuentes', email: 'rodrigo.fuentes@yahoo.com', phone: '55 5678 9012', whatsapp: '5556789012', address: 'San Ángel, CDMX', notes: 'Boda civil y banquete gourmet' },
    { name: 'Sofía Carmona', email: 'sofia.carmona@gmail.com', phone: '55 6789 0123', whatsapp: '5567890123', address: 'Álvaro Obregón, CDMX', notes: 'Graduación Medicina UNAM' },
    { name: 'Fernando Gómez', email: 'fgomez@techsolutions.mx', phone: '55 7890 1234', whatsapp: '5578901234', address: 'Santa Fe, CDMX', notes: 'Lanzamiento de producto corporativo' },
    { name: 'Mariana Elizalde', email: 'mariana.elizalde@gmail.com', phone: '55 8901 2345', whatsapp: '5589012345', address: 'Narvarte Poniente, CDMX', notes: 'Primera Comunión' },
    { name: 'Héctor Carranza', email: 'carranza.hector@gmail.com', phone: '55 9012 3456', whatsapp: '5590123456', address: 'Roma Norte, CDMX', notes: 'Cumpleaños sorpresa 50 años' },
    { name: 'Diana Villalobos', email: 'diana.v@gmail.com', phone: '55 0123 4567', whatsapp: '5501234567', address: 'Condesa, CDMX', notes: 'Aniversario Bodas de Plata' },
    { name: 'Carlos Slim Helú SA de CV', email: 'eventos@inbursa.com.mx', phone: '55 1122 3344', whatsapp: '5511223344', address: 'Paseo de las Palmas, CDMX', notes: 'Brindis ejecutivo' },
    { name: 'Verónica Estrada', email: 'vero.estrada@gmail.com', phone: '55 2233 4455', whatsapp: '5522334455', address: 'Lindavista, CDMX', notes: 'Fiesta infantil temática Dinosaurios' },
    { name: 'Alejandro Tapia', email: 'atapia@gmail.com', phone: '55 3344 5566', whatsapp: '5533445566', address: 'Satélite, Naucalpan', notes: 'XV Años' },
    { name: 'Elena Zúñiga', email: 'elena.zuniga@gmail.com', phone: '55 4455 6677', whatsapp: '5544556677', address: 'Tlalpan, CDMX', notes: 'Boda de plata' },
    { name: 'Mauricio Paz', email: 'mau.paz@gmail.com', phone: '55 5566 7788', whatsapp: '5555667788', address: 'Cuauhtémoc, CDMX', notes: 'Cumpleaños 40' },
    { name: 'Adriana Peñaloza', email: 'adri.penaloza@gmail.com', phone: '55 6677 8899', whatsapp: '5566778899', address: 'San Jerónimo, CDMX', notes: 'Boda' },
    { name: 'Ernesto Beltrán', email: 'ernesto.beltran@gmail.com', phone: '55 7788 9900', whatsapp: '5577889900', address: 'Benito Juárez, CDMX', notes: 'Graduación Prepa' },
    { name: 'Lorena Salgado', email: 'lore.salgado@gmail.com', phone: '55 8899 0011', whatsapp: '5588990011', address: 'Interlomas, Huixquilucan', notes: 'Baby Shower de lujo' },
    { name: 'Guillermo Pacheco', email: 'gpacheco@gmail.com', phone: '55 9900 1122', whatsapp: '5599001122', address: 'Mixcoac, CDMX', notes: 'Bautizo doble' },
    { name: 'Teresa Cárdenas', email: 'tere.cardenas@gmail.com', phone: '55 0011 2233', whatsapp: '5500112233', address: 'Clavería, Azcapotzalco', notes: 'Fiesta de Jubilación' },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        userId: c.userId || null,
        name: c.name,
        email: c.email,
        phone: c.phone,
        whatsapp: c.whatsapp,
        whatsappVerified: Boolean(c.whatsappVerified),
        emailVerified: Boolean(c.emailVerified),
        address: c.address,
        notes: c.notes,
      },
    });
    createdCustomers.push(cust);
  }

  console.log('👥 Customers created (20 customers including Juan Pérez)');

  // 15. Create Demo Quotes, Reservations, Events, Payments to back Dashboard metrics:
  // Requested Dashboard Metrics:
  // - VENTAS DEL MES: $184,500
  // - EVENTOS PRÓXIMOS: 8
  // - COTIZACIONES ABIERTAS: 12
  // - SALDOS PENDIENTES: $76,300

  // Dates helpers (relative to current date in late 2026 / current timeline)
  const now = new Date();
  const getFutureDate = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };
  const getPastDate = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  // Create 12 open quotes (DRAFT / SENT)
  for (let i = 1; i <= 12; i++) {
    const folio = `COT-2026-${String(i).padStart(5, '0')}`;
    const cust = createdCustomers[i % createdCustomers.length];
    const venue = i % 2 === 0 ? venuePrincipal : venueJardin;
    const evType = eventTypes[i % eventTypes.length];
    const adults = 80 + (i * 10);
    const date = getFutureDate(10 + i * 5);

    const quote = await prisma.quote.create({
      data: {
        folio,
        tenantId: tenant.id,
        customerId: cust.id,
        venueId: venue.id,
        packageId: pkgIntermedio.id,
        menuId: menuCarnitas.id,
        eventTypeId: evType.id,
        eventDate: date,
        startTime: '14:00',
        endTime: '19:00',
        durationHours: 5,
        extraHours: 0,
        adults: adults,
        children: 10,
        baseVenuePrice: venue.basePrice,
        packagePrice: 0,
        menuPrice: adults * 300,
        entertainmentTotal: 5000,
        servicesTotal: 4000,
        extraHoursTotal: 0,
        subtotal: venue.basePrice + (adults * 300) + 5000 + 4000,
        discountTotal: 0,
        taxRate: 0.16,
        taxTotal: (venue.basePrice + (adults * 300) + 5000 + 4000) * 0.16,
        total: (venue.basePrice + (adults * 300) + 5000 + 4000) * 1.16,
        status: i <= 4 ? 'SENT' : 'DRAFT',
        notes: `Cotización enviada para ${cust.name}`,
        createdById: salesUser.id,
      },
    });

    // Add snapshot items
    await prisma.quoteItem.createMany({
      data: [
        { quoteId: quote.id, type: 'VENUE', name: venue.name, quantity: 1, unitPrice: venue.basePrice, total: venue.basePrice },
        { quoteId: quote.id, type: 'MENU', name: 'Menú Carnitas', quantity: adults, unitPrice: 300, total: adults * 300 },
        { quoteId: quote.id, type: 'ENTERTAINMENT', name: 'DJ Profesional', quantity: 1, unitPrice: 5000, total: 5000 },
        { quoteId: quote.id, type: 'SERVICE', name: 'Decoración Temática', quantity: 1, unitPrice: 4000, total: 4000 },
      ],
    });
  }

  // 16. Create 8 Upcoming Events + Reservations (to match 8 eventos próximos)
  // Let's create events so that pending balance matches ~$76,300 and sales of month matches ~$184,500
  const upcomingConfig = [
    { custIdx: 1, days: 3, total: 52000, paid: 35000, name: 'Boda Patricia & David', venue: venuePrincipal, evType: eventTypes[0] },
    { custIdx: 2, days: 7, total: 48000, paid: 48000, name: 'XV Años Sofía', venue: venuePrincipal, evType: eventTypes[1] },
    { custIdx: 3, days: 12, total: 38500, paid: 20000, name: 'Convención Tech Solutions', venue: venueTerraza, evType: eventTypes[6] },
    { custIdx: 4, days: 16, total: 42000, paid: 15000, name: 'Bautizo Mateo Fuentes', venue: venueJardin, evType: eventTypes[2] },
    { custIdx: 5, days: 20, total: 55000, paid: 55000, name: 'Boda Carmona & Ortiz', venue: venuePrincipal, evType: eventTypes[0] },
    { custIdx: 6, days: 24, total: 34000, paid: 20000, name: 'Graduación Medicina', venue: venueJardin, evType: eventTypes[5] },
    { custIdx: 7, days: 28, total: 29000, paid: 15000, name: 'Aniversario Plata Gómez', venue: venueTerraza, evType: eventTypes[7] },
    { custIdx: 8, days: 32, total: 46000, paid: 15700, name: 'XV Años Mariana Elizalde', venue: venuePrincipal, evType: eventTypes[1] },
  ];

  let resIndex = 1;
  for (const item of upcomingConfig) {
    const folioRes = `RES-2026-${String(resIndex).padStart(5, '0')}`;
    const folioEvt = `EVT-2026-${String(resIndex).padStart(5, '0')}`;
    const cust = createdCustomers[item.custIdx];
    const eventDate = getFutureDate(item.days);
    const balance = item.total - item.paid;

    const reservation = await prisma.reservation.create({
      data: {
        folio: folioRes,
        tenantId: tenant.id,
        customerId: cust.id,
        venueId: item.venue.id,
        eventTypeId: item.evType.id,
        eventDate,
        startTime: '14:00',
        endTime: '21:00',
        adults: 120,
        children: 15,
        totalAmount: item.total,
        paidAmount: item.paid,
        balanceAmount: balance,
        status: 'CONFIRMED',
        notes: `Reservación confirmada para ${item.name}`,
        createdById: adminUser.id,
      },
    });

    const event = await prisma.event.create({
      data: {
        folio: folioEvt,
        tenantId: tenant.id,
        reservationId: reservation.id,
        customerId: cust.id,
        venueId: item.venue.id,
        eventTypeId: item.evType.id,
        name: item.name,
        eventDate,
        startTime: '14:00',
        endTime: '21:00',
        adults: 120,
        children: 15,
        totalAmount: item.total,
        paidAmount: item.paid,
        balanceAmount: balance,
        status: 'SCHEDULED',
        notes: 'Coordinación asignada con montaje estándar y prueba de sonido 2 horas antes.',
      },
    });

    // Create Payment if paid > 0
    if (item.paid > 0) {
      const folioPag = `PAG-2026-${String(resIndex).padStart(5, '0')}`;
      await prisma.payment.create({
        data: {
          folio: folioPag,
          tenantId: tenant.id,
          reservationId: reservation.id,
          eventId: event.id,
          customerId: cust.id,
          amount: item.paid,
          paymentType: item.paid === item.total ? 'SETTLEMENT' : 'DEPOSIT',
          paymentMethod: 'TRANSFER',
          reference: `SPEI-${847290 + resIndex}`,
          notes: 'Pago registrado por anticipo y confirmación de fecha.',
          receivedById: cashierUser.id,
          paymentDate: getPastDate(resIndex * 2),
        },
      });
    }

    // Create Contract
    const folioCon = `CON-2026-${String(resIndex).padStart(5, '0')}`;
    await prisma.contract.create({
      data: {
        folio: folioCon,
        tenantId: tenant.id,
        reservationId: reservation.id,
        eventId: event.id,
        customerId: cust.id,
        termsSnapshot: JSON.stringify({
          venue: item.venue.name,
          date: eventDate.toISOString().split('T')[0],
          guests: 120,
          total: item.total,
          deposit: item.paid,
          balance: balance,
        }),
        content: `CONTRATO DE PRESTACIÓN DE SERVICIOS PARA EVENTO SOCIAL CELEBRADO ENTRE SALÓN IMPERIAL Y ${cust.name.toUpperCase()}.`,
        status: 'SIGNED',
        signedAt: getPastDate(resIndex * 2),
      },
    });

    // Event Expenses
    await prisma.expense.create({
      data: {
        tenantId: tenant.id,
        eventId: event.id,
        category: 'COMIDA',
        description: 'Compra de insumos frescos y carne de primera para banquete',
        amount: Math.round(item.total * 0.32),
        date: getPastDate(1),
      },
    });

    resIndex++;
  }

  // Also add some past completed events with revenue for reports & past graphs
  for (let p = 1; p <= 6; p++) {
    const pastDate = getPastDate(p * 5);
    const cust = createdCustomers[(p + 10) % createdCustomers.length];
    const amount = 45000 + p * 4000;
    const folioEvt = `EVT-2026-${String(resIndex).padStart(5, '0')}`;
    const folioPag = `PAG-2026-${String(resIndex).padStart(5, '0')}`;

    const event = await prisma.event.create({
      data: {
        folio: folioEvt,
        tenantId: tenant.id,
        customerId: cust.id,
        venueId: venuePrincipal.id,
        eventTypeId: eventTypes[p % eventTypes.length].id,
        name: `Celebración Realizada - ${cust.name}`,
        eventDate: pastDate,
        startTime: '13:00',
        endTime: '20:00',
        adults: 100,
        children: 10,
        totalAmount: amount,
        paidAmount: amount,
        balanceAmount: 0,
        status: 'COMPLETED',
        notes: 'Evento concluido satisfactoriamente con felicitaciones del cliente.',
      },
    });

    await prisma.payment.create({
      data: {
        folio: folioPag,
        tenantId: tenant.id,
        eventId: event.id,
        customerId: cust.id,
        amount: amount,
        paymentType: 'SETTLEMENT',
        paymentMethod: 'TRANSFER',
        reference: `SPEI-HIST-${99000 + p}`,
        receivedById: cashierUser.id,
        paymentDate: pastDate,
      },
    });

    await prisma.expense.create({
      data: {
        tenantId: tenant.id,
        eventId: event.id,
        category: 'ALIMENTOS',
        description: 'Gasto de insumos banquete',
        amount: Math.round(amount * 0.30),
        date: pastDate,
      },
    });

    await prisma.expense.create({
      data: {
        tenantId: tenant.id,
        eventId: event.id,
        category: 'MUSICA',
        description: 'Honorarios DJ y staff de audio',
        amount: 4500,
        date: pastDate,
      },
    });

    resIndex++;
  }

  // 17. Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: adminUser.id,
      action: 'CREATE',
      entity: 'Tenant',
      entityId: tenant.id,
      metadata: JSON.stringify({ message: 'Inicialización de cuenta Salón Imperial' }),
    },
  });

  console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
  console.log('📊 Summary:');
  console.log('   - 3 Tenants (Salón Imperial, Elegance, Jardín Real)');
  console.log('   - 5 Users (Admin, Ventas, Caja, Coordinador, SuperAdmin)');
  console.log('   - 3 Venues (Salón Principal $10k, Jardín $8k, Terraza $6.5k)');
  console.log('   - 10 Event Types (Boda, XV Años, etc.)');
  console.log('   - 6 Menus (Carnitas $300, Guisados $200, Taquiza, Barbacoa, Buffet, Infantil)');
  console.log('   - 3 Packages (Básico, Intermedio, Premium)');
  console.log('   - 10 Entertainments (DJ $5k, Mariachi, Banda, Robot LED, etc.)');
  console.log('   - 10 Services (Decoración $4k, Barra libre, Letras gigantes, etc.)');
  console.log('   - 20 Customers (including Juan Pérez)');
  console.log('   - 10 Suppliers, 15 Employees, 20 Inventory items');
  console.log('   - 12 Open Quotes, 8 Upcoming Events, 6 Completed Events');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
