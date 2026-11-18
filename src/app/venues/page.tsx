import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  MapPin,
  Calendar,
  Compass,
  Navigation,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { VenueMapNavigator } from '@/components/venues/venue-map-navigator';
import { AddVenueModal } from '@/components/venues/add-venue-modal';
import {
  getVenueGeoLocation,
  buildNativeMapNavigationLinks,
} from '@/lib/api-resilience';

export default async function VenuesPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const venues = await prisma.venue.findMany({
    where: { tenantId },
    include: {
      _count: {
        select: { reservations: true, events: true },
      },
    },
    orderBy: { capacity: 'desc' },
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              API Externa de Mapas • Apple Maps & Google Maps GPS
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Salones, Ubicación GPS y Navegación
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Explora la ubicación exacta de cada salón y envía la ruta directo a Apple Maps o Google Maps en tu teléfono o PC
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <AddVenueModal />
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold shadow-md transition-all"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Ver Disponibilidad en Agenda</span>
            </Link>
          </div>
        </div>

        {/* Mapa Interactivo con API Externa + Navegación Nativa Apple/Google */}
        <VenueMapNavigator venues={venues} />

        {/* Tarjetas Individuales de cada Salón con Deep Links a Mapas Nativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {venues.map((venue) => {
            const geo = getVenueGeoLocation(venue.name, venue.location);
            const nav = buildNativeMapNavigationLinks({
              lat: geo.lat,
              lng: geo.lng,
              venueName: venue.name,
              address: geo.formattedAddress,
            });

            return (
              <div
                key={venue.id}
                className="apple-glass-card rounded-[28px] overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="h-44 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 p-5 flex flex-col justify-between relative overflow-hidden text-white">
                    <div className="flex items-center justify-between z-10">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 backdrop-blur-md border border-white/20">
                        {venue.isActive ? 'Disponible' : 'Mantenimiento'}
                      </span>
                      <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {geo.neighborhood.split('•')[0]}
                      </span>
                    </div>
                    <div className="z-10">
                      <h3 className="text-xl font-black tracking-tight">{venue.name}</h3>
                      <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        Capacidad hasta {venue.capacity} invitados
                      </p>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-sky-500/20 rounded-full blur-xl pointer-events-none" />
                  </div>

                  <div className="p-5 space-y-3 text-xs text-slate-600">
                    <p className="leading-relaxed text-slate-500">
                      {venue.description ||
                        'Espacio acondicionado con acabados de lujo y acústica arquitectónica.'}
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">
                        Dirección GPS Verificada
                      </span>
                      <p className="text-[11px] text-slate-700 font-medium line-clamp-2">
                        {geo.formattedAddress}
                      </p>
                    </div>

                    {/* Botones Rápidos a Mapas Nativos */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={nav.appleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Compass className="w-3.5 h-3.5 text-sky-400" />
                        <span>Apple Maps</span>
                      </a>
                      <a
                        href={nav.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Google Maps</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white/60 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                      Renta Base
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(venue.basePrice)}
                    </span>
                  </div>
                  <Link
                    href={`/quotes/new?venueId=${venue.id}`}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-full text-xs font-extrabold shadow-md transition-all"
                  >
                    Personalizar Cotización
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
