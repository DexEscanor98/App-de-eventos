# 03. OBJETIVOS DEL SISTEMA

## Objetivo General
Diseñar, implementar y desplegar una plataforma SaaS (Software as a Service) multi-tenant moderna, robusta y de alto rendimiento denominada **EVENTIA**, que permita a empresas y administradores de salones de eventos automatizar el ciclo integral de clientes, catálogos gastronómicos, cotizaciones con cálculo dinámico en tiempo real, prevención estricta de doble reserva, conversión a reservaciones, registro auditable de pagos y generación de contratos formales.

## Objetivos Específicos

1. **Aislamiento Multi-Tenant Estricto**:
   Garantizar la independencia total de datos entre empresas registradas en la plataforma SaaS mediante una arquitectura de aislamiento por `tenantId` en cada consulta de lectura y escritura.

2. **Motor Centralizado de Precios e Inmutabilidad Financiera**:
   Desarrollar un motor de cálculo desacoplado de la interfaz gráfica que compute con precisión matemática:
   $$\text{Total} = (\text{Salón} + \text{Paquete} + \text{Menús} + \text{Horas Extra} + \text{Música} + \text{Extras} - \text{Descuentos}) \times (1 + \text{IVA})$$
   Preservando copias inmutables de los conceptos y precios pactados en entidades de snapshot (`QuoteItem`, `EventItem`).

3. **Prevención Algorítmica de Doble Reservación**:
   Implementar una validación atómica en el backend que impida programar dos reservaciones o eventos activos en el mismo espacio físico cuando exista solapamiento temporal:
   $$\text{newStart} < \text{existingEnd} \quad \land \quad \text{newEnd} > \text{existingStart}$$

4. **Flujo Comercial sin Recaptura de Información**:
   Habilitar un flujo continuo donde una cotización aceptada se transforme en reservación y evento operativo con un único clic, conservando automáticamente los importes, fechas y especificaciones del cliente.

5. **Auditoría de Pagos y Control Automático de Saldos**:
   Registrar anticipos y abonos con folios secuenciales únicos por tenant (`PAG-2026-XXXXX`), recalculando de forma atómica el saldo pendiente sin intervención manual.

6. **Generación Inmediata de Contratos Imprimibles**:
   Ofrecer una vista formal de contrato de adhesión con cláusulas legales, políticas de cancelación escalonadas y firmas de conformidad, lista para impresión en papel o exportación en PDF.

7. **Control de Acceso Basado en Roles (RBAC)**:
   Proteger la plataforma con perfiles diferenciados: Super Admin, Administrador de Salón, Ventas, Caja, Coordinador de Eventos y Personal Operativo.
