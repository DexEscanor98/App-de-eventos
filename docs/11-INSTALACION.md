# 11. GUÍA DE INSTALACIÓN Y PUESTA EN MARCHA

## Requisitos Previos
- **Node.js**: Versión 18 o superior (recomendado Node.js 20 LTS o 22+).
- **npm**: Versión 9 o superior (o pnpm / yarn).
- **Docker** (opcional): Únicamente si se desea ejecutar con base de datos PostgreSQL en contenedor. Para desarrollo local estándar, el proyecto incluye soporte zero-setup autónomo con SQLite.

---

## Paso 1: Clonar / Posicionarse en el Directorio
```bash
cd /Users/megumin/Downloads/Isamara2/Proyecto
```

---

## Paso 2: Configuración de Variables de Entorno
Cree o verifique el archivo `.env` en la raíz del proyecto. Puede tomar como referencia `.env.example`:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="eventia_super_secure_production_secret_key_2026_salon_imperial"
NODE_ENV="development"
DEFAULT_CURRENCY="MXN"
DEFAULT_TIMEZONE="America/Mexico_City"
PORT=3000
```

*(Si utiliza PostgreSQL vía Docker, cambie `DATABASE_URL="postgresql://postgres:postgrespassword2026@localhost:5432/eventia_db?schema=public"` y ejecute `docker compose up -d`)*.

---

## Paso 3: Instalación de Dependencias
```bash
npm install
```

---

## Paso 4: Generación de Cliente Prisma y Sincronización de Base de Datos
```bash
npm run db:generate
npm run db:push
```

---

## Paso 5: Carga de Datos Iniciales (Seed Completo)
Ejecute el script de seed para poblar automáticamente los 3 salones, los 6 menús, paquetes, 20 clientes demo (incluyendo a Juan Pérez), 15 cotizaciones, eventos y usuarios:
```bash
npm run db:seed
```

---

## Paso 6: Ejecución de Pruebas Unitarias
Compruebe que toda la lógica de negocio esté validada al 100%:
```bash
npm test
```

---

## Paso 7: Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible inmediatamente en:
👉 **`http://localhost:3000`**

---

## Paso 8: Inicio en Modo Producción (Opcional)
```bash
npm run build
npm run start
```
