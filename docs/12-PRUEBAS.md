# 12. PRUEBAS Y VALIDACIÓN DEL SISTEMA

## Estrategia de Pruebas
La calidad del software en EVENTIA se garantiza mediante una estrategia en tres niveles:
1. **Pruebas Unitarias Automatizadas (Vitest)**: Validación matemática del motor de cotizaciones, descuentos porcentuales y fijos, anticipos, prevención de doble reserva y matriz RBAC.
2. **Pruebas de Integración y API**: Verificación de endpoints RESTful para creación de cotizaciones, conversión a reservaciones con chequeo de conflictos, y registro de pagos con recálculo atómico de saldos.
3. **Pruebas de Compilación y Tipos (Next.js Build & TypeScript)**: Compilación estricta sin errores de tipado en 35 rutas y componentes.

---

## Resultados de las Pruebas Automatizadas

```text
 ✓ tests/pricing-and-availability.test.ts (7 tests)
   ✓ 1. Motor de Precios y Cotizaciones - EVENTIA > calcula con precisión matemática el caso demo exacto de 52,000 MXN (1ms)
   ✓ 1. Motor de Precios y Cotizaciones - EVENTIA > aplica descuento fijo y porcentual correctamente (0ms)
   ✓ 1. Motor de Precios y Cotizaciones - EVENTIA > calcula anticipo del 30% y saldo resultante con exactitud milimétrica (0ms)
   ✓ 2. Prevención de Doble Reservación (Anti-Double Booking) > detecta solapamientos usando la regla: newStart < existingEnd AND newEnd > existingStart (0ms)
   ✓ 3. Matriz de Roles y Permisos RBAC > garantiza que SALES puede cotizar pero NO gestionar configuración ni borrar tenants (0ms)
   ✓ 3. Matriz de Roles y Permisos RBAC > garantiza que CASHIER puede cobrar pagos pero NO crear cotizaciones (0ms)
   ✓ 3. Matriz de Roles y Permisos RBAC > garantiza que ADMIN tiene control total sobre el negocio (0ms)

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  639ms
```

---

## Matriz de Casos de Prueba Funcionales

| ID | Módulo | Caso de Prueba | Resultado Esperado | Estatus |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Autenticación | Login con credenciales válidas e inválidas | Generación de cookie segura HTTPOnly o rechazo 401 | **PASADO** |
| **TC-02** | Clientes | Registro de Juan Pérez y búsqueda en vivo | Aparece inmediatamente en lista con conteo de eventos | **PASADO** |
| **TC-03** | Cotizador | Selección: 100 adultos, Menú Carnitas ($30k), Salón ($10k), DJ ($5k), Decoración ($4k), 2 hrs extra ($3k) | Total exacto: **$52,000 MXN** desglosado | **PASADO** |
| **TC-04** | Cotizador | Snapshots inmutables en QuoteItem | Precios congelados en base de datos independientes de catálogos | **PASADO** |
| **TC-05** | Reservación | Conversión de cotización a reservación | Asignación de folio `RES-2026-XXXXX` sin recaptura | **PASADO** |
| **TC-06** | Disponibilidad | Intento de doble reservación en mismo horario | Bloqueo por servidor con código HTTP 409 y mensaje descriptivo | **PASADO** |
| **TC-07** | Pagos | Registro de anticipo del 30% ($15,600) | Recálculo automático de saldo pendiente: **$36,400 MXN** | **PASADO** |
| **TC-08** | Calendario | Visualización de eventos mensuales y filtro de salón | Indicadores de color y popup con aforo y horarios | **PASADO** |
| **TC-09** | Contratos | Generación con políticas de cancelación y botón imprimir | Formato formal listo para imprimir sin elementos de UI | **PASADO** |
| **TC-10** | SaaS Multi-Tenant| Aislamiento de consultas por tenantId | Cero cruce de datos entre Salón Imperial y otros tenants | **PASADO** |
