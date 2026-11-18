# 09. MANUAL DE USUARIO

Bienvenido a **EVENTIA**, la plataforma SaaS de gestión integral para salones de eventos y banquetes. Este manual describe paso a paso cómo operar los módulos principales del sistema.

---

## 1. Inicio de Sesión y Acceso Rápido
1. Ingrese a la aplicación en su navegador (`http://localhost:3000`).
2. En la pantalla de login podrá ingresar sus credenciales tradicionales o utilizar los botones de **Acceso Rápido Demo (1 Clic)** para alternar entre roles (Administrador, Ventas, Caja, Coordinador, Super Admin) de manera instantánea durante una presentación ejecutiva.
3. Al autenticarse, el sistema lo dirigirá al **Dashboard Principal**.

---

## 2. Panel de Control (Dashboard)
El Dashboard presenta métricas clave de la empresa en tiempo real:
- **Ventas del Mes**: Monto facturado y recaudado en el periodo actual ($184,500 MXN en datos demo).
- **Eventos Próximos**: Conteo de eventos confirmados en agenda (8 eventos).
- **Cotizaciones Abiertas**: Propuestas en estatus borrador o enviadas en seguimiento (12 cotizaciones).
- **Saldos Pendientes**: Cartera acumulada por cobrar antes de la realización de los eventos ($76,300 MXN).
- **Gráfica de Evolución de Ingresos**: Tendencia histórica mensual.
- **Próximos Eventos y Pagos Recientes**: Listas rápidas con acceso directo a fichas operativas.

---

## 3. Gestión de Clientes
1. En el menú lateral izquierdo, seleccione **Clientes**.
2. Utilice la barra de búsqueda superior para localizar clientes por nombre, teléfono o correo.
3. Para registrar un nuevo cliente, presione el botón **"Registrar Nuevo Cliente"**:
   - Ingrese nombre completo (ej. *Juan Pérez*), teléfono celular, WhatsApp, correo y notas de interés.
   - Presione **Guardar Cliente**.
4. En la tabla resultante puede presionar **"Cotizar"** para iniciar una propuesta directa con los datos precargados del cliente, o presionar la flecha para ver el historial financiero completo del cliente.

---

## 4. Asistente de Cotización de 9 Pasos
Para generar una cotización formal:
1. Haga clic en **"+ Nueva Cotización"** desde el Topbar o el menú lateral.
2. Navegue por el asistente guiado:
   - **Paso 1 (Cliente)**: Busque y seleccione al cliente (ej. *Juan Pérez*).
   - **Paso 2 (Fecha y Salón)**: Seleccione la fecha deseada, horarios y el espacio físico (ej. *Salón Principal* a $10,000 MXN).
   - **Paso 3 (Invitados)**: Ingrese 100 adultos y 0 niños.
   - **Paso 4 (Paquete)**: Elija "A la Medida / Sin Paquete" o un paquete prediseñado.
   - **Paso 5 (Menú)**: Seleccione *Menú Carnitas* ($300 MXN x 100 = $30,000 MXN).
   - **Paso 6 (Entretenimiento)**: Marque *DJ Profesional con Audio e Iluminación* ($5,000 MXN).
   - **Paso 7 (Extras)**: Marque *Decoración Temática* ($4,000 MXN) y configure 2 horas adicionales ($1,500 x 2 = $3,000 MXN).
   - **Paso 8 (Descuento)**: Aplique un descuento si el cliente cuenta con promoción autorizada.
   - **Paso 9 (Resumen)**: Observe el desglose exacto calculado por el motor:
     - Renta de Salón: $10,000
     - Menú Carnitas: $30,000
     - DJ Profesional: $5,000
     - Decoración: $4,000
     - 2 Horas Extras: $3,000
     - **TOTAL**: **$52,000 MXN**
3. Presione **"Guardar Cotización"** para asignarle el folio `COT-2026-XXXXX` con snapshots inmutables, o presione **"Convertir en Reservación"** para confirmar la fecha de inmediato.

---

## 5. Conversión a Reservación y Prevención de Doble Reserva
1. En la vista de cotización, presione **"Convertir en Reservación"**.
2. El sistema validará automáticamente que ningún otro evento o reservación activa ocupe el mismo salón en ese horario.
3. Al aprobarse, se generará la reservación con folio `RES-2026-XXXXX` y el evento en agenda `EVT-2026-XXXXX`.

---

## 6. Registro de Anticipo y Control de Saldos
1. Ingrese a la reservación creada.
2. Haga clic en **"Registrar Anticipo / Pago"**.
3. El modal le sugerirá automáticamente el 30% correspondiente para apartar la fecha: **$15,600 MXN**.
4. Seleccione el método de pago (ej. Transferencia SPEI) e ingrese la referencia bancaria.
5. Al guardar el pago, el sistema recalculará en tiempo real:
   - **Anticipo Registrado**: **$15,600 MXN**
   - **Saldo Pendiente**: **$36,400 MXN** ($52,000 - $15,600)
6. El pago queda registrado en el timeline auditable con su folio `PAG-2026-XXXXX`.

---

## 7. Agenda y Calendario Visual
1. Acceda al módulo **Agenda** en el menú lateral.
2. Navegue entre meses con los controles de flecha.
3. Filtre por salón si desea consultar exclusivamente la disponibilidad del *Salón Principal*, *Jardín Imperial* o *Terraza Panorámica*.
4. Haga clic sobre cualquier evento para abrir el modal de inspección rápida con horarios, cliente, aforo y estado de cobranza.

---

## 8. Contratos e Impresión
1. Desde la reservación, presione **"Ver Contrato"**.
2. Se desplegará el documento formal con cláusulas de prestación de servicios, desglose de pagos, políticas de cancelación y firmas.
3. Presione **"Imprimir / Guardar en PDF"** para abrir el diálogo nativo del sistema con estilos limpios sin barras laterales.
