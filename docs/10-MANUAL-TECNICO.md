# 10. MANUAL TÉCNICO

## Arquitectura de Carpetas y Código Fuente
La estructura del proyecto sigue las mejores prácticas de Next.js App Router y TypeScript estricto:

```text
/Proyecto
├── src/
│   ├── app/                          # Rutas Next.js App Router (Páginas y APIs)
│   │   ├── api/                      # Route Handlers RESTful
│   │   │   ├── auth/                 # Login, logout, fast-login
│   │   │   ├── customers/            # GET / POST clientes
│   │   │   ├── menus/                # GET menús
│   │   │   ├── payments/             # GET / POST pagos y recalculo atómico
│   │   │   ├── quotes/               # GET / POST cotizaciones con snapshot
│   │   │   │   └── [id]/convert/     # POST conversión con anti-double booking
│   │   │   ├── reservations/         # GET reservaciones
│   │   │   ├── settings/             # POST actualización configuración
│   │   │   └── venues/               # GET / POST salones
│   │   ├── calendar/                 # Vista interactiva de agenda
│   │   ├── contracts/[id]/           # Vista formal imprimible de contratos
│   │   ├── customers/                # Directorio y detalle de clientes
│   │   ├── dashboard/                # Panel ejecutivo con gráficos Recharts
│   │   ├── entertainment/            # Catálogo de shows y amenidades
│   │   ├── events/                   # Fichas logísticas de eventos
│   │   ├── expenses/                 # Gastos y cálculo de utilidad neta
│   │   ├── inventory/                # Control de activos y piezas
│   │   ├── login/                    # Pantalla de inicio de sesión y demo
│   │   ├── menus/                    # Catálogo de banquetes y platillos
│   │   ├── packages/                 # Catálogo de paquetes integrales
│   │   ├── payments/                 # Historial de cobranza y abonos
│   │   ├── quotes/                   # Listado y Asistente de cotización (/new)
│   │   ├── reports/                  # Métricas consolidadas y analítica
│   │   ├── reservations/             # Reservaciones y saldos
│   │   ├── services/                 # Servicios extras
│   │   ├── settings/                 # Configuración comercial del salón
│   │   ├── staff/                    # Personal operativo
│   │   ├── super-admin/              # Panel SaaS de supervisión de empresas
│   │   ├── globals.css               # Estilos Tailwind CSS y reglas @media print
│   │   ├── layout.tsx                # Root layout HTML
│   │   └── page.tsx                  # Redirección raíz según sesión
│   ├── components/                   # Componentes modulares de UI
│   │   ├── calendar/                 # Vista interactiva del calendario
│   │   ├── contracts/                # Contrato formal para impresión
│   │   ├── customers/                # Tabla interactiva y modal de clientes
│   │   ├── dashboard/                # Gráficas Recharts del dashboard
│   │   ├── layout/                   # Sidebar, Topbar y AppShell
│   │   ├── payments/                 # Tabla de cobranza y modal de abonos
│   │   ├── quotes/                   # Asistente de 9 pasos y vista de detalle
│   │   ├── reports/                  # Gráficas de rendimiento y embudo
│   │   ├── reservations/             # Detalle de reservación y timeline
│   │   └── settings/                 # Formulario de configuración de negocio
│   └── lib/                          # Capa de Dominio, Servicios y Utilidades
│       ├── auth.ts                   # Manejo de sesiones seguras por cookies
│       ├── availability.ts           # Servicio anti-doble reserva (Time Overlap)
│       ├── folios.ts                 # Generador secuencial de folios por tenant
│       ├── pricing-engine.ts         # Motor centralizado de cálculo financiero
│       ├── prisma.ts                 # Instancia Singleton de Prisma Client
│       ├── rbac.ts                   # Matriz de roles y verificación de permisos
│       └── utils.ts                  # Formateadores de moneda, fechas y badges
├── prisma/
│   ├── schema.prisma                 # Esquema relacional Multi-Tenant
│   └── seed.js                       # Script de carga de datos demo completos
├── tests/
│   └── pricing-and-availability.test.ts # Suite de pruebas unitarias con Vitest
├── docker-compose.yml                # Configuración PostgreSQL en contenedor
├── .env.example                      # Plantilla de variables de entorno
└── package.json                      # Dependencias y scripts de ejecución
```

---

## Servicios Centrales de Negocio

### 1. `pricing-engine.ts`
Desacoplado de la interfaz de usuario. Recibe los parámetros del evento y ejecuta las sumatorias monetarias redondeando a 2 decimales (`roundCurrency`):
```typescript
export function calculateQuote(params: QuoteCalculationParams): QuoteCalculationResult {
  // 1. Renta de salón base
  // 2. Menú de adultos y niños
  // 3. Horas extras ($1,500/hr)
  // 4. Shows y entretenimiento
  // 5. Servicios adicionales (por persona o precio fijo)
  // 6. Descuentos porcentuales o fijos
  // 7. Retorno de items desglosados para snapshot inmutable
}
```

### 2. `availability.ts`
Implementa la lógica algorítmica de solapamiento de intervalos de tiempo:
$$\text{newStart} < \text{existingEnd} \quad \land \quad \text{newEnd} > \text{existingStart}$$
Ignorando reservaciones con estado `CANCELLED` y excluyendo opcionalmente el registro actual para permitir reprogramaciones.

### 3. `folios.ts`
Asegura que cada tenant cuente con folios correlativos únicos de 5 dígitos con formato:
`[PREFIJO]-[AÑO]-[SECUENCIA]` (ejemplo: `COT-2026-00001`, `RES-2026-00001`, `PAG-2026-00001`).
