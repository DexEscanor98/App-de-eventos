# 05. ARQUITECTURA DEL SISTEMA

## Visión Arquitectónica General
EVENTIA está construido sobre una arquitectura moderna basada en Next.js App Router (React 19 + TypeScript), diseñada con separación estricta de responsabilidades entre la capa de presentación (UI), lógica de dominio financiero (Domain/Pricing Engine), servicios de aplicación (Services/Availability) y capa de persistencia de datos (Prisma ORM con PostgreSQL / SQLite).

```mermaid
flowchart TD
    subgraph Cliente["Capa de Presentación (Frontend)"]
        Browser["Navegador Web / Mobile"]
        AppShell["Layout AppShell (Sidebar + Topbar)"]
        Pages["Páginas App Router (Server & Client Components)"]
        Charts["Visualizaciones Recharts & Lucide Icons"]
    end

    subgraph Servidor["Capa de Aplicación & Dominio (Next.js Backend)"]
        AuthLayer["Servicio de Sesiones & RBAC (Cookies HTTPOnly)"]
        PricingEngine["Motor de Precios Centralizado (Exact Currency)"]
        AvailabilityService["Servicio Anti-Double Booking (Time Overlap)"]
        FolioGenerator["Generador Secuencial de Folios (COT/RES/EVT/PAG/CON)"]
        RouteHandlers["API Route Handlers (/api/*)"]
    end

    subgraph Datos["Capa de Persistencia & Aislamiento (Database)"]
        PrismaORM["Prisma ORM (Client Singleton)"]
        TenantFilter["Filtro Obligatorio tenantId (Multi-Tenancy)"]
        Database[("Base de Datos Relacional PostgreSQL / SQLite")]
    end

    Browser --> AppShell
    AppShell --> Pages
    Pages --> RouteHandlers
    Pages --> PricingEngine
    RouteHandlers --> AuthLayer
    RouteHandlers --> AvailabilityService
    RouteHandlers --> FolioGenerator
    RouteHandlers --> PrismaORM
    PrismaORM --> TenantFilter
    TenantFilter --> Database
```

---

## Arquitectura SaaS Multi-Tenant
El sistema utiliza el patrón **Shared Database, Shared Schema with Discriminator Column (`tenantId`)**. Este patrón es el estándar de la industria para aplicaciones SaaS eficientes, permitiendo:
1. Despliegue ágil y escalabilidad uniforme.
2. Migraciones centralizadas sin replicar esquemas por cliente.
3. Garantía absoluta de aislamiento mediante validaciones a nivel de middleware y servicio en el backend.

```mermaid
graph TD
    Platform["EVENTIA SaaS Platform"]
    Tenant1["Tenant: Salón Imperial (ID: tenant-salon-imperial)"]
    Tenant2["Tenant: Eventos Elegance (ID: tenant-eventos-elegance)"]
    Tenant3["Tenant: Jardín Real (ID: tenant-jardin-real)"]

    Platform --> Tenant1
    Platform --> Tenant2
    Platform --> Tenant3

    Tenant1 --> Data1["Clientes, Salones, Cotizaciones, Pagos, Contratos propios"]
    Tenant2 --> Data2["Datos totalmente aislados de Tenant 2"]
    Tenant3 --> Data3["Datos totalmente aislados de Tenant 3"]
```

---

## Flujo Operativo y Comercial Continuo
El sistema garantiza que los datos fluyan de manera continua sin recaptura entre módulos:

```mermaid
flowchart LR
    A["Cliente Registrado"] --> B["Nueva Cotización (9 Pasos)"]
    B --> C["Cálculo en Vivo ($52,000)"]
    C --> D["Cotización Guardada (COT-2026-00001)"]
    D --> E["Conversión a Reservación"]
    E --> F["Validación Anti-Double Booking"]
    F --> G["Reservación (RES-2026-00001) + Evento"]
    G --> H["Agenda Visual / Calendario"]
    H --> I["Anticipo Registrado (PAG-2026-00001)"]
    I --> J["Saldo Calculado ($36,400)"]
    J --> K["Contrato Imprimible (CON-2026-00001)"]
```
