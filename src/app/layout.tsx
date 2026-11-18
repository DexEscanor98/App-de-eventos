import type { Metadata, Viewport } from 'next';
import './globals.css';

// App routes read live PostgreSQL data; don't query the database during the build.
export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#090d16',
};

export const metadata: Metadata = {
  title: 'EVENTIA Pro — Salones, Cotizaciones, Mapas & Mercado Pago',
  description:
    'Plataforma SaaS Apple Experience para administración de salones de eventos, cotizaciones personalizadas, navegación Apple/Google Maps, notificaciones Push y pagos.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EVENTIA Pro',
  },
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full antialiased font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
