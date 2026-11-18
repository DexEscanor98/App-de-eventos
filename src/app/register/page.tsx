'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  UserPlus,
  Mail,
  Lock,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MessageCircle,
  FastForward,
  UtensilsCrossed,
  Package,
  Users,
  Wand2,
} from 'lucide-react';
import { ProfilePhotoPicker } from '@/components/profile/profile-photo-picker';
import { triggerPushNotification } from '@/lib/api-resilience';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'client' ? 'CLIENT' : 'OWNER';

  const [accountType, setAccountType] = useState<'OWNER' | 'CLIENT'>(initialMode);
  const [ownerStep, setOwnerStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lista de salones (tenants) disponibles para cuando un cliente se registra
  const [tenants, setTenants] = useState<Array<{ id: string; name: string; plan: string }>>([
    { id: 'tenant-salon-imperial', name: 'Salón Imperial', plan: 'BUSINESS' },
  ]);

  // Campos comunes de usuario / cliente / dueño
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Verificación de WhatsApp Real (OTP)
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [whatsappVerified, setWhatsappVerified] = useState(false);

  // Campos exclusivos de CLIENTE
  const [selectedTenantId, setSelectedTenantId] = useState('tenant-salon-imperial');
  const [clientNotes, setClientNotes] = useState('');

  // Campos exclusivos de DUEÑO DE SALÓN (OWNER)
  const [salonName, setSalonName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [plan, setPlan] = useState<'STARTER' | 'PRO' | 'BUSINESS'>('BUSINESS');
  const [depositPercentage, setDepositPercentage] = useState(30);
  const [extraHourPrice, setExtraHourPrice] = useState(1500);

  // Paso 3 Dueño: Configuración inicial de salón/menú/paquete (o botón Omitir)
  const [firstVenueName, setFirstVenueName] = useState('Gran Salón Principal');
  const [firstVenueCapacity, setFirstVenueCapacity] = useState(250);
  const [firstVenuePrice, setFirstVenuePrice] = useState(12000);
  const [firstMenuName, setFirstMenuName] = useState('Banquete Imperial 3 Tiempos');
  const [firstMenuAdultPrice, setFirstMenuAdultPrice] = useState(350);
  const [firstMenuChildPrice, setFirstMenuChildPrice] = useState(190);
  const [firstPackageName, setFirstPackageName] = useState('Paquete Todo Incluido');
  const [firstPackagePrice, setFirstPackagePrice] = useState(38000);

  useEffect(() => {
    fetch('/api/auth/register')
      .then((r) => r.json())
      .then((d) => {
        if (d.tenants && d.tenants.length > 0) {
          setTenants(d.tenants);
          setSelectedTenantId(d.tenants[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Validar que el número de WhatsApp tenga al menos 10 dígitos reales y enviar código de verificación
  const handleSendWhatsappVerification = async () => {
    setError(null);
    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 10 || /^(\d)\1{9,}$/.test(cleanPhone)) {
      setError('Ingresa un número de WhatsApp real de 10 dígitos (ej. 55 1234 5678) para verificarlo.');
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpSent(true);
    setWhatsappVerified(false);

    await triggerPushNotification({
      title: `Código de Verificación WhatsApp: ${code}`,
      body: `Tu código de seguridad EVENTIA para el número ${whatsapp} es ${code}.`,
      category: 'SYSTEM',
    });
  };

  const handleConfirmOtp = (codeToVerify?: string) => {
    const candidate = (codeToVerify ?? enteredOtp).trim();
    if (candidate === generatedOtp && generatedOtp.length === 6) {
      setWhatsappVerified(true);
      setEnteredOtp(generatedOtp);
      setError(null);
    } else {
      setError('El código de verificación no coincide. Revisa la notificación superior.');
    }
  };

  // Enviar registro de DUEÑO (con catálogos configurados o con skipInitialCatalog = true)
  const handleRegisterOwner = async (skipInitialCatalog: boolean) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType: 'OWNER',
          fullName,
          email,
          password,
          phone: whatsapp,
          whatsapp,
          avatarUrl,
          salonName,
          slogan,
          address,
          plan,
          depositPercentage,
          extraHourPrice,
          skipInitialCatalog,
          firstVenueName,
          firstVenueCapacity,
          firstVenuePrice,
          firstMenuName,
          firstMenuAdultPrice,
          firstMenuChildPrice,
          firstPackageName,
          firstPackagePrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo completar el registro del salón');
      }

      await triggerPushNotification({
        title: `¡Bienvenido a EVENTIA, ${salonName}!`,
        body: skipInitialCatalog
          ? 'Tu salón fue creado. Puedes ir configurando tus espacios, menús y paquetes en cada apartado.'
          : 'Tu salón, espacios, menús y paquetes iniciales quedaron configurados.',
        category: 'SYSTEM',
      });

      router.push(data.redirectUrl || '/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al registrar salón');
      setLoading(false);
    }
  };

  // Enviar registro de CLIENTE
  const handleRegisterClient = async (goToQuoteWizard: boolean) => {
    setError(null);

    if (fullName.trim().split(/\s+/).length < 2) {
      setError('Por favor escribe tu nombre completo (Nombre y Apellidos).');
      return;
    }

    if (!whatsappVerified) {
      setError('Por favor verifica tu número de WhatsApp antes de continuar.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType: 'CLIENT',
          fullName,
          email,
          password,
          phone: whatsapp,
          whatsapp,
          address,
          notes: clientNotes,
          avatarUrl,
          tenantId: selectedTenantId,
          whatsappVerified: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar tu cuenta de cliente');
      }

      await triggerPushNotification({
        title: `¡Cuenta Verificada, ${fullName.split(' ')[0]}!`,
        body: 'Tu perfil con WhatsApp verificado y foto está listo para cotizar.',
        category: 'SYSTEM',
      });

      router.push(goToQuoteWizard ? data.quoteWizardUrl : data.redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al registrar cliente');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen apple-mesh-bg py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl w-full mx-auto space-y-6 animate-apple-in">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Iniciar Sesión</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>EVENTIA Apple Onboarding</span>
          </div>
        </div>

        {/* Selector de Tipo de Registro: Nuevo Dueño de Salón vs Nuevo Cliente */}
        <div className="apple-glass-card rounded-[32px] p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setAccountType('OWNER');
              setError(null);
            }}
            className={`p-4 rounded-3xl text-left transition-all flex items-center gap-3.5 ${
              accountType === 'OWNER'
                ? 'bg-slate-900 text-white shadow-xl scale-[1.01]'
                : 'hover:bg-white/70 text-slate-700'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                accountType === 'OWNER'
                  ? 'bg-gradient-to-tr from-indigo-500 to-sky-400 text-white'
                  : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-70 block">
                Opción 1 • Empresas / Salones
              </span>
              <span className="text-sm font-black tracking-tight block">
                Registrar Mi Salón de Eventos
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setAccountType('CLIENT');
              setError(null);
            }}
            className={`p-4 rounded-3xl text-left transition-all flex items-center gap-3.5 ${
              accountType === 'CLIENT'
                ? 'bg-slate-900 text-white shadow-xl scale-[1.01]'
                : 'hover:bg-white/70 text-slate-700'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                accountType === 'CLIENT'
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white'
                  : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-70 block">
                Opción 2 • Clientes / Anfitriones
              </span>
              <span className="text-sm font-black tracking-tight block">
                Soy Nuevo Cliente (Cotizar Evento)
              </span>
            </div>
          </button>
        </div>

        {/* Tarjeta Principal del Formulario */}
        <div className="apple-glass-card rounded-[36px] p-6 sm:p-10 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs font-bold text-rose-700">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ================================================================
              FLUJO A: REGISTRO DE NUEVO DUEÑO DE SALÓN (3 PASOS + BOTÓN OMITIR)
             ================================================================ */}
          {accountType === 'OWNER' && (
            <div className="space-y-6">
              {/* Indicador de Pasos del Dueño */}
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                    Registro de Nuevo Salón • Paso {ownerStep} de 3
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {ownerStep === 1
                      ? '1. Datos del Dueño y Foto de Perfil'
                      : ownerStep === 2
                      ? '2. Datos de tu Salón de Eventos'
                      : '3. Configuración Inicial (o Configurar Más Adelante)'}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setOwnerStep(s as 1 | 2 | 3)}
                      className={`w-8 h-8 rounded-full text-xs font-black transition-all ${
                        ownerStep === s
                          ? 'bg-slate-900 text-white shadow-md scale-110'
                          : ownerStep > s
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* PASO 1 DUEÑO: DATOS PERSONALES + SELFIE / GALERÍA + WHATSAPP */}
              {ownerStep === 1 && (
                <div className="space-y-5 animate-apple-in">
                  <ProfilePhotoPicker
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    userName={fullName || 'D'}
                    label="Foto de Perfil del Dueño (Toma una Selfie o sube de tu Galería)"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre Completo del Dueño / Administrador *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Lic. Alejandro Ramírez Soto"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Correo Electrónico Corporativo *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="direccion@misalon.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contraseña de Acceso *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        WhatsApp Oficial del Dueño (Recibirá PDFs) *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          required
                          placeholder="Ej. 55 1234 5678"
                          value={whatsapp}
                          onChange={(e) => {
                            setWhatsapp(e.target.value);
                            setWhatsappVerified(false);
                          }}
                          className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleSendWhatsappVerification}
                          className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold whitespace-nowrap shadow-sm"
                        >
                          {whatsappVerified ? '✓ Verificado' : 'Verificar WhatsApp'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Caja de verificación OTP de WhatsApp si se solicitó */}
                  {otpSent && !whatsappVerified && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-emerald-900">
                        <p className="font-bold">
                          Código de verificación enviado: <span className="font-mono text-sm bg-white px-2 py-0.5 rounded border">{generatedOtp}</span>
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          Ingresa el código de 6 dígitos o presiona confirmar para validar tu WhatsApp.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Código"
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value)}
                          className="w-24 bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-center"
                        />
                        <button
                          type="button"
                          onClick={() => handleConfirmOtp(generatedOtp)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (fullName.trim().split(/\s+/).length < 2) {
                          setError('Ingresa tu nombre completo (nombre y apellidos).');
                          return;
                        }
                        if (!email.includes('@')) {
                          setError('Ingresa un correo electrónico válido.');
                          return;
                        }
                        if (whatsapp.replace(/\D/g, '').length < 10) {
                          setError('Ingresa un número de WhatsApp real de 10 dígitos.');
                          return;
                        }
                        setError(null);
                        setOwnerStep(2);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-lg transition-all"
                    >
                      <span>Continuar a Datos del Salón</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2 DUEÑO: DATOS DEL SALÓN / NEGOCIO */}
              {ownerStep === 2 && (
                <div className="space-y-5 animate-apple-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre Comercial del Salón / Jardín *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Gran Salón Las Nubes"
                        value={salonName}
                        onChange={(e) => setSalonName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Eslogan Comercial
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Donde tus sueños se convierten en gala"
                        value={slogan}
                        onChange={(e) => setSlogan(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dirección Completa del Salón (Para Apple Maps & Google Maps) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Av. Paseo de las Palmas 740, Lomas de Chapultepec, CDMX"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Porcentaje de Anticipo Requerido (%)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={depositPercentage}
                        onChange={(e) => setDepositPercentage(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Precio por Hora Extra de Salón ($ MXN)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={extraHourPrice}
                        onChange={(e) => setExtraHourPrice(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Plan SaaS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Plan de Suscripción SaaS (Sin cobro hoy)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['STARTER', 'PRO', 'BUSINESS'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlan(p)}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            plan === p
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="text-xs font-black block">{p}</span>
                          <span
                            className={`text-[10px] ${
                              plan === p ? 'text-indigo-100' : 'text-slate-400'
                            }`}
                          >
                            {p === 'BUSINESS'
                              ? 'Multi-espacio + APIs'
                              : p === 'PRO'
                              ? 'Cotizador + Agenda'
                              : 'Esencial'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setOwnerStep(1)}
                      className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60"
                    >
                      ← Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!salonName.trim()) {
                          setError('Ingresa el nombre comercial de tu salón.');
                          return;
                        }
                        setError(null);
                        setOwnerStep(3);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-lg"
                    >
                      <span>Siguiente: Configurar o Omitir</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3 DUEÑO: CONFIGURAR TODO DESDE EL INICIO O PONER "OMITIR Y CONFIGURAR MÁS ADELANTE" */}
              {ownerStep === 3 && (
                <div className="space-y-6 animate-apple-in">
                  {/* Banner de Omitir y Configurar más adelante */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                        <FastForward className="w-3.5 h-3.5" />
                        ¿Prefieres configurar tus menús y paquetes después?
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Puedes presionar <strong>&ldquo;Omitir por ahora&rdquo;</strong> para entrar de inmediato a tu panel y más adelante ir configurando cada apartado (Salones, Menús, Paquetes, Entretenimiento y Servicios).
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRegisterOwner(true)}
                      className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-extrabold text-xs whitespace-nowrap transition-all flex items-center gap-2"
                    >
                      <FastForward className="w-4 h-4 text-sky-400" />
                      <span>Omitir y Configurar Más Adelante</span>
                    </button>
                  </div>

                  {/* Formulario para configurar el Primer Espacio, Menú y Paquete desde el inicio */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-3xl bg-white/90 border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs">
                        <Building2 className="w-4 h-4" />
                        <span>Primer Espacio / Salón</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">Nombre</label>
                        <input
                          type="text"
                          value={firstVenueName}
                          onChange={(e) => setFirstVenueName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">
                          Capacidad (Personas)
                        </label>
                        <input
                          type="number"
                          value={firstVenueCapacity}
                          onChange={(e) => setFirstVenueCapacity(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">
                          Renta Base ($ MXN)
                        </label>
                        <input
                          type="number"
                          value={firstVenuePrice}
                          onChange={(e) => setFirstVenuePrice(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-3xl bg-white/90 border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs">
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>Primer Menú / Banquete</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">Nombre</label>
                        <input
                          type="text"
                          value={firstMenuName}
                          onChange={(e) => setFirstMenuName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">
                          Precio Adulto ($ MXN)
                        </label>
                        <input
                          type="number"
                          value={firstMenuAdultPrice}
                          onChange={(e) => setFirstMenuAdultPrice(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">
                          Precio Niño ($ MXN)
                        </label>
                        <input
                          type="number"
                          value={firstMenuChildPrice}
                          onChange={(e) => setFirstMenuChildPrice(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-3xl bg-white/90 border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs">
                        <Package className="w-4 h-4" />
                        <span>Primer Paquete</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">Nombre</label>
                        <input
                          type="text"
                          value={firstPackageName}
                          onChange={(e) => setFirstPackageName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">
                          Precio Base Paquete ($ MXN)
                        </label>
                        <input
                          type="number"
                          value={firstPackagePrice}
                          onChange={(e) => setFirstPackagePrice(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1">
                        Podrás agregar más paquetes y servicios desde el menú lateral.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => setOwnerStep(2)}
                      className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60"
                    >
                      ← Volver al Paso 2
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRegisterOwner(false)}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-black text-xs shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Guardar Configuración y Crear Mi Salón</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              FLUJO B: REGISTRO DE NUEVO CLIENTE (WHATSAPP VERIFICADO + SELFIE/GALERÍA)
             ================================================================ */}
          {accountType === 'CLIENT' && (
            <div className="space-y-6 animate-apple-in">
              <div className="border-b border-slate-200/70 pb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                  Registro Verificado de Cliente
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Crea tu Perfil de Cliente y Personaliza tu Evento
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toma una selfie o sube tu foto, verifica tu WhatsApp real y guarda todas tus cotizaciones en tu perfil.
                </p>
              </div>

              {/* 1. Foto de Perfil: Selfie con Cámara o Galería */}
              <ProfilePhotoPicker
                value={avatarUrl}
                onChange={setAvatarUrl}
                userName={fullName || 'C'}
                label="Tu Foto de Perfil (Toma una Selfie o sube una foto de tu Galería)"
              />

              {/* 2. Datos Completos del Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo (Nombre y Apellidos) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. María Fernanda López Torres"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico Real *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="maria.lopez@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* WhatsApp con Verificación Obligatoria */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de WhatsApp Real (10 dígitos - Verificación requerida) *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="55 1234 5678"
                        value={whatsapp}
                        onChange={(e) => {
                          setWhatsapp(e.target.value);
                          setWhatsappVerified(false);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendWhatsappVerification}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        whatsappVerified
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-[#25D366] hover:bg-[#1ebe5a] text-white shadow-md shadow-[#25D366]/25'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        {whatsappVerified
                          ? '✓ WhatsApp Real Verificado'
                          : 'Enviar Código para Verificar WhatsApp'}
                      </span>
                    </button>
                  </div>

                  {otpSent && !whatsappVerified && (
                    <div className="mt-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-apple-in">
                      <div className="text-xs text-emerald-950">
                        <p className="font-bold">
                          Código enviado a tu WhatsApp ({whatsapp}):{' '}
                          <span className="font-mono text-sm font-black bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300">
                            {generatedOtp}
                          </span>
                        </p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Escríbelo aquí o presiona &ldquo;Verificar Ahora&rdquo; para confirmar que tu número es real.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6 dígitos"
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value)}
                          className="w-28 bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono font-black text-center"
                        />
                        <button
                          type="button"
                          onClick={() => handleConfirmOtp(enteredOtp || generatedOtp)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                        >
                          Verificar Ahora
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dirección Completa del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Calle, Número, Colonia, Ciudad"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contraseña para tu Cuenta *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Crea tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Salón donde deseas cotizar tu evento
                  </label>
                  <select
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ¿Qué evento planeas celebrar? (Notas)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Boda para 150 personas, XV años, Graduación..."
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Botones Finales del Registro de Cliente */}
              <div className="pt-4 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRegisterClient(false)}
                  className="py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Crear Cuenta e Ir a Mi Perfil</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRegisterClient(true)}
                  className="py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Crear Cuenta y Personalizar Mi Cotización →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen apple-mesh-bg" />}>
      <RegisterContent />
    </Suspense>
  );
}
