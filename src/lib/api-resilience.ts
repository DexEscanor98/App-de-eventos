// ============================================================================
// EVENTIA — Motor de APIs Externas, Mapas Nativos, Cuotas (Rate Limit)
// y Resiliencia de Red (Retry, Circuit Breaker & Offline Fallback)
// ============================================================================

export interface VenueGeoLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
  neighborhood: string;
  city: string;
  parkingInfo: string;
  valetAvailable: boolean;
}

export interface ApiQuotaMetric {
  id: 'MERCADO_PAGO_API' | 'MAPS_GEOCODING_API' | 'WHATSAPP_CLOUD_API' | 'WEB_PUSH_SERVICE';
  name: string;
  provider: string;
  usedToday: number;
  dailyLimit: number;
  usedMinute: number;
  minuteLimit: number;
  status: 'HEALTHY' | 'WARNING' | 'RATE_LIMITED' | 'FALLBACK_CACHE';
  latencyMs: number;
  lastCallAt: string;
  resetInSeconds: number;
}

export interface PushNotificationPayload {
  id: string;
  title: string;
  body: string;
  category: 'PAYMENT' | 'QUOTE' | 'MAP' | 'QUOTA' | 'NETWORK' | 'SYSTEM';
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
  read?: boolean;
}

const QUOTA_STORAGE_KEY = 'eventia_api_quotas_v1';
const PUSH_HISTORY_KEY = 'eventia_push_notifications_v1';

// Ubicaciones GPS reales para cada salón del sistema
const VENUE_COORDINATES_MAP: Record<string, VenueGeoLocation> = {
  principal: {
    lat: 19.42699,
    lng: -99.16768,
    formattedAddress: 'Av. Paseo de la Reforma 450, Juárez, Cuauhtémoc, 06600 Ciudad de México, CDMX',
    neighborhood: 'Paseo de la Reforma • Zona Financiera',
    city: 'Ciudad de México',
    parkingInfo: 'Estacionamiento subterráneo 3 niveles (250 cajones)',
    valetAvailable: true,
  },
  jardin: {
    lat: 19.43261,
    lng: -99.19621,
    formattedAddress: 'Av. Pdte. Masaryk 310, Polanco IV Secc, Miguel Hidalgo, 11550 Ciudad de México, CDMX',
    neighborhood: 'Polanco • frente a Parque Lincoln',
    city: 'Ciudad de México',
    parkingInfo: 'Valet Parking exclusivo en puerta principal',
    valetAvailable: true,
  },
  terraza: {
    lat: 19.35912,
    lng: -99.27185,
    formattedAddress: 'Av. Santa Fe 482, Cruz Manca, Cuajimalpa de Morelos, 05349 Ciudad de México, CDMX',
    neighborhood: 'Santa Fe • Sky District',
    city: 'Ciudad de México',
    parkingInfo: 'Helipuerto y estacionamiento VIP techado',
    valetAvailable: true,
  },
};

/**
 * Devuelve las coordenadas GPS y dirección exacta para cualquier salón.
 */
export function getVenueGeoLocation(venueName?: string | null, locationHint?: string | null): VenueGeoLocation {
  const normalized = `${venueName || ''} ${locationHint || ''}`.toLowerCase();
  if (normalized.includes('jardín') || normalized.includes('jardin') || normalized.includes('polanco')) {
    return VENUE_COORDINATES_MAP.jardin;
  }
  if (normalized.includes('terraza') || normalized.includes('sky') || normalized.includes('santa fe')) {
    return VENUE_COORDINATES_MAP.terraza;
  }
  return VENUE_COORDINATES_MAP.principal;
}

/**
 * Construye los enlaces profundos (Deep Links) para abrir la app nativa de mapas
 * instalada en el teléfono (iOS Apple Maps, Android/iOS Google Maps, Waze) o en PC.
 */
export function buildNativeMapNavigationLinks(params: {
  lat: number;
  lng: number;
  venueName: string;
  address: string;
}) {
  const { lat, lng, venueName, address } = params;
  const encodedLabel = encodeURIComponent(`${venueName} - ${address}`);

  // Apple Maps: En iPhone/iPad/Mac abre directamente la aplicación nativa Mapas con indicaciones
  const appleMapsUrl = `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&q=${encodedLabel}`;

  // Google Maps Universal Cross-Platform Link (abre app nativa en Android/iOS o web en PC)
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedLabel}&travelmode=driving`;

  // Waze Deep Link
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

  // OpenStreetMap / Embed Iframe URL sin requerir API key de pago obligatoria
  const bbox = `${lng - 0.0045}%2C${lat - 0.003}%2C${lng + 0.0045}%2C${lat + 0.003}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  return {
    appleMapsUrl,
    googleMapsUrl,
    wazeUrl,
    osmEmbedUrl,
  };
}

/**
 *Detecta si el dispositivo del usuario es del ecosistema Apple (iPhone, iPad, Mac)
 */
export function isAppleDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/i.test(navigator.userAgent || navigator.platform || '');
}

const DEFAULT_QUOTAS: ApiQuotaMetric[] = [
  {
    id: 'MERCADO_PAGO_API',
    name: 'Mercado Pago Checkout Pro API',
    provider: 'Mercado Libre FinTech',
    usedToday: 42,
    dailyLimit: 500,
    usedMinute: 3,
    minuteLimit: 60,
    status: 'HEALTHY',
    latencyMs: 118,
    lastCallAt: new Date().toISOString(),
    resetInSeconds: 54,
  },
  {
    id: 'MAPS_GEOCODING_API',
    name: 'Apple & Google Maps / Nominatim Geo API',
    provider: 'OSM & MapKit JS Bridge',
    usedToday: 128,
    dailyLimit: 1000,
    usedMinute: 8,
    minuteLimit: 60,
    status: 'HEALTHY',
    latencyMs: 84,
    lastCallAt: new Date().toISOString(),
    resetInSeconds: 42,
  },
  {
    id: 'WHATSAPP_CLOUD_API',
    name: 'WhatsApp Business PDF Gateway',
    provider: 'Meta / wa.me Deep Bridge',
    usedToday: 64,
    dailyLimit: 250,
    usedMinute: 4,
    minuteLimit: 30,
    status: 'HEALTHY',
    latencyMs: 65,
    lastCallAt: new Date().toISOString(),
    resetInSeconds: 38,
  },
  {
    id: 'WEB_PUSH_SERVICE',
    name: 'Web Push & Dynamic Island Notifications',
    provider: 'W3C Push API + Service Worker',
    usedToday: 95,
    dailyLimit: 1000,
    usedMinute: 5,
    minuteLimit: 120,
    status: 'HEALTHY',
    latencyMs: 22,
    lastCallAt: new Date().toISOString(),
    resetInSeconds: 60,
  },
];

export function getApiQuotas(): ApiQuotaMetric[] {
  if (typeof window === 'undefined') return DEFAULT_QUOTAS;
  try {
    const raw = window.localStorage.getItem(QUOTA_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(DEFAULT_QUOTAS));
      return DEFAULT_QUOTAS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_QUOTAS;
  }
}

export function consumeApiQuota(
  apiId: ApiQuotaMetric['id'],
  amount = 1
): { allowed: boolean; metric: ApiQuotaMetric } {
  const quotas = getApiQuotas();
  const idx = quotas.findIndex((q) => q.id === apiId);
  if (idx === -1) {
    return { allowed: true, metric: DEFAULT_QUOTAS[0] };
  }

  const q = { ...quotas[idx] };
  q.usedToday = Math.min(q.dailyLimit, q.usedToday + amount);
  q.usedMinute = q.usedMinute + amount;
  q.lastCallAt = new Date().toISOString();

  const ratio = q.usedToday / q.dailyLimit;
  if (q.usedMinute > q.minuteLimit || q.usedToday >= q.dailyLimit) {
    q.status = 'RATE_LIMITED';
  } else if (ratio >= 0.8) {
    q.status = 'WARNING';
  } else {
    q.status = 'HEALTHY';
  }

  quotas[idx] = q;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(quotas));
    window.dispatchEvent(new CustomEvent('eventia:quota-updated', { detail: quotas }));
  }

  return { allowed: q.status !== 'RATE_LIMITED', metric: q };
}

export function resetApiQuotas(): ApiQuotaMetric[] {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(DEFAULT_QUOTAS));
    window.dispatchEvent(new CustomEvent('eventia:quota-updated', { detail: DEFAULT_QUOTAS }));
  }
  return DEFAULT_QUOTAS;
}

/**
 * Dispara una Notificación Push tanto en el Dynamic Island de la interfaz como
 * en el Sistema Operativo (Web Push API / Service Worker) si el usuario dio permiso.
 */
export async function triggerPushNotification(
  payload: Omit<PushNotificationPayload, 'id' | 'timestamp'>
): Promise<PushNotificationPayload> {
  const fullPayload: PushNotificationPayload = {
    ...payload,
    id: `push-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  consumeApiQuota('WEB_PUSH_SERVICE', 1);

  if (typeof window !== 'undefined') {
    // 1. Guardar en historial local
    try {
      const existingRaw = window.localStorage.getItem(PUSH_HISTORY_KEY);
      const history: PushNotificationPayload[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [fullPayload, ...history].slice(0, 25);
      window.localStorage.setItem(PUSH_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }

    // 2. Emitir evento al Dynamic Island en vivo
    window.dispatchEvent(new CustomEvent('eventia:push-notification', { detail: fullPayload }));

    // 3. Emitir Notificación Nativa del Navegador / Sistema Operativo (macOS / iOS / Windows / Android)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(fullPayload.title, {
              body: fullPayload.body,
              icon: '/icons/icon-192.svg',
              badge: '/icons/icon-192.svg',
              tag: fullPayload.id,
              data: { url: fullPayload.actionUrl || '/dashboard' },
            });
            return fullPayload;
          }
        }
        new Notification(fullPayload.title, {
          body: fullPayload.body,
          icon: '/icons/icon-192.svg',
        });
      } catch {
        // Fallback silencioso a Dynamic Island
      }
    }
  }

  return fullPayload;
}

export function getPushHistory(): PushNotificationPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PUSH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Wrapper fetch con Manejo de Errores de Red, Timeout, Reintentos Exponenciales
 * y Control de Cuotas.
 */
export async function fetchWithResilience<T = any>(
  url: string,
  options: RequestInit & {
    quotaType?: ApiQuotaMetric['id'];
    retries?: number;
    timeoutMs?: number;
    fallbackData?: T;
  } = {}
): Promise<{ data: T; fromFallback: boolean; status: number }> {
  const {
    quotaType,
    retries = 2,
    timeoutMs = 8000,
    fallbackData,
    ...fetchOptions
  } = options;

  // 1. Verificar cuota si aplica
  if (quotaType) {
    const { allowed, metric } = consumeApiQuota(quotaType, 1);
    if (!allowed) {
      await triggerPushNotification({
        title: 'Límite de Cuota API Alcanzado (HTTP 429)',
        body: `${metric.name} superó su límite por minuto (${metric.minuteLimit} req/min). Activando caché local de respaldo.`,
        category: 'QUOTA',
      });
      if (fallbackData !== undefined) {
        return { data: fallbackData, fromFallback: true, status: 429 };
      }
      throw new Error(`Cuota agotada para ${metric.name}. Reintenta en ${metric.resetInSeconds}s.`);
    }
  }

  // 2. Verificar conexión de red del dispositivo
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    await triggerPushNotification({
      title: 'Modo Sin Conexión (Offline Activo)',
      body: 'Tu dispositivo perdió conexión a internet. Operando desde la Base de Datos Local de EVENTIA.',
      category: 'NETWORK',
    });
    if (fallbackData !== undefined) {
      return { data: fallbackData, fromFallback: true, status: 503 };
    }
    throw new Error('Sin conexión a internet. Verifica tu red Wi-Fi o datos móviles.');
  }

  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.status === 429) {
        await triggerPushNotification({
          title: 'Control de Cuota Activo (Rate Limit 429)',
          body: 'El servidor externo reportó alta demanda. Utilizando respuesta en caché segura.',
          category: 'QUOTA',
        });
        if (fallbackData !== undefined) {
          return { data: fallbackData, fromFallback: true, status: 429 };
        }
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Error HTTP ${response.status}`);
      }

      const data = (await response.json()) as T;
      return { data, fromFallback: false, status: response.status };
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;

      if (attempt < retries) {
        // Espera exponencial: 400ms, 800ms...
        await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
      }
    }
  }

  if (fallbackData !== undefined) {
    await triggerPushNotification({
      title: 'Recuperación Automática de Red',
      body: `No se pudo contactar con el servidor externo (${lastError?.message || 'Timeout'}). Se cargaron datos de respaldo local.`,
      category: 'NETWORK',
    });
    return { data: fallbackData, fromFallback: true, status: 503 };
  }

  throw lastError;
}
