# 07. CASOS DE USO PRINCIPALES

## CU-01: Autenticación e Inicio de Sesión
- **Actor Principal**: Administrador, Ventas, Caja, Coordinador o Super Admin.
- **Precondiciones**: Usuario registrado y activo en la base de datos del tenant.
- **Flujo Principal**:
  1. El usuario navega a `/login`.
  2. Ingresa su correo y contraseña (o selecciona un perfil demo en el selector rápido de 1 clic).
  3. El sistema valida las credenciales contra el hash bcrypt almacenado.
  4. Si es válido, se genera una cookie de sesión HTTPOnly segura y se redirige a `/dashboard`.

---

## CU-02: Registro y Búsqueda de Cliente
- **Actor**: Asesor de Ventas o Administrador.
- **Flujo Principal**:
  1. El asesor navega a `/customers`.
  2. Hace clic en "Registrar Nuevo Cliente".
  3. Ingresa nombre completo (ej. *Juan Pérez*), teléfono, WhatsApp y correo.
  4. El sistema valida la información con Zod y persiste el registro bajo el `tenantId`.
  5. El cliente aparece inmediatamente en el directorio con contador de eventos e historial.

---

## CU-03: Creación de Cotización con Motor de Cálculo en Vivo (El Caso Demostrable)
- **Actor**: Asesor de Ventas.
- **Flujo Principal**:
  1. El asesor inicia el Asistente de Cotización en `/quotes/new`.
  2. **Paso 1**: Selecciona al cliente *Juan Pérez*.
  3. **Paso 2**: Elige fecha del evento y selecciona el espacio *Salón Principal* ($10,000 MXN).
  4. **Paso 3**: Ingresa 100 adultos y 0 niños.
  5. **Paso 4**: Elige armado a la medida (sin paquete).
  6. **Paso 5**: Selecciona *Menú Carnitas* ($300 x 100 = $30,000 MXN).
  7. **Paso 6**: Agrega *DJ Profesional* ($5,000 MXN).
  8. **Paso 7**: Agrega *Decoración Temática* ($4,000 MXN) y 2 horas extra ($1,500 x 2 = $3,000 MXN).
  9. **Paso 8**: Descuentos (opcional).
  10. **Paso 9**: El panel lateral calcula en tiempo real con precisión matemática:
      $$\$10,000 + \$30,000 + \$5,000 + \$4,000 + \$3,000 = \$52,000 \text{ MXN}$$
  11. Hace clic en "Guardar Cotización". El sistema genera el folio `COT-2026-XXXXX` y los snapshots en `QuoteItem`.

---

## CU-04: Conversión de Cotización a Reservación con Validación Anti-Doble Reserva
- **Actor**: Asesor de Ventas o Administrador.
- **Flujo Principal**:
  1. En la vista de cotización `/quotes/[id]`, el asesor presiona "Convertir en Reservación".
  2. El servidor ejecuta `checkVenueAvailability`:
     - Consulta si existe otra reservación o evento activo en el *Salón Principal* que solape el horario:
       $$\text{newStart} < \text{existingEnd} \quad \land \quad \text{newEnd} > \text{existingStart}$$
  3. Al confirmar disponibilidad, genera la Reservación `RES-2026-XXXXX` y el Evento `EVT-2026-XXXXX`.
  4. Actualiza el estado de la cotización a `CONVERTED`.
  5. Redirige a la ficha de la reservación confirmada.

---

## CU-05: Registro de Anticipo del 30% y Cálculo Automático de Saldo
- **Actor**: Cajero o Administrador.
- **Flujo Principal**:
  1. En `/reservations/[id]`, el cajero hace clic en "Registrar Anticipo / Pago".
  2. El sistema sugiere con un botón el 30% requerido: **$15,600 MXN**.
  3. El cajero selecciona método (Transferencia SPEI), ingresa la clave de rastreo bancaria y confirma.
  4. El servidor registra el pago con folio `PAG-2026-XXXXX` y recalcula atómicamente:
     - Monto Pagado: **$15,600 MXN**
     - Saldo Pendiente: **$36,400 MXN** ($52,000 - $15,600)
  5. La interfaz refleja el nuevo saldo y actualiza el timeline de transacciones.

---

## CU-06: Emisión e Impresión de Contrato Legal
- **Actor**: Administrador o Coordinador.
- **Flujo Principal**:
  1. Hace clic en "Ver Contrato" desde la reservación.
  2. El sistema carga el documento legal con folio `CON-2026-XXXXX`, cláusulas de servicio y políticas de cancelación:
     - > 60 días: 80% reembolsable
     - 30 a 60 días: 50% reembolsable
     - < 30 días: Anticipo no reembolsable
  3. Presiona "Imprimir / Guardar en PDF" para emitir el contrato formal listo para firma.
