# 06. BASE DE DATOS Y MODELO DE DATOS

## Modelo Entidad-Relación (DER)
El esquema relacional de EVENTIA está completamente normalizado en Prisma ORM, con claves foráneas, índices por tenant y preservación de snapshots inmutables:

```mermaid
erDiagram
    TENANT ||--o{ BUSINESS_SETTINGS : has
    TENANT ||--o{ USER : employs
    TENANT ||--o{ CUSTOMER : serves
    TENANT ||--o{ VENUE : owns
    TENANT ||--o{ MENU : offers
    TENANT ||--o{ PACKAGE : offers
    TENANT ||--o{ ENTERTAINMENT : provides
    TENANT ||--o{ ADDITIONAL_SERVICE : provides
    TENANT ||--o{ QUOTE : creates
    TENANT ||--o{ RESERVATION : manages
    TENANT ||--o{ EVENT : executes
    TENANT ||--o{ PAYMENT : receives
    TENANT ||--o{ CONTRACT : issues
    TENANT ||--o{ SUPPLIER : contracts
    TENANT ||--o{ EMPLOYEE : hires
    TENANT ||--o{ INVENTORY_ITEM : stocks
    TENANT ||--o{ EXPENSE : incurs
    TENANT ||--o{ AUDIT_LOG : tracks

    CUSTOMER ||--o{ QUOTE : requests
    CUSTOMER ||--o{ RESERVATION : books
    CUSTOMER ||--o{ EVENT : hosts
    CUSTOMER ||--o{ PAYMENT : makes
    CUSTOMER ||--o{ CONTRACT : signs

    VENUE ||--o{ QUOTE : hosts
    VENUE ||--o{ RESERVATION : hosts
    VENUE ||--o{ EVENT : hosts

    QUOTE ||--o{ QUOTE_ITEM : contains
    QUOTE ||--o{ RESERVATION : converts_to

    RESERVATION ||--o{ EVENT : generates
    RESERVATION ||--o{ PAYMENT : receives
    RESERVATION ||--o{ CONTRACT : binds

    EVENT ||--o{ EVENT_ITEM : contains
    EVENT ||--o{ EVENT_STAFF : assigns
    EVENT ||--o{ EXPENSE : generates
    EVENT ||--o{ PAYMENT : receives
```

---

## Descripción de Entidades Principales

### 1. `Tenant` & `BusinessSettings`
- **Tenant**: Representa cada empresa o salón independiente (`id`, `name`, `slug`, `plan`, `status`).
- **BusinessSettings**: Parámetros operativos y comerciales del salón (`commercialName`, `currency`, `timezone`, `taxRate`, `depositPercentage`, `extraHourPrice`, `policiesText`).

### 2. `User` (RBAC)
- Almacena las credenciales y perfiles de acceso (`email`, `passwordHash` con bcrypt, `name`, `role`).
- `tenantId` es nulo únicamente para el `SUPER_ADMIN` global de la plataforma SaaS.

### 3. `Customer`
- Información de contacto y comerciales del cliente (`name`, `phone`, `whatsapp`, `email`, `address`, `notes`).
- Posee borrado lógico (`deletedAt`) para preservar trazabilidad fiscal.

### 4. `Venue` (Espacios del Salón)
- Espacios físicos administrados (`name`, `capacity`, `basePrice`, `location`, `isActive`).

### 5. `Menu`, `Package`, `Entertainment`, `AdditionalService`
- Catálogos comerciales con precios por persona, tarifas fijas y condiciones de servicio.

### 6. `Quote` & `QuoteItem` (Snapshots Inmutables)
- `Quote`: Folio único (`COT-2026-XXXXX`), cliente, salón, fechas, desglose financiero (`subtotal`, `discountTotal`, `total`) y estado (`DRAFT`, `SENT`, `ACCEPTED`, `CONVERTED`).
- `QuoteItem`: **Snapshot inmutable** que copia textualmente el concepto, precio unitario y cantidad acordados al emitir la cotización. Modificaciones futuras a catálogos no alteran las cotizaciones emitidas.

### 7. `Reservation` & `Event`
- `Reservation`: Folio `RES-2026-XXXXX`, salón, horario, cliente, monto total, anticipos pagados y saldo pendiente en tiempo real.
- `Event`: Folio `EVT-2026-XXXXX`, logística operativa, personal asignado y gastos directos.

### 8. `Payment`
- Transacciones de pago y anticipos con folio `PAG-2026-XXXXX`. Vinculado a la reservación y cliente con método de pago, referencia bancaria y usuario que recibió el abono.

### 9. `Contract`
- Snapshot legal del contrato con folio `CON-2026-XXXXX`, términos acordados, políticas de cancelación y firmas.

### 10. `AuditLog`
- Registro de auditoría de todas las acciones críticas del sistema (`CREATE`, `UPDATE`, `PAYMENT`, etc.) con fecha, usuario y metadata en formato JSON.
