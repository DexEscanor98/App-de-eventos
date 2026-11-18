# EVENTIA — Plataforma SaaS Multi-Tenant para Salones de Eventos

> **Sistema administrativo integral de nivel empresarial para la gestión completa de salones de fiestas, banquetes, cotizaciones en vivo, prevención de doble reserva, cobranza y contratos.**

---

## 🌟 Características Principales

- **Arquitectura SaaS Multi-Tenant Real**: Aislamiento estricto de datos por `tenantId` para soportar múltiples salones o empresas de manera independiente en la misma plataforma.
- **Asistente de Cotización Guiado en 9 Pasos**:
  - Paso 1: Selección o registro de cliente al vuelo.
  - Paso 2: Selección de fecha, horarios y espacio físico.
  - Paso 3: Número de invitados adultos y menores.
  - Paso 4: Paquetes prediseñados o armado a la medida.
  - Paso 5: Menú y banquetes gastronómicos con tarifas diferenciadas.
  - Paso 6: Entretenimiento, grupos musicales, DJ profesional y shows.
  - Paso 7: Servicios adicionales (decoración temática, letras gigantes, mesa de dulces) y horas extras.
  - Paso 8: Descuentos comerciales (fijos o porcentuales).
  - Paso 9: Resumen interactivo con cálculo dinámico en tiempo real y snapshots inmutables (`QuoteItem`).
- **Motor de Precios Centralizado**:
  - Caso demo exacto: **100 adultos x $300 (Menú Carnitas: $30,000) + $10,000 Salón + $5,000 DJ + $4,000 Decoración + 2 horas extras ($3,000) = $52,000 MXN**.
- **Prevención de Doble Reservación (Anti-Double Booking)**: Validación atómica en servidor que impide solapamiento de horarios en un mismo salón:
  $$\text{newStart} < \text{existingEnd} \quad \land \quad \text{newEnd} > \text{existingStart}$$
- **Conversión de Cotización a Reservación sin Recaptura**: Genera folios secuenciales correlativos únicos (`COT-2026-XXXXX`, `RES-2026-XXXXX`, `EVT-2026-XXXXX`, `PAG-2026-XXXXX`, `CON-2026-XXXXX`).
- **Agenda y Calendario Visual**: Vistas mensuales sincronizadas, filtros por salón, indicadores de aforo y popup rápido de detalles.
- **Módulo de Pagos y Anticipos**:
  - Sugerencia automática del 30% de anticipo ($15,600 MXN sobre $52,000 MXN).
  - Recálculo en tiempo real del saldo pendiente ($36,400 MXN).
  - Registro de transferencias SPEI, efectivo, tarjeta y referencias bancarias.
- **Contratos Formales e Imprimibles**: Vista lista para impresión en papel o PDF con términos, condiciones y políticas de cancelación escalonadas.
- **Control de Operaciones**: Proveedores externos, personal operativo con asignación de turnos, control de piezas de inventario y gastos directos para visualización de utilidad neta por evento.
- **Reportes Ejecutivos**: Gráficas interactivas con Recharts para ventas mensuales, costos, utilidades, distribución de platillos y embudo de conversión.
- **Control de Acceso Basado en Roles (RBAC)**: Roles de Super Admin, Admin, Ventas, Caja, Coordinador y Empleado con selector rápido de 1 clic en login y topbar.

---

## 🛠️ Stack Tecnológico

- **Frontend & Framework**: Next.js 15+ App Router, React 19, TypeScript
- **Estilos & Diseño**: Tailwind CSS, Lucide Icons, Shadcn UI patterns
- **Base de Datos & ORM**: Prisma ORM, SQLite (desarrollo local zero-setup) / PostgreSQL (soporte Docker)
- **Gráficas & Fechas**: Recharts, date-fns
- **Validaciones & Seguridad**: Zod, bcryptjs, Cookies HTTPOnly seguras
- **Testing**: Vitest (7 pruebas unitarias aprobadas al 100%)

---

## 👥 Usuarios Demo Preconfigurados

Para facilitar la demostración ejecutiva, la pantalla de inicio de sesión (`/login`) y el menú superior (`Topbar`) incluyen un **Selector Rápido Demo (1 Clic)** para cambiar de perfil de forma instantánea:

| Perfil | Correo Demo | Contraseña | Alcance de Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@salonimperial.demo` | `Admin123!` | Acceso completo al negocio Salón Imperial |
| **Ventas** | `ventas@salonimperial.demo` | `Ventas123!` | Clientes, cotizaciones, disponibilidad y reservas |
| **Caja** | `caja@salonimperial.demo` | `Caja123!` | Registro de anticipos, abonos y saldos |
| **Coordinador** | `coordinador@salonimperial.demo` | `Coord123!` | Operación logística, staff, inventario y eventos |
| **Super Admin** | `superadmin@eventia.demo` | `Super123!` | Panel SaaS global de supervisión multiempresa |

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar y verificar entorno
```bash
# Variables de entorno ya configuradas en .env
cat .env
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Sincronizar base de datos y cargar Seed completo
```bash
npm run db:push
npm run db:seed
```

### 4. Ejecutar pruebas unitarias
```bash
npm test
```

### 5. Iniciar la aplicación
```bash
npm run dev
```
Abra en su navegador: **`http://localhost:3000`**

---

## 📋 El Recorrido de Demostración (Paso a Paso)

1. **Iniciar Sesión**: Ingrese en `/login` como Administrador (`admin@salonimperial.demo` / `Admin123!`) o haga clic en el botón de demo rápida.
2. **Dashboard**: Observe las estadísticas de datos reales: Ventas del Mes ($184,500), Eventos Próximos (8), Cotizaciones Abiertas (12), Saldos Pendientes ($76,300) y gráficas de ingresos.
3. **Clientes**: Vaya a `/customers` y compruebe el registro de **Juan Pérez**.
4. **Nueva Cotización**: Presione **"Nueva Cotización"** (`/quotes/new`):
   - Cliente: *Juan Pérez*
   - Salón: *Salón Principal* ($10,000)
   - Invitados: 100 adultos
   - Menú: *Menú Carnitas* ($300 x 100 = $30,000)
   - Show: *DJ Profesional* ($5,000)
   - Extras: *Decoración Temática* ($4,000) y 2 horas extra ($1,500 x 2 = $3,000)
   - **Resultado en Vivo**: El panel flotante calcula exactamente **$52,000 MXN**.
5. **Guardar y Convertir**: Guarde la cotización (`COT-2026-XXXXX`) y presione **"Convertir en Reservación"**.
6. **Verificar Disponibilidad**: El servidor valida anti-doble reserva y crea la reservación `RES-2026-XXXXX` y el evento `EVT-2026-XXXXX`.
7. **Agenda**: Consulte `/calendar` y vea la fecha programada con su badge de salón.
8. **Registrar Anticipo**: En la reservación, presione **"Registrar Anticipo / Pago"** y use el botón del 30%:
   - Anticipo registrado: **$15,600 MXN**
   - Saldo recalculado automáticamente: **$36,400 MXN**
9. **Contrato**: Presione **"Ver Contrato"** para visualizar el documento formal listo para imprimir o guardar en PDF.
10. **Reportes y Utilidad**: Visite `/reports` y `/expenses` para consultar la rentabilidad financiera por evento.

---

## 📚 Documentación Técnica y Ejecutiva

Toda la documentación técnica se encuentra en la carpeta `/docs`:

- [`docs/01-INTRODUCCION.md`](docs/01-INTRODUCCION.md): Contexto, problemática y solución.
- [`docs/02-PLANTEAMIENTO-PROBLEMA.md`](docs/02-PLANTEAMIENTO-PROBLEMA.md): Retos de la gestión manual de salones.
- [`docs/03-OBJETIVOS.md`](docs/03-OBJETIVOS.md): Objetivos generales y específicos.
- [`docs/04-REQUERIMIENTOS.md`](docs/04-REQUERIMIENTOS.md): Requisitos funcionales y no funcionales.
- [`docs/05-ARQUITECTURA.md`](docs/05-ARQUITECTURA.md): Diagramas Mermaid de arquitectura SaaS y flujos.
- [`docs/06-BASE-DE-DATOS.md`](docs/06-BASE-DE-DATOS.md): Diagrama Entidad-Relación (DER) y descripción de entidades.
- [`docs/07-CASOS-DE-USO.md`](docs/07-CASOS-DE-USO.md): Especificación de casos de uso paso a paso.
- [`docs/08-ROLES-PERMISOS.md`](docs/08-ROLES-PERMISOS.md): Matriz de permisos RBAC por rol.
- [`docs/09-MANUAL-USUARIO.md`](docs/09-MANUAL-USUARIO.md): Manual operativo paso a paso para usuarios.
- [`docs/10-MANUAL-TECNICO.md`](docs/10-MANUAL-TECNICO.md): Manual de arquitectura, servicios y base de datos.
- [`docs/11-INSTALACION.md`](docs/11-INSTALACION.md): Instrucciones completas para despliegue y ejecución.
- [`docs/12-PRUEBAS.md`](docs/12-PRUEBAS.md): Documentación de pruebas unitarias y funcionales.
- [`docs/13-CONCLUSIONES.md`](docs/13-CONCLUSIONES.md): Conclusiones ejecutivas y próximas fases.

---

## ⚖️ Licencia
Desarrollado para demostración ejecutiva del proyecto SaaS EVENTIA.
