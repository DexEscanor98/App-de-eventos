'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Wifi,
  WifiOff,
  Download,
  Smartphone,
  Laptop,
  Activity,
  ShieldAlert,
  CheckCircle2,
  X,
  Sparkles,
  RefreshCw,
  MapPin,
  CreditCard,
  MessageCircle,
  Zap,
} from 'lucide-react';
import {
  ApiQuotaMetric,
  PushNotificationPayload,
  getApiQuotas,
  resetApiQuotas,
  triggerPushNotification,
  getPushHistory,
  consumeApiQuota,
} from '@/lib/api-resilience';

export function AppleDynamicIslandHub() {
  const [isOnline, setIsOnline] = useState(true);
  const [activeToast, setActiveToast] = useState<PushNotificationPayload | null>(null);
  const [history, setHistory] = useState<PushNotificationPayload[]>([]);
  const [quotas, setQuotas] = useState<ApiQuotaMetric[]>([]);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    setQuotas(getApiQuotas());
    setHistory(getPushHistory());

    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }

    // Detectar si ya corre instalada como PWA Standalone
    const standaloneMatch =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneMatch);

    // Registrar Service Worker PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration info:', err);
      });
    }

    // Capturar evento de instalación nativa PWA en PC y Android
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleOnline = () => {
      setIsOnline(true);
      triggerPushNotification({
        title: 'Conexión Restablecida (Online)',
        body: 'Sincronizando Base Local con el servidor y APIs externas en tiempo real.',
        category: 'NETWORK',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      triggerPushNotification({
        title: 'Red Desconectada • Modo Offline Resiliente',
        body: 'EVENTIA sigue funcionando con tu Base de Datos Local y Caché PWA sin perder cambios.',
        category: 'NETWORK',
      });
    };

    const handlePushEvent = (e: Event) => {
      const custom = e as CustomEvent<PushNotificationPayload>;
      if (custom.detail) {
        setActiveToast(custom.detail);
        setHistory(getPushHistory());
      }
    };

    const handleQuotaUpdate = (e: Event) => {
      const custom = e as CustomEvent<ApiQuotaMetric[]>;
      if (custom.detail) {
        setQuotas(custom.detail);
      } else {
        setQuotas(getApiQuotas());
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('eventia:push-notification', handlePushEvent);
    window.addEventListener('eventia:quota-updated', handleQuotaUpdate);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('eventia:push-notification', handlePushEvent);
      window.removeEventListener('eventia:quota-updated', handleQuotaUpdate);
    };
  }, []);

  // Auto-cerrar el Dynamic Island Toast después de 5.5 segundos
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 5500);
    return () => clearTimeout(timer);
  }, [activeToast]);

  const handleRequestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      await triggerPushNotification({
        title: 'Notificación Push Dynamic Island Activa',
        body: 'Las notificaciones animadas estilo Apple están activadas en tu sesión.',
        category: 'SYSTEM',
      });
      return;
    }

    const perm = await Notification.requestPermission();
    setPushPermission(perm);

    await triggerPushNotification({
      title:
        perm === 'granted'
          ? '¡Notificaciones Push Activadas!'
          : 'Centro Push Dynamic Island Listo',
      body:
        perm === 'granted'
          ? 'Recibirás avisos nativos en tu teléfono/PC de cada cotización, pago de Mercado Pago y ruta de salón.'
          : 'Recibirás notificaciones interactivas en la Dynamic Island superior.',
      category: 'SYSTEM',
    });
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setInstallModalOpen(false);
        await triggerPushNotification({
          title: '¡EVENTIA Instalada en tu Dispositivo!',
          body: 'Ya puedes abrir EVENTIA directamente desde tu escritorio o pantalla de inicio.',
          category: 'SYSTEM',
        });
      }
    } else {
      setInstallModalOpen(true);
    }
  };

  const handleSimulateQuotaWarning = async () => {
    consumeApiQuota('MAPS_GEOCODING_API', 65);
    setQuotas(getApiQuotas());
    await triggerPushNotification({
      title: 'Control de Cuota API (HTTP 429 Mitigado)',
      body: 'API de Mapas alcanzó su límite por minuto (60 req/min). El Circuit Breaker activó el caché geográfico local sin interrumpir al usuario.',
      category: 'QUOTA',
    });
  };

  const handleSimulateNetworkError = async () => {
    await triggerPushNotification({
      title: 'Error de Red Interceptado (Retry 2/2 Exitoso)',
      body: 'Latencia detectada en pasarela externa. El motor resiliente reintentó con Backoff Exponencial y recuperó la sesión.',
      category: 'NETWORK',
    });
  };

  return (
    <>
      {/* ====================================================================
          1. APPLE DYNAMIC ISLAND PUSH NOTIFICATION TOAST (TOP CENTER)
         ==================================================================== */}
      {activeToast && (
        <div className="no-print fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-[94vw] max-w-md animate-apple-in">
          <div className="bg-slate-950/95 backdrop-blur-2xl text-white rounded-[28px] p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] border border-white/15 flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                activeToast.category === 'PAYMENT'
                  ? 'bg-[#009EE3] text-white'
                  : activeToast.category === 'QUOTA'
                  ? 'bg-amber-500 text-slate-950'
                  : activeToast.category === 'NETWORK'
                  ? 'bg-rose-500 text-white'
                  : 'bg-gradient-to-tr from-indigo-500 to-sky-400 text-white'
              }`}
            >
              {activeToast.category === 'PAYMENT' ? (
                <CreditCard className="w-5 h-5" />
              ) : activeToast.category === 'QUOTA' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : activeToast.category === 'NETWORK' ? (
                <WifiOff className="w-5 h-5" />
              ) : activeToast.category === 'MAP' ? (
                <MapPin className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5 animate-bounce" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                  EVENTIA Push • Ahora
                </span>
                <button
                  onClick={() => setActiveToast(null)}
                  className="text-slate-400 hover:text-white p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-xs font-black text-white mt-0.5 truncate">
                {activeToast.title}
              </h4>
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                {activeToast.body}
              </p>
              {activeToast.actionUrl && (
                <Link
                  href={activeToast.actionUrl}
                  onClick={() => setActiveToast(null)}
                  className="inline-block mt-2 text-[11px] font-bold text-sky-400 hover:underline"
                >
                  {activeToast.actionLabel || 'Abrir detalle →'}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          2. BOTONES DE ACCIÓN EN EL TOPBAR (PUSH, CUOTAS API & INSTALAR PWA)
         ==================================================================== */}
      <div className="flex items-center gap-2">
        {/* Indicador Online/Offline */}
        <button
          type="button"
          onClick={() => setControlCenterOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
            isOnline
              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15'
              : 'bg-rose-500 text-white border-rose-600 animate-pulse'
          }`}
          title="Estado de Red y Cuotas de APIs Externas"
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">APIs & Cuotas</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Modo Offline</span>
            </>
          )}
        </button>

        {/* Botón de Centro de Notificaciones Push */}
        <button
          type="button"
          onClick={() => setControlCenterOpen(true)}
          className="relative p-2 rounded-full bg-white/90 border border-slate-200/80 hover:bg-slate-100 text-slate-700 transition-all shadow-sm"
          title="Notificaciones Push y Control Center"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Botón Instalar App PWA (Móvil y PC) */}
        {!isStandalone && (
          <button
            type="button"
            onClick={handleInstallPWA}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-sm transition-all hover:-translate-y-0.5 active:scale-95"
            title="Instalar aplicación PWA en PC o Teléfono"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Instalar App</span>
          </button>
        )}
      </div>

      {/* ====================================================================
          3. MODAL APPLE CONTROL CENTER: PUSH, CUOTAS API Y RESILIENCIA DE RED
         ==================================================================== */}
      {controlCenterOpen && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4 animate-apple-in">
          <div className="max-w-2xl w-full apple-glass-card rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-sky-400 flex items-center justify-center shadow-md">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Centro de Control: APIs, Cuotas, Red y Push
                  </h3>
                  <p className="text-xs text-slate-500">
                    Monitoreo en tiempo real de integraciones externas, cuotas y notificaciones
                  </p>
                </div>
              </div>
              <button
                onClick={() => setControlCenterOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Acciones Rápidas de Demostración */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleRequestPushPermission}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-left space-y-1 shadow-md hover:scale-[1.01] transition-all"
              >
                <div className="flex items-center justify-between">
                  <Bell className="w-4 h-4" />
                  <span className="text-[9px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    {pushPermission === 'granted' ? 'Permiso Activo' : 'Activar / Probar'}
                  </span>
                </div>
                <p className="text-xs font-extrabold pt-1">Disparar Push en Vivo</p>
                <p className="text-[10px] text-indigo-100">
                  Prueba la animación Dynamic Island + Push Nativo
                </p>
              </button>

              <button
                type="button"
                onClick={handleSimulateQuotaWarning}
                className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 text-left space-y-1 hover:bg-amber-500/15 transition-all"
              >
                <div className="flex items-center justify-between">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span className="text-[9px] uppercase font-bold bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded-full">
                    HTTP 429 Test
                  </span>
                </div>
                <p className="text-xs font-extrabold pt-1">Simular Límite de Cuota</p>
                <p className="text-[10px] text-amber-700">
                  Activa el Rate Limiter y el Caché de Respaldo
                </p>
              </button>

              <button
                type="button"
                onClick={handleSimulateNetworkError}
                className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-950 text-left space-y-1 hover:bg-rose-500/15 transition-all"
              >
                <div className="flex items-center justify-between">
                  <Zap className="w-4 h-4 text-rose-600" />
                  <span className="text-[9px] uppercase font-bold bg-rose-500/20 text-rose-800 px-2 py-0.5 rounded-full">
                    Auto-Retry
                  </span>
                </div>
                <p className="text-xs font-extrabold pt-1">Simular Error de Red</p>
                <p className="text-[10px] text-rose-700">
                  Prueba el Backoff Exponencial y modo Offline
                </p>
              </button>
            </div>

            {/* Estado de Cuotas de las 4 APIs Externas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Consumo y Cuotas de APIs Externas (Rate Limit Manager)
                </h4>
                <button
                  type="button"
                  onClick={() => setQuotas(resetApiQuotas())}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reiniciar Cuotas</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quotas.map((q) => {
                  const pct = Math.min(100, Math.round((q.usedToday / q.dailyLimit) * 100));
                  const isLimited = q.status === 'RATE_LIMITED';
                  const isWarn = q.status === 'WARNING';

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{q.name}</p>
                          <p className="text-[10px] text-slate-400">{q.provider}</p>
                        </div>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            isLimited
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : isWarn
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isLimited ? '429 Caché Activo' : isWarn ? 'Cuota Alta' : 'Saludable'}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLimited
                              ? 'bg-rose-500'
                              : isWarn
                              ? 'bg-amber-500'
                              : 'bg-gradient-to-r from-indigo-500 to-sky-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>
                          Hoy: <strong>{q.usedToday}</strong> / {q.dailyLimit} req
                        </span>
                        <span>
                          Minuto: <strong>{q.usedMinute}</strong>/{q.minuteLimit} • {q.latencyMs}ms
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Historial de Notificaciones Push */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Últimas Notificaciones Push Enviadas ({history.length})
              </h4>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center bg-white/60 rounded-2xl">
                  Presiona &ldquo;Disparar Push en Vivo&rdquo; arriba para probar una notificación animada.
                </p>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {history.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white/80 border border-slate-200/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-[11px] text-slate-500">{item.body}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          4. MODAL DE INSTALACIÓN PWA (PARA PC Y MÓVIL iOS / ANDROID)
         ==================================================================== */}
      {installModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4 animate-apple-in">
          <div className="max-w-lg w-full apple-glass-card rounded-[32px] p-7 shadow-2xl border border-white space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-500 to-sky-400 text-white flex items-center justify-center font-black text-xl shadow-lg">
                  E
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                    Progressive Web App (PWA)
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Instalar EVENTIA en Móvil y PC
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setInstallModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start gap-3">
                <Laptop className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-slate-900">
                    En PC / Mac (Chrome, Edge o Safari)
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    Haz clic en el ícono de <strong>&ldquo;Instalar EVENTIA&rdquo;</strong> que aparece en el lado derecho de la barra de direcciones de tu navegador, o en Safari Mac ve a <strong>Archivo → Agregar al Dock</strong>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-slate-900">
                    En iPhone / iPad (iOS) y Android
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    • <strong>En iPhone/iPad:</strong> Toca el botón <strong>Compartir</strong> en Safari y selecciona <strong>&ldquo;Agregar a pantalla de inicio&rdquo;</strong>.
                    <br />• <strong>En Android:</strong> Toca el menú del navegador y elige <strong>&ldquo;Instalar aplicación&rdquo;</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInstallModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
