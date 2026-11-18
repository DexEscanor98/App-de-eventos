import { NextRequest, NextResponse } from 'next/server';
import {
  getVenueGeoLocation,
  buildNativeMapNavigationLinks,
} from '@/lib/api-resilience';

// Control de Cuotas en Memoria del Servidor (Rate Limiter por Tenant / IP)
const serverQuotaStore = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 60;

export async function GET(req: NextRequest) {
  const now = Date.now();
  const clientKey = req.headers.get('x-forwarded-for') || 'local-tenant';

  let record = serverQuotaStore.get(clientKey);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + 60_000 };
  }
  record.count += 1;
  serverQuotaStore.set(clientKey, record);

  const remaining = Math.max(0, MAX_REQUESTS_PER_MINUTE - record.count);
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  const { searchParams } = new URL(req.url);
  const venueName = searchParams.get('venue') || 'Salón Principal';
  const locationHint = searchParams.get('location') || '';
  const queryAddress = searchParams.get('q') || '';
  const simulateQuotaLimit = searchParams.get('simulate') === '429';

  // Si se supera la cuota por minuto o se solicita prueba de cuota agotada
  if (record.count > MAX_REQUESTS_PER_MINUTE || simulateQuotaLimit) {
    const fallbackGeo = getVenueGeoLocation(venueName, locationHint);
    const navLinks = buildNativeMapNavigationLinks({
      lat: fallbackGeo.lat,
      lng: fallbackGeo.lng,
      venueName,
      address: fallbackGeo.formattedAddress,
    });

    return NextResponse.json(
      {
        error: 'Límite de cuota de API de Mapas alcanzado (HTTP 429). Sirviendo coordenadas desde Caché Resiliente.',
        code: 'QUOTA_EXCEEDED_FALLBACK',
        fromCache: true,
        geo: fallbackGeo,
        navigation: navLinks,
        quota: {
          limit: MAX_REQUESTS_PER_MINUTE,
          remaining: 0,
          resetInSeconds: resetSeconds,
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_MINUTE),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(resetSeconds),
        },
      }
    );
  }

  // Coordenadas base del salón
  const baseGeo = getVenueGeoLocation(venueName, locationHint);
  let finalLat = baseGeo.lat;
  let finalLng = baseGeo.lng;
  let finalAddress = baseGeo.formattedAddress;
  let externalProvider = 'Apple MapKit & OpenStreetMap Hybrid GeoEngine';
  let fromExternalLive = false;

  // Si el usuario buscó una dirección específica, consultamos la API Externa de OpenStreetMap Nominatim con Timeout y Resiliencia
  if (queryAddress.trim().length > 3) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3200);
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        queryAddress
      )}`;
      const extRes = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'EventiaSaaS-Platform/2.0 (admin@salonimperial.demo)',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (extRes.ok) {
        const results = await extRes.json();
        if (Array.isArray(results) && results.length > 0) {
          finalLat = parseFloat(results[0].lat);
          finalLng = parseFloat(results[0].lon);
          finalAddress = results[0].display_name;
          externalProvider = 'OpenStreetMap Nominatim Live API';
          fromExternalLive = true;
        }
      }
    } catch {
      clearTimeout(timer);
      // Fallback silencioso a las coordenadas verificadas en base local
    }
  }

  const navigation = buildNativeMapNavigationLinks({
    lat: finalLat,
    lng: finalLng,
    venueName,
    address: finalAddress,
  });

  return NextResponse.json(
    {
      venueName,
      provider: externalProvider,
      fromExternalLive,
      geo: {
        ...baseGeo,
        lat: finalLat,
        lng: finalLng,
        formattedAddress: finalAddress,
      },
      navigation,
      quota: {
        limit: MAX_REQUESTS_PER_MINUTE,
        remaining,
        resetInSeconds: resetSeconds,
      },
    },
    {
      status: 200,
      headers: {
        'X-RateLimit-Limit': String(MAX_REQUESTS_PER_MINUTE),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(resetSeconds),
      },
    }
  );
}
