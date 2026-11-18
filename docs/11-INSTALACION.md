# 11. GUÍA DE INSTALACIÓN Y PUESTA EN MARCHA

## Requisitos Previos
- **Node.js**: Versión 18 o superior (recomendado Node.js 20 LTS o 22+).
- **npm**: Versión 9 o superior (o pnpm / yarn).
- **Docker**: Necesario para ejecutar PostgreSQL localmente. En producción, conecte una base PostgreSQL del Marketplace de Vercel (por ejemplo Neon o Supabase).

---

## Paso 1: Clonar / Posicionarse en el Directorio
```bash
cd /Users/megumin/Downloads/Isamara2/Proyecto
```

---

## Paso 2: Configuración de Variables de Entorno
Cree o verifique el archivo `.env` en la raíz del proyecto. Puede tomar como referencia `.env.example`:

```env
DATABASE_URL="postgresql://postgres:eventia_local_dev@localhost:5432/eventia_db?schema=public"
DATABASE_URL_POOLED="postgresql://postgres:eventia_local_dev@localhost:5432/eventia_db?schema=public"
AUTH_SECRET="reemplaza-por-una-clave-aleatoria-de-al-menos-32-caracteres"
ENABLE_DEMO_LOGIN=true
NODE_ENV="development"
DEFAULT_CURRENCY="MXN"
DEFAULT_TIMEZONE="America/Mexico_City"
PORT=3000
```

Inicie PostgreSQL local con `docker compose up -d`. En Vercel, agregue una integración PostgreSQL desde Marketplace y compruebe que `DATABASE_URL` esté configurada para Production, Preview y Development. No copie credenciales en el repositorio.

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

## Despliegue en Vercel

1. En el proyecto de Vercel, conecte PostgreSQL desde el Marketplace. La integración Prisma Postgres configura `DATABASE_URL` para tareas de esquema y `DATABASE_URL_POOLED` para consultas de la aplicación.
2. En **Settings → Environment Variables**, configure `AUTH_SECRET` con un valor aleatorio de al menos 32 caracteres. Configure `ENABLE_DEMO_LOGIN=true` solo si necesita accesos rápidos sin contraseña durante la presentación; de lo contrario quedan desactivados en producción.
3. Aplique los cambios al repositorio y espere el despliegue automático. El script `vercel-build` sincroniza el esquema, carga los datos demo solo si la base aún no tiene tenants y ejecuta el build. Las siguientes compilaciones preservan los datos existentes.
4. El comando manual `npm run db:seed` borra registros al volver a ejecutarse; no lo uses contra una base que ya tenga datos. Las contraseñas demo están publicadas en el README, así que no almacenes datos reales en esta instancia.
