'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Navigation,
  Compass,
  Car,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Users,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  getVenueGeoLocation,
  buildNativeMapNavigationLinks,
  triggerPushNotification,
  fetchWithResilience,
} from '@/lib/api-resilience';

interface VenueItem {
  id: string;
  name: string;
  description?: string | null;
  capacity: number;
  basePrice: number;
  location?: string | null;
  isActive: boolean;
  _count?: {
    reservations: number;
    events: number;
  };
}

interface VenueMapNavigatorProps {
  venues: VenueItem[];
  compact?: boolean;
  selectedVenueId?: string;
  onSelectVenue?: (venueId: string) => void;
}

export function VenueMapNavigator({
  venues,
  compact = false,
  selectedVenueId,
  onSelectVenue,
}: VenueMapNavigatorProps) {
  const [activeVenueId, setActiveVenueId] = useState<string>(
    selectedVenueId || venues[0]?.id || ''
  );
  const [searchAddress, setSearchAddress] = useState('');
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [mapState, setMapState] = useState<any | null>(null);
  const [fromFallbackCache, setFromFallbackCache] = useState(false);

  useEffect(() => {
    if (selectedVenueId && selectedVenueId !== activeVenueId) {
      setActiveVenueId(selectedVenueId);
    }
  }, [selectedVenueId]);

  const currentVenue =
    venues.find((v) => v.id === activeVenueId) || venues[0];

  const baseGeo = getVenueGeoLocation(currentVenue?.name, currentVenue?.location);
  const defaultNav = buildNativeMapNavigationLinks({
    lat: baseGeo.lat,
    lng: baseGeo.lng,
    venueName: currentVenue?.name || 'Salón Imperial',
    address: baseGeo.formattedAddress,
  });

  // Consultar la API Externa de Mapas con Resiliencia y Control de Cuotas
  useEffect(() => {
    if (!currentVenue) return;
    let cancelled = false;

    const loadVenueMapData = async () => {
      setLoadingGeo(true);
      try {
        const fallbackPayload = {
          venueName: currentVenue.name,
          provider: 'Caché Local GeoEngine',
          geo: baseGeo,
          navigation: defaultNav,
          quota: { limit: 60, remaining: 55, resetInSeconds: 60 },
        };

        const { data, fromFallback } = await fetchWithResilience(
          `/api/external/maps?venue=${encodeURIComponent(
            currentVenue.name
          )}&location=${encodeURIComponent(currentVenue.location || '')}`,
          {
            quotaType: 'MAPS_GEOCODING_API',
            timeoutMs: 4500,
            retries: 1,
            fallbackData: fallbackPayload,
          }
        );

        if (!cancelled) {
          setMapState(data);
          setFromFallbackCache(fromFallback);
        }
      } catch {
        if (!cancelled) {
          setMapState({
            venueName: currentVenue.name,
            provider: 'Caché Local Resiliente',
            geo: baseGeo,
            navigation: defaultNav,
          });
          setFromFallbackCache(true);
        }
      } finally {
        if (!cancelled) setLoadingGeo(false);
      }
    };

    loadVenueMapData();
    return () => {
      cancelled = true;
    };
  }, [activeVenueId]);

  const handleCustomAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAddress.trim() || !currentVenue) return;

    setLoadingGeo(true);
    try {
      const { data, fromFallback } = await fetchWithResilience(
        `/api/external/maps?venue=${encodeURIComponent(
          currentVenue.name
        )}&q=${encodeURIComponent(searchAddress.trim())}`,
        {
          quotaType: 'MAPS_GEOCODING_API',
          timeoutMs: 5000,
          retries: 1,
          fallbackData: mapState,
        }
      );

      setMapState(data);
      setFromFallbackCache(fromFallback);

      await triggerPushNotification({
        title: 'Ubicación Geocodificada en Mapa',
        body: `Coordenadas actualizadas para ${currentVenue.name}: ${data.geo.formattedAddress.slice(0, 65)}...`,
        category: 'MAP',
      });
    } finally {
      setLoadingGeo(false);
    }
  };

  const handleLaunchNativeNavigation = async (
    platform: 'APPLE' | 'GOOGLE' | 'WAZE',
    url: string
  ) => {
    const platformName =
      platform === 'APPLE'
        ? 'Apple Maps (iOS / macOS)'
        : platform === 'GOOGLE'
        ? 'Google Maps'
        : 'Waze GPS';

    await triggerPushNotification({
      title: `Abriendo Navegación en ${platformName}`,
      body: `Ruta activa hacia ${currentVenue?.name} (${activeGeo.formattedAddress.slice(0, 55)}...)`,
      category: 'MAP',
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const activeGeo = mapState?.geo || baseGeo;
  const activeNav = mapState?.navigation || defaultNav;

  return (
    <div className="space-y-6">
      {/* Selector de Salones en Píldoras Interactivas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {venues.map((v) => {
            const isSelected = v.id === currentVenue?.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setActiveVenueId(v.id);
                  if (onSelectVenue) onSelectVenue(v.id);
                }}
                className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]'
                    : 'apple-glass-card text-slate-700 hover:bg-white'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-indigo-600'}`} />
                <span>{v.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/15 text-sky-300' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {v.capacity} pers.
                </span>
              </button>
            );
          })}
        </div>

        {/* Estado de la API de Mapas y Cuota */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
          {loadingGeo ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Consultando API de Mapas...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {fromFallbackCache ? 'Modo Caché Resiliente' : 'API Mapas Activa'} • Cuota:{' '}
                <strong>{mapState?.quota?.remaining ?? 58}/60</strong> req/min
              </span>
            </>
          )}
        </div>
      </div>

      {/* Contenedor Principal del Mapa Apple Style + Panel de Navegación Nativa */}
      <div className="apple-glass-card rounded-[32px] overflow-hidden border border-white/90 shadow-xl grid grid-cols-1 lg:grid-cols-12">
        {/* Columna Izquierda: Mapa Interactivo Embebido (7 Cols) */}
        <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[420px] bg-slate-900">
          <iframe
            key={`${activeGeo.lat}-${activeGeo.lng}`}
            title={`Mapa de ubicación de ${currentVenue?.name}`}
            src={activeNav.osmEmbedUrl}
            className="w-full h-full min-h-[340px] sm:min-h-[420px] border-0"
            loading="lazy"
          />

          {/* Overlay Superior de Coordenadas GPS */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-xl text-white text-xs font-bold border border-white/15 shadow-lg flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '12s' }} />
              <span>{currentVenue?.name}</span>
              <span className="font-mono text-[10px] text-sky-300">
                {activeGeo.lat.toFixed(4)}° N, {Math.abs(activeGeo.lng).toFixed(4)}° W
              </span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Dirección, Buscador Geocoding y Botones Apple Maps / Google Maps (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-white/90">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 block">
                Ubicación Oficial y Navegación GPS
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {currentVenue?.name}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {activeGeo.neighborhood}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Dirección Exacta:</span>
                  <p className="text-slate-600 leading-relaxed mt-0.5">
                    {activeGeo.formattedAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60 text-slate-600">
                <Car className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{activeGeo.parkingInfo}</span>
              </div>
            </div>

            {/* Buscador en Vivo conectado a la API Externa de Geocodificación */}
            <form onSubmit={handleCustomAddressSearch} className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Probar Geocodificación API (Buscar otra sucursal o punto)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ej. Ángel de la Independencia, Polanco..."
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingGeo}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                >
                  Ubicar
                </button>
              </div>
            </form>
          </div>

          {/* BOTONES DE NAVEGACIÓN NATIVA (APPLE MAPS, GOOGLE MAPS, WAZE) */}
          <div className="space-y-3 pt-2 border-t border-slate-200/70">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Enviar Ruta al Mapa Instalado en tu Teléfono o PC
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Botón Apple Maps */}
              <button
                type="button"
                onClick={() => handleLaunchNativeNavigation('APPLE', activeNav.appleMapsUrl)}
                className="py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Abrir en Apple Maps</span>
              </button>

              {/* Botón Google Maps */}
              <button
                type="button"
                onClick={() => handleLaunchNativeNavigation('GOOGLE', activeNav.googleMapsUrl)}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>Abrir en Google Maps</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleLaunchNativeNavigation('WAZE', activeNav.wazeUrl)}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Car className="w-3.5 h-3.5 text-sky-600" />
                <span>Navegar con Waze</span>
              </button>

              {!compact && currentVenue && (
                <Link
                  href={`/quotes/new?venueId=${currentVenue.id}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Cotizar este Salón</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
