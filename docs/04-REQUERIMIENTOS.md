# 04. REQUERIMIENTOS DEL SISTEMA

## Requerimientos Funcionales (RF)

- **RF-01 (Autenticación y Sesiones)**: El sistema debe permitir inicio de sesión mediante correo y contraseña hasheados con bcrypt, soporte de roles RBAC y mecanismo de cambio rápido para demostraciones.
- **RF-02 (Aislamiento Multi-Tenant)**: Cada consulta y mutación a la base de datos debe filtrar estrictamente por el `tenantId` del usuario activo.
- **RF-03 (Directorio de Clientes)**: Crear, buscar en vivo por nombre/teléfono/correo, consultar historial financiero, cotizaciones, eventos y saldos de clientes.
- **RF-04 (Gestión de Salones y Espacios)**: Administrar espacios físicos con capacidad máxima, tarifa base de apartado y fotos descriptivas.
- **RF-05 (Catálogo de Menús y Banquetes)**: Configurar platillos, bebidas, precios por adulto, precios infantiles y edades máximas.
- **RF-06 (Catálogo de Paquetes)**: Configurar paquetes que incluyan horas base, número de invitados, servicios y precios por excedentes.
- **RF-07 (Catálogo de Entretenimiento y Shows)**: Administrar shows (DJ, bandas, mariachis, botargas, robots LED) con tarifas base y costo por hora extra.
- **RF-08 (Servicios Adicionales y Extras)**: Administrar decoración, letras gigantes, pasteles, mesas de dulces y extras con cobro fijo o por persona.
- **RF-09 (Asistente de Cotizaciones de 9 Pasos)**: Guía interactiva paso a paso (Cliente -> Espacio -> Invitados -> Paquete -> Menú -> Música -> Extras -> Descuentos -> Resumen).
- **RF-10 (Cálculo Financiero Dinámico en Vivo)**: Panel lateral flotante que recalcula en tiempo real cualquier modificación en invitados o conceptos agregados.
- **RF-11 (Inmutabilidad de Cotizaciones - Snapshots)**: Almacenamiento en `QuoteItem` de nombre, cantidad y precio unitario exactos al momento de la cotización.
- **RF-12 (Conversión Inmediata a Reservación)**: Botón de acción que transforma la cotización en reservación y evento sin recaptura de datos.
- **RF-13 (Prevención de Doble Reservación)**: Verificación en backend que rechaza cualquier apartado que se traslape con otro evento activo en el mismo salón y horario.
- **RF-14 (Agenda y Calendario Visual)**: Visualización de eventos mensuales con códigos de color, filtros por salón y drawer de detalles rápidos.
- **RF-15 (Registro de Pagos y Anticipos)**: Cobro de anticipos (sugerido 30%), abonos parciales y liquidaciones con folio secuencial `PAG-2026-XXXXX`.
- **RF-16 (Generación de Contratos)**: Redacción formal de contratos con políticas de cancelación escalonadas y estilos listos para impresión.
- **RF-17 (Reportes y Gráficas de Rendimiento)**: Gráficas de ventas mensuales, distribución de menús, embudo de conversión y margen neto de utilidades.
- **RF-18 (Panel Super Admin)**: Supervisión de todas las empresas dadas de alta en el SaaS con conteo de usuarios, clientes y eventos.

## Requerimientos No Funcionales (RNF)

- **RNF-01 (Rendimiento)**: Tiempos de respuesta de backend menores a 200 ms para consultas operativas estándar.
- **RNF-02 (Seguridad)**: Almacenamiento de contraseñas con salado criptográfico bcrypt (10 rondas), protección contra SQL Injection mediante Prisma ORM y cookies HTTPOnly seguras.
- **RNF-03 (Disponibilidad y Ejecución Local)**: Capacidad de ejecutarse localmente con PostgreSQL en Docker y en producción con PostgreSQL administrado.
- **RNF-04 (Diseño Visual Premium)**: Interfaz de usuario profesional basada en Tailwind CSS y variables de color sobrias tipo software corporativo premium.
- **RNF-05 (Compatibilidad y Responsividad)**: Interfaz adaptable a pantallas de escritorio, laptops, tablets y teléfonos inteligentes.
- **RNF-06 (Integridad Financiera)**: Manejo de importes monetarios redondeados con precisión a dos decimales, previniendo errores de punto flotante.
