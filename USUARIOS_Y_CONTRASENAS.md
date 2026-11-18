# 🔐 Documento Oficial de Usuarios y Contraseñas — EVENTIA Pro SaaS

Este documento concentra **todas las cuentas de usuario pre-cargadas en la base de datos local (`prisma/dev.db`)**, sus roles RBAC, empresas (Tenants) asociadas y contraseñas de acceso directo, así como las instrucciones para registrar **Nuevos Dueños de Salón** y **Nuevos Clientes**.

---

## 1. Usuarios Pre-Cargados del Sistema (Listos para Iniciar Sesión en `/login`)

| # | Nombre Completo | Rol en el Sistema | Empresa / Salón (Tenant) | Correo Electrónico (Usuario) | Contraseña | Permisos y Alcance Principal |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Juan Pérez Hernández (Cliente VIP)** | `CLIENT` | **Salón Imperial** (`tenant-salon-imperial`) | `cliente@salonimperial.demo` | `Cliente123!` | **Portal Exclusivo del Cliente**: Entra directo a su perfil (`Mis Cotizaciones`), personaliza cotizaciones en 9 pasos, envía su cotización + PDF al WhatsApp del dueño, paga con Mercado Pago, explora salones con GPS y toma su foto/selfie de perfil. |
| **2** | **Super Admin Plataforma** | `SUPER_ADMIN` | Global (Todos los Salones SaaS) | `superadmin@eventia.demo` | `Super123!` | Panel global Multi-Tenant (`/super-admin`), auditoría de empresas, planes (`STARTER`, `PRO`, `BUSINESS`) e ingresos SaaS. |
| **3** | **Lic. Roberto Valdés** | `ADMIN` | **Salón Imperial** (`tenant-salon-imperial`) | `admin@salonimperial.demo` | `Admin123!` | **Dueño / Administrador Total**: Acceso completo a Dashboard, Agenda, Cotizaciones, Reservaciones, Eventos, Clientes, Salones, Menús, Paquetes, Pagos, Personal, Inventario, Gastos, Reportes y Configuración. |
| **4** | **Mariana Silva** | `SALES` | **Salón Imperial** (`tenant-salon-imperial`) | `ventas@salonimperial.demo` | `Ventas123!` | **Ejecutiva de Ventas y Cotizaciones**: Gestión de Clientes, Configurador de Cotizaciones en 9 pasos, Reservaciones y Agenda de Disponibilidad. |
| **5** | **Carlos Morales** | `CASHIER` | **Salón Imperial** (`tenant-salon-imperial`) | `caja@salonimperial.demo` | `Caja123!` | **Caja y Cobranza**: Registro de anticipos, liquidaciones, recibos, Mercado Pago y control de saldos por cobrar. |
| **6** | **Valeria Méndez** | `COORDINATOR` | **Salón Imperial** (`tenant-salon-imperial`) | `coordinador@salonimperial.demo` | `Coord123!` | **Coordinadora de Eventos**: Logística operativa, cronograma (timeline), asignación de personal, inventario y proveedores. |

> 💡 **Acceso en 1 Clic**: En la pantalla de [`/login`](http://localhost:3000/login) o desde el selector superior derecho del sistema (Topbar), puedes cambiar instantáneamente entre cualquiera de estos 5 usuarios sin necesidad de teclear la contraseña.

---

## 2. ¿Cómo Registrar un Nuevo Salón de Eventos (Nuevo Dueño)?

Si eres dueño de un salón nuevo y deseas dar de alta tu empresa desde cero:

1. Entra a [`/login`](http://localhost:3000/login) y haz clic en la tarjeta azul **"Registrar Mi Salón de Eventos (¿Eres nuevo dueño?)"**, o ingresa directamente a [`/register?mode=owner`](http://localhost:3000/register?mode=owner).
2. **Paso 1 (Perfil del Dueño)**:
   - Toma una **Selfie en vivo con tu cámara** o sube una **foto de tu galería**.
   - Ingresa tu **Nombre y Apellido Completos**, **Correo Electrónico**, **Contraseña**, **Teléfono** y **WhatsApp Oficial del Dueño** (a este número llegarán las cotizaciones y PDFs enviados por los clientes).
3. **Paso 2 (Datos de tu Empresa / Salón)**:
   - Nombre comercial del salón, Plan SaaS (`STARTER`, `PRO`, `BUSINESS`), RFC, Dirección física para **Apple Maps / Google Maps**, horarios de operación y porcentaje de anticipo requerido.
4. **Paso 3 (Configurar Todo desde el Inicio u Omitir para Más Adelante)**:
   - **Opción A — Configurar Todo Ahora**: Define tu primer espacio/salón (capacidad y precio base), tu primer menú (precio adulto/niño) y tu paquete principal.
   - **Opción B — Botón `"Omitir por ahora y configurar en cada apartado"`**: Crea tu cuenta inmediatamente y configura tus salones más adelante desde `/venues` (botón **"Agregar / Configurar Salón"**), tus menús en `/menus`, tus paquetes en `/packages` y tus ajustes en `/settings`.

---

## 3. ¿Cómo Registrarse como Nuevo Cliente?

Si eres un cliente nuevo que desea cotizar su evento, enviar su cotización por WhatsApp al dueño o pagar en línea con Mercado Pago:

1. Entra a [`/login`](http://localhost:3000/login) y haz clic en la tarjeta esmeralda **"Crear Cuenta y Cotizar Evento (¿Eres nuevo cliente?)"**, o ingresa directamente a [`/register?mode=client`](http://localhost:3000/register?mode=client).
2. **Foto de Perfil**:
   - Toma una **Selfie desde la cámara** (con vista espejo y captura instantánea) o **sube una foto de tu galería**.
3. **Datos Personales Verificados**:
   - **Nombre y Apellido Completos** (validado para que incluya nombre y apellido real).
   - **Correo Electrónico Real** y contraseña de acceso.
   - **Verificación de WhatsApp Real**: Ingresa tu número de WhatsApp de 10 dígitos, presiona **"Enviar Código"**, e introduce el código OTP de 6 dígitos para activar el sello **`WhatsApp Real Verificado`**.
   - **Salón de Eventos de Interés**, dirección completa y notas de tu evento.
4. Al finalizar, el sistema inicia tu sesión y te lleva directamente al **Configurador de Cotizaciones (`/quotes/new?customerId=...`)** con tu perfil de cliente ya vinculado.
