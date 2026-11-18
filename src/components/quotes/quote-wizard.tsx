'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Calendar,
  Users,
  Package as PackageIcon,
  UtensilsCrossed,
  Music2,
  Sparkles,
  Percent,
  Receipt,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Building2,
  CheckCircle2,
  Wallet,
  MessageCircle,
  CreditCard,
  Plus,
  Trash2,
  Download,
  ShieldCheck,
  UserCheck,
  Wand2,
  Phone,
  MapPin,
  Compass,
  Navigation,
} from 'lucide-react';
import { calculateQuote } from '@/lib/pricing-engine';
import { formatCurrency } from '@/lib/utils';
import {
  getTodayDateString,
  isDateTodayOrFuture,
  saveLocalQuote,
  buildOwnerWhatsAppUrl,
  LocalCustomItem,
} from '@/lib/local-db';
import {
  getVenueGeoLocation,
  buildNativeMapNavigationLinks,
  triggerPushNotification,
} from '@/lib/api-resilience';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

interface Venue {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
  location?: string | null;
}

interface EventType {
  id: string;
  name: string;
}

interface Menu {
  id: string;
  name: string;
  adultPrice: number;
  childPrice: number;
  description?: string | null;
}

interface Package {
  id: string;
  name: string;
  basePrice: number;
  includedGuests: number;
  includedHours: number;
  extraGuestPrice: number;
  description?: string | null;
}

interface Entertainment {
  id: string;
  name: string;
  price: number;
  durationHours: number;
}

interface AdditionalService {
  id: string;
  name: string;
  price: number;
  billingType: string;
}

interface QuoteWizardProps {
  customers: Customer[];
  venues: Venue[];
  eventTypes: EventType[];
  menus: Menu[];
  packages: Package[];
  entertainments: Entertainment[];
  services: AdditionalService[];
  businessSettings?: any;
  preselectedCustomerId?: string;
  preselectedVenueId?: string;
  preselectedMenuId?: string;
  preselectedPackageId?: string;
  currentUserRole?: string;
}

const STEPS = [
  { id: 1, label: 'Cliente & Presupuesto', icon: User },
  { id: 2, label: 'Fecha y Espacio', icon: Building2 },
  { id: 3, label: 'Invitados', icon: Users },
  { id: 4, label: 'Paquete', icon: PackageIcon },
  { id: 5, label: 'Banquete', icon: UtensilsCrossed },
  { id: 6, label: 'Música & Show', icon: Music2 },
  { id: 7, label: 'Personalizar Extras', icon: Sparkles },
  { id: 8, label: 'Beneficios', icon: Percent },
  { id: 9, label: 'WhatsApp o Pagar', icon: Receipt },
];

const BUDGET_PRESETS = [35000, 55000, 75000, 100000, 150000];

export function QuoteWizard({
  customers,
  venues,
  eventTypes,
  menus,
  packages,
  entertainments,
  services,
  businessSettings,
  preselectedCustomerId,
  preselectedVenueId,
  preselectedMenuId,
  preselectedPackageId,
  currentUserRole,
}: QuoteWizardProps) {
  const router = useRouter();

  // Fecha mínima estricta: HOY (prohibido fechas anteriores)
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Wizard current step
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  // Estado cuando la cotización ya se guardó en el Paso 9
  const [savedQuote, setSavedQuote] = useState<any | null>(null);

  // Paso 1: Cliente + Presupuesto Estimado
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    preselectedCustomerId ||
      customers.find((c) => c.name.includes('Juan'))?.id ||
      customers[0]?.id ||
      ''
  );
  const [customerSearch, setCustomerSearch] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState<number>(60000);
  const [ownerWhatsappPhone, setOwnerWhatsappPhone] = useState<string>(
    businessSettings?.whatsapp || businessSettings?.phone || '5215512345678'
  );

  // Paso 2: Fecha (>= hoy) y Salón
  const [selectedVenueId, setSelectedVenueId] = useState(
    preselectedVenueId || venues[0]?.id || ''
  );
  const [selectedEventTypeId, setSelectedEventTypeId] = useState(eventTypes[0]?.id || '');

  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const [eventDate, setEventDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('21:00');

  // Validar cambio de fecha para impedir fechas pasadas
  const handleDateChange = (newDate: string) => {
    if (!newDate) return;
    if (!isDateTodayOrFuture(newDate)) {
      setDateWarning(
        `No se permiten fechas anteriores a hoy (${todayStr}). Se ajustó automáticamente a la fecha actual.`
      );
      setEventDate(todayStr);
      return;
    }
    setDateWarning(null);
    setEventDate(newDate);
  };

  // Paso 3: Invitados
  const [adults, setAdults] = useState(100);
  const [children, setChildren] = useState(0);

  // Paso 4: Paquete
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    preselectedPackageId || null
  );

  // Paso 5: Menú
  const carnitasMenu = menus.find((m) => m.name.toLowerCase().includes('carnitas'));
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(
    preselectedMenuId || carnitasMenu?.id || menus[0]?.id || null
  );

  // Paso 6: Entretenimiento
  const djEnt = entertainments.find((e) => e.name.toLowerCase().includes('dj'));
  const [selectedEntIds, setSelectedEntIds] = useState<string[]>(djEnt ? [djEnt.id] : []);

  // Paso 7: Extras + Conceptos Personalizados por el Cliente
  const decorService = services.find(
    (s) =>
      s.name.toLowerCase().includes('decoración') ||
      s.name.toLowerCase().includes('decoracion')
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    decorService ? [decorService.id] : []
  );
  const [extraHours, setExtraHours] = useState(2);

  // Conceptos personalizados agregados por el cliente
  const [customItems, setCustomItems] = useState<LocalCustomItem[]>([]);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomPrice, setNewCustomPrice] = useState('');
  const [newCustomQty, setNewCustomQty] = useState('1');

  // Paso 8: Descuentos
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [discountValue, setDiscountValue] = useState(0);

  // Paso 9: Notas y Modalidad de pago Mercado Pago
  const [notes, setNotes] = useState('');
  const [mpAmountType, setMpAmountType] = useState<'DEPOSIT' | 'FULL'>('DEPOSIT');

  // Entidades seleccionadas
  const selectedVenue = venues.find((v) => v.id === selectedVenueId);
  const selectedPackage = packages.find((p) => p.id === selectedPackageId);
  const selectedMenu = menus.find((m) => m.id === selectedMenuId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedEventType = eventTypes.find((et) => et.id === selectedEventTypeId);
  const selectedEnts = entertainments.filter((e) => selectedEntIds.includes(e.id));
  const selectedServs = services.filter((s) => selectedServiceIds.includes(s.id));

  // Agregar concepto personalizado
  const handleAddCustomItem = () => {
    if (!newCustomName.trim() || !newCustomPrice) return;
    const priceNum = Math.max(0, Number(newCustomPrice));
    const qtyNum = Math.max(1, Number(newCustomQty) || 1);
    setCustomItems((prev) => [
      ...prev,
      {
        id: `cust-${Date.now()}`,
        name: newCustomName.trim(),
        price: priceNum,
        quantity: qtyNum,
      },
    ]);
    setNewCustomName('');
    setNewCustomPrice('');
    setNewCustomQty('1');
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Cálculo en Vivo Centralizado (incluyendo conceptos personalizados)
  const calculation = useMemo(() => {
    const allServices = [
      ...selectedServs.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        billingType: s.billingType as any,
      })),
      ...customItems.map((ci) => ({
        id: ci.id,
        name: `${ci.name} (Personalizado)`,
        price: ci.price * ci.quantity,
        billingType: 'FIXED' as const,
      })),
    ];

    return calculateQuote({
      adults,
      children,
      venuePrice: selectedVenue?.basePrice || 0,
      packagePrice: selectedPackage?.basePrice || 0,
      packageIncludedGuests: selectedPackage?.includedGuests,
      packageExtraGuestPrice: selectedPackage?.extraGuestPrice,
      menuAdultPrice: selectedMenu?.adultPrice || 0,
      menuChildPrice: selectedMenu?.childPrice || 0,
      extraHours,
      extraHourPrice: 1500,
      entertainments: selectedEnts.map((e) => ({
        id: e.id,
        name: e.name,
        price: e.price,
      })),
      services: allServices,
      discount:
        discountValue > 0 ? { type: discountType, value: discountValue } : undefined,
    });
  }, [
    adults,
    children,
    selectedVenue,
    selectedPackage,
    selectedMenu,
    extraHours,
    selectedEnts,
    selectedServs,
    customItems,
    discountType,
    discountValue,
  ]);

  // Análisis del Presupuesto del Cliente vs Total Cotizado
  const budgetRatio =
    estimatedBudget > 0 ? Math.min(130, Math.round((calculation.total / estimatedBudget) * 100)) : 0;
  const budgetDifference = estimatedBudget - calculation.total;
  const isOverBudget = estimatedBudget > 0 && calculation.total > estimatedBudget;

  const toggleEntertainment = (id: string) => {
    setSelectedEntIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /**
   * Guarda la cotización en la base del servidor (/api/quotes) y en la base local del navegador
   * y en el apartado "Cotizaciones" del perfil del cliente.
   */
  const persistQuoteInDatabaseAndProfile = async () => {
    if (!isDateTodayOrFuture(eventDate)) {
      throw new Error('La fecha del evento no puede ser anterior al día de hoy.');
    }

    if (savedQuote) {
      return savedQuote;
    }

    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedCustomerId,
        venueId: selectedVenueId,
        packageId: selectedPackageId || null,
        menuId: selectedMenuId || null,
        eventTypeId: selectedEventTypeId,
        eventDate,
        startTime,
        endTime,
        durationHours: 5,
        extraHours,
        adults,
        children,
        estimatedBudget,
        entertainmentIds: selectedEntIds,
        serviceIds: selectedServiceIds,
        customItems,
        discountType: discountValue > 0 ? discountType : null,
        discountValue: discountValue || 0,
        notes,
      }),
    });

    const quoteData = await res.json();
    if (!res.ok) {
      throw new Error(quoteData.error || 'Error al guardar la cotización');
    }

    // Guardar también en la Base Local del Navegador vinculada al Perfil del Cliente
    saveLocalQuote({
      id: quoteData.id,
      folio: quoteData.folio,
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || 'Cliente',
      customerPhone: selectedCustomer?.phone || '',
      venueName: selectedVenue?.name || 'Salón',
      eventTypeName: selectedEventType?.name || 'Evento',
      eventDate,
      startTime,
      endTime,
      adults,
      children,
      estimatedBudget,
      total: calculation.total,
      depositRequired: Math.round(calculation.total * 0.3),
      status: quoteData.status || 'SENT',
      customItems,
      notes,
      pdfUrl: `/quotes/${quoteData.id}?print=pdf`,
      createdAt: new Date().toISOString(),
    });

    setSavedQuote(quoteData);

    await triggerPushNotification({
      title: `Cotización ${quoteData.folio} Guardada`,
      body: `Guardada en el perfil de ${selectedCustomer?.name || 'Cliente'} por ${formatCurrency(
        calculation.total
      )}. Lista para WhatsApp o Mercado Pago.`,
      category: 'QUOTE',
      actionUrl: `/quotes/${quoteData.id}`,
      actionLabel: 'Ver Cotización →',
    });

    return quoteData;
  };

  /**
   * OPCIÓN 1 FINAL: Mandar Cotización por WhatsApp al Dueño del Salón + Guardar PDF en Perfil
   */
  const handleSendViaWhatsAppToOwner = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const quoteData = await persistQuoteInDatabaseAndProfile();

      const whatsappUrl = buildOwnerWhatsAppUrl({
        ownerWhatsapp: ownerWhatsappPhone,
        salonName: businessSettings?.commercialName || 'Salón Imperial',
        folio: quoteData.folio,
        customerName: selectedCustomer?.name || 'Cliente',
        customerPhone: selectedCustomer?.phone || '',
        venueName: selectedVenue?.name || 'Salón Principal',
        eventTypeName: selectedEventType?.name || 'Evento Social',
        eventDate,
        startTime,
        endTime,
        guests: adults + children,
        estimatedBudget,
        total: calculation.total,
        deposit: Math.round(calculation.total * 0.3),
        quoteId: quoteData.id,
        itemsSummary: calculation.items.map(
          (i) => `${i.quantity}x ${i.name} (${formatCurrency(i.total)})`
        ),
      });

      // Abrir WhatsApp del dueño del salón en pestaña nueva
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Redirigir a la vista del PDF de la cotización (con banner de guardada en perfil)
      router.push(`/quotes/${quoteData.id}?saved_profile=1&sent_wa=1`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error al preparar el envío por WhatsApp');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * OPCIÓN 2 FINAL: Pagar Ahora con API de Mercado Pago (Anticipo 30% o Total)
   */
  const handlePayWithMercadoPago = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const quoteData = await persistQuoteInDatabaseAndProfile();

      const mpRes = await fetch('/api/payments/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quoteData.id,
          action: 'CREATE_PREFERENCE',
          amountType: mpAmountType,
        }),
      });

      const mpData = await mpRes.json();
      if (!mpRes.ok) {
        throw new Error(mpData.error || 'No se pudo iniciar Mercado Pago');
      }

      router.push(mpData.checkoutUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con Mercado Pago');
      setSubmitting(false);
    }
  };

  /**
   * Guardar y Ver en el apartado "Cotizaciones" del Perfil del Cliente
   */
  const handleSaveToCustomerProfileOnly = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const quoteData = await persistQuoteInDatabaseAndProfile();
      router.push(`/customers/${quoteData.customerId}?tab=quotes&highlight=${quoteData.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar en el perfil del cliente');
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  return (
    <div className="space-y-7 pb-12">
      {/* Header Apple Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 text-[11px] font-bold mb-2">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Estudio de Personalización de Eventos • Apple Experience</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Diseña y Personaliza tu Cotización
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registra tu presupuesto, personaliza cada detalle y al finalizar elige entre{' '}
            <strong className="text-slate-800">enviar el PDF por WhatsApp al dueño</strong> o{' '}
            <strong className="text-[#009EE3]">pagar en línea con Mercado Pago</strong>.
          </p>
        </div>

        {selectedCustomer && (
          <Link
            href={`/customers/${selectedCustomer.id}?tab=quotes`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full apple-glass-card text-xs font-bold text-slate-800 hover:scale-[1.02] transition-all"
          >
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Perfil de {selectedCustomer.name} (Mis Cotizaciones)</span>
          </Link>
        )}
      </div>

      {/* Stepper Bar Header (Apple Floating Pill Dock) */}
      <div className="apple-glass-card rounded-3xl p-3.5 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[820px] px-1">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-300 cursor-pointer focus:outline-none ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.03]'
                    : isCompleted
                    ? 'bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/15'
                    : 'text-slate-500 hover:bg-slate-100/70'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-gradient-to-tr from-indigo-500 to-sky-400 text-white'
                      : 'bg-slate-200/70 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-widest opacity-60 font-bold">
                    Paso {step.id}
                  </span>
                  <span className="block text-[11px] font-extrabold tracking-tight whitespace-nowrap">
                    {step.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form + Live Summary Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Current Step Content (8 Cols) */}
        <div className="lg:col-span-8 apple-glass-card rounded-[28px] p-6 sm:p-8 flex flex-col justify-between min-h-[540px]">
          <div key={currentStep} className="animate-apple-in">
            {errorMessage && (
              <div className="mb-5 p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center gap-3 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* PASO 1: CLIENTE Y PRESUPUESTO ESTIMADO */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                      Paso 1 de 9
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Cliente y Presupuesto Meta
                    </h3>
                    <p className="text-xs text-slate-500">
                      Selecciona tu perfil de cliente y define tu presupuesto estimado para el evento
                    </p>
                  </div>
                </div>

                {/* Tarjeta de Presupuesto del Cliente */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-sky-400">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 block">
                          Control de Presupuesto en Base Local
                        </span>
                        <h4 className="text-base font-extrabold">
                          ¿Cuál es tu presupuesto estimado para el evento?
                        </h4>
                      </div>
                    </div>

                    <div className="relative w-full sm:w-48">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={estimatedBudget}
                        onChange={(e) => setEstimatedBudget(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-white/10 border border-white/20 rounded-2xl pl-8 pr-4 py-2 text-base font-black text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                        placeholder="60000"
                      />
                    </div>
                  </div>

                  {/* Presets de Presupuesto */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 mr-1">Opciones rápidas:</span>
                    {BUDGET_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setEstimatedBudget(preset)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          estimatedBudget === preset
                            ? 'bg-sky-400 text-slate-950 shadow-md shadow-sky-400/30 scale-105'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {formatCurrency(preset)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buscador y Selección de Cliente */}
                {currentUserRole === 'CLIENT' && selectedCustomer ? (
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-indigo-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-lg flex items-center justify-center shadow-md">
                        {selectedCustomer.name.charAt(0)}
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Sesión de Cliente Verificada
                        </span>
                        <h4 className="text-base font-black text-slate-900 mt-0.5">
                          {selectedCustomer.name}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">
                          Tel/WhatsApp: {selectedCustomer.phone}{' '}
                          {selectedCustomer.email ? `• ${selectedCustomer.email}` : ''}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/customers/${selectedCustomer.id}?tab=quotes`}
                      className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all text-center"
                    >
                      Ver Mis Cotizaciones Guardadas →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Perfil del Cliente (donde se guardará la cotización)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {filteredCustomers.length} perfiles disponibles
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="Buscar cliente por nombre o teléfono (ej. Juan Pérez)..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full bg-white/90 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs font-medium text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1 pt-1">
                      {filteredCustomers.map((cust) => {
                        const isSelected = selectedCustomerId === cust.id;
                        return (
                          <div
                            key={cust.id}
                            onClick={() => setSelectedCustomerId(cust.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25 scale-[1.01]'
                                : 'bg-white/80 border-slate-200/80 hover:border-indigo-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-extrabold text-xs">{cust.name}</p>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <p
                              className={`text-[11px] mt-1 ${
                                isSelected ? 'text-indigo-100' : 'text-slate-500'
                              }`}
                            >
                              {cust.phone}
                            </p>
                            {cust.email && (
                              <p
                                className={`text-[10px] truncate ${
                                  isSelected ? 'text-indigo-200' : 'text-slate-400'
                                }`}
                              >
                                {cust.email}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PASO 2: FECHA (VALIDADA >= HOY) Y SALÓN */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200/70 pb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                    Paso 2 de 9
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Fecha del Evento y Espacio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Las fechas anteriores a hoy ({todayStr}) están bloqueadas por seguridad operativa
                  </p>
                </div>

                {dateWarning && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{dateWarning}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      Fecha del Evento (Mín: Hoy)
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={eventDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                      ✓ Bloqueo de fechas pasadas activo
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      Hora de Término
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Tipo de Celebración
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map((et) => {
                      const active = selectedEventTypeId === et.id;
                      return (
                        <button
                          key={et.id}
                          type="button"
                          onClick={() => setSelectedEventTypeId(et.id)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                            active
                              ? 'bg-slate-900 text-white shadow-md scale-105'
                              : 'bg-white/80 text-slate-700 border border-slate-200 hover:bg-white'
                          }`}
                        >
                          {et.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2.5">
                    Elige tu Salón o Jardín
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {venues.map((venue) => {
                      const isSelected = selectedVenueId === venue.id;
                      return (
                        <div
                          key={venue.id}
                          onClick={() => setSelectedVenueId(venue.id)}
                          className={`p-5 rounded-3xl border cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-br from-indigo-600 to-sky-600 text-white border-transparent shadow-xl shadow-indigo-500/25 scale-[1.02]'
                              : 'bg-white/85 border-slate-200/80 hover:border-indigo-300 hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-sm">{venue.name}</h4>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                          <p
                            className={`text-[11px] mt-1 ${
                              isSelected ? 'text-indigo-100' : 'text-slate-500'
                            }`}
                          >
                            Capacidad hasta {venue.capacity} invitados
                          </p>
                          <p
                            className={`text-base font-black mt-3 ${
                              isSelected ? 'text-white' : 'text-indigo-600'
                            }`}
                          >
                            {formatCurrency(venue.basePrice)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tarjeta de Ubicación GPS del Salón Seleccionado + Botones Apple Maps / Google Maps */}
                  {selectedVenue && (() => {
                    const geo = getVenueGeoLocation(selectedVenue.name, selectedVenue.location);
                    const nav = buildNativeMapNavigationLinks({
                      lat: geo.lat,
                      lng: geo.lng,
                      venueName: selectedVenue.name,
                      address: geo.formattedAddress,
                    });
                    return (
                      <div className="mt-4 p-4 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            Ubicación GPS de {selectedVenue.name}
                          </span>
                          <p className="text-xs text-slate-300 leading-snug">
                            {geo.formattedAddress}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={nav.appleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              triggerPushNotification({
                                title: 'Abriendo Apple Maps',
                                body: `Navegación hacia ${selectedVenue.name}`,
                                category: 'MAP',
                              })
                            }
                            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/15 transition-all"
                          >
                            <Compass className="w-3.5 h-3.5 text-sky-400" />
                            <span>Apple Maps</span>
                          </a>
                          <a
                            href={nav.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              triggerPushNotification({
                                title: 'Abriendo Google Maps',
                                body: `Ruta en vivo hacia ${selectedVenue.name}`,
                                category: 'MAP',
                              })
                            }
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Google Maps</span>
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* PASO 3: INVITADOS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200/70 pb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                    Paso 3 de 9
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Aforo de Invitados
                  </h3>
                  <p className="text-xs text-slate-500">
                    Personaliza el número de adultos y niños para calcular el banquete al instante
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div className="p-6 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-black text-slate-900">Adultos</label>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        Platillo Completo
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={selectedVenue?.capacity || 400}
                      step={5}
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <input
                      type="number"
                      min={0}
                      value={adults}
                      onChange={(e) => setAdults(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xl font-black text-slate-900 text-center focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="p-6 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-black text-slate-900">Niños (Menores)</label>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        Tarifa Infantil
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={150}
                      step={5}
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <input
                      type="number"
                      min={0}
                      value={children}
                      onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xl font-black text-slate-900 text-center focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Aforo total personalizado para {selectedVenue?.name}:
                  </span>
                  <span className="font-black text-base text-sky-400">
                    {adults + children} invitados
                  </span>
                </div>
              </div>
            )}

            {/* PASO 4: PAQUETE */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="border-b border-slate-200/70 pb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                    Paso 4 de 9
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Modalidad de Paquete
                  </h3>
                  <p className="text-xs text-slate-500">
                    Arma tu evento 100% a la medida o parte de un paquete todo incluido
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSelectedPackageId(null)}
                    className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                      selectedPackageId === null
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.01]'
                        : 'bg-white/85 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm">100% Personalizado a la Medida</h4>
                      {selectedPackageId === null && (
                        <CheckCircle2 className="w-4 h-4 text-sky-400" />
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1.5 ${
                        selectedPackageId === null ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      Elige libremente salón, banquete, música y cada detalle individual.
                    </p>
                    <p
                      className={`text-xs font-bold mt-3 ${
                        selectedPackageId === null ? 'text-sky-400' : 'text-indigo-600'
                      }`}
                    >
                      Sin cargo fijo de paquete
                    </p>
                  </div>

                  {packages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-indigo-600 to-sky-600 text-white border-transparent shadow-xl scale-[1.01]'
                            : 'bg-white/85 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-sm">Paquete {pkg.name}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <p
                          className={`text-xs mt-1 ${
                            isSelected ? 'text-indigo-100' : 'text-slate-500'
                          }`}
                        >
                          Incluye {pkg.includedGuests} invitados y {pkg.includedHours} hrs
                        </p>
                        <p
                          className={`text-base font-black mt-3 ${
                            isSelected ? 'text-white' : 'text-indigo-700'
                          }`}
                        >
                          {formatCurrency(pkg.basePrice)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 5: MENÚ */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="border-b border-slate-200/70 pb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                    Paso 5 de 9
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Experiencia Gastronómica y Banquete
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecciona el menú para tus {adults} adultos{' '}
                    {children > 0 ? `y ${children} niños` : ''}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-96 overflow-y-auto pr-1">
                  {menus.map((menu) => {
                    const isSelected = selectedMenuId === menu.id;
                    return (
                      <div
                        key={menu.id}
                        onClick={() => setSelectedMenuId(menu.id)}
                        className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.01]'
                            : 'bg-white/85 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-sm">{menu.name}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                        </div>
                        <p
                          className={`text-[11px] mt-1 line-clamp-2 ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {menu.description}
                        </p>
                        <div className="mt-3 pt-2 border-t border-white/10 flex items-baseline justify-between">
                          <span
                            className={`text-sm font-black ${
                              isSelected ? 'text-sky-400' : 'text-indigo-600'
                            }`}
                          >
                            {formatCurrency(menu.adultPrice)}{' '}
                            <span className="text-[10px] font-normal opacity-75">/ adulto</span>
                          </span>
                          <span
                            className={`text-[11px] ${
                              isSelected ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            Niño: {formatCurrency(menu.childPrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 6: ENTRETENIMIENTO */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div className="border-b border-slate-200/70 pb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                    Paso 6 de 9
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Música, DJ y Entretenimiento
                  </h3>
                  <p className="text-xs text-slate-500">
                    Activa o desactiva los espectáculos que deseas incluir
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-96 overflow-y-auto pr-1">
                  {entertainments.map((ent) => {
                    const isSelected = selectedEntIds.includes(ent.id);
                    return (
                      <div
                        key={ent.id}
                        onClick={() => toggleEntertainment(ent.id)}
                        className={`p-4 rounded-3xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                            : 'bg-white/85 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs">{ent.name}</h4>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'bg-white text-indigo-600 border-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                        <p
                          className={`text-[11px] mt-1 ${
                            isSelected ? 'text-indigo-100' : 'text-slate-500'
                          }`}
                        >
                          {ent.durationHours} horas de cobertura
                        </p>
                        <p
                          className={`text-sm font-black mt-2 ${
                            isSelected ? 'text-white' : 'text-indigo-700'
                          }`}
                        >
                          {formatCurrency(ent.price)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 7: EXTRAS Y PERSONALIZACIÓN A LA MEDIDA DEL CLIENTE */}
            {currentStep === 7 && (
              <div className="space-y-5">
                <div className="border-b border-slate-200/70 pb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                    Paso 7 de 9
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Extras y Personalización Libre del Cliente
                  </h3>
                  <p className="text-xs text-slate-500">
                    Elige horas extra, servicios de catálogo o agrega tus propios conceptos personalizados
                  </p>
                </div>

                {/* Horas Adicionales */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      Horas Adicionales de Salón
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      $1,500 MXN por cada hora adicional de evento
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={8}
                      value={extraHours}
                      onChange={(e) => setExtraHours(Math.max(0, Number(e.target.value)))}
                      className="w-16 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-sm font-black text-slate-900 text-center"
                    />
                    <span className="text-xs text-slate-500 font-semibold">hrs</span>
                  </div>
                </div>

                {/* Creador de Conceptos Personalizados por el Cliente */}
                <div className="p-4 rounded-3xl bg-indigo-50/70 border border-indigo-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                      <Wand2 className="w-4 h-4 text-indigo-600" />
                      <span>Agregar Concepto o Petición Personalizada a tu Cotización</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <input
                      type="text"
                      placeholder="Ej. Mesa de dulces premium, Pirotecnia fría, Saxofonista..."
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      className="sm:col-span-6 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="Precio ($)"
                      value={newCustomPrice}
                      onChange={(e) => setNewCustomPrice(e.target.value)}
                      className="sm:col-span-3 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      className="sm:col-span-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>

                  {customItems.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {customItems.map((ci) => (
                        <div
                          key={ci.id}
                          className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-indigo-100 text-xs"
                        >
                          <span className="font-bold text-slate-800">
                            ✨ {ci.name} (x{ci.quantity})
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-indigo-600">
                              {formatCurrency(ci.price * ci.quantity)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomItem(ci.id)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Catálogo de Servicios Extras */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {services.map((srv) => {
                    const isSelected = selectedServiceIds.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white/85 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs">{srv.name}</h4>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'bg-sky-400 border-sky-400 text-slate-950'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                        <p
                          className={`text-xs font-black mt-1.5 ${
                            isSelected ? 'text-sky-400' : 'text-indigo-700'
                          }`}
                        >
                          {formatCurrency(srv.price)}{' '}
                          <span className="text-[10px] font-normal opacity-70">
                            {srv.billingType === 'PER_PERSON' ? '/ persona' : 'fijo'}
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 8: DESCUENTOS */}
            {currentStep === 8 && (
              <div className="space-y-5">
                <div className="border-b border-slate-200/70 pb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                    Paso 8 de 9
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Promociones y Ajustes de Presupuesto
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aplica un descuento comercial o ajusta para cuadrar con el presupuesto del cliente
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 rounded-3xl bg-white/90 border border-slate-200 space-y-4">
                    <label className="block text-xs font-bold text-slate-700">
                      Tipo de Beneficio
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDiscountType('FIXED')}
                        className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                          discountType === 'FIXED'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Monto Fijo ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('PERCENTAGE')}
                        className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                          discountType === 'PERCENTAGE'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Porcentaje (%)
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Valor del Descuento
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-base font-black text-slate-900"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl bg-white/90 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Ajuste Automático al Presupuesto
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Si tu cotización supera tu presupuesto de{' '}
                        <strong>{formatCurrency(estimatedBudget)}</strong>, puedes cuadrarla con 1 clic.
                      </p>
                      {isOverBudget && (
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountType('FIXED');
                            setDiscountValue(Math.max(0, calculation.subtotal - estimatedBudget));
                          }}
                          className="mt-3 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                        >
                          ✨ Ajustar exactamente a mi presupuesto ({formatCurrency(estimatedBudget)})
                        </button>
                      )}
                    </div>
                    <div className="text-right pt-4">
                      <span className="text-xs text-slate-400 block">Ahorro aplicado</span>
                      <span className="text-2xl font-black text-rose-600">
                        -{formatCurrency(calculation.discountTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 9: RESUMEN FINAL Y LAS DOS OPCIONES (WHATSAPP DUEÑO + PDF O MERCADO PAGO) */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200/70 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                      Paso Final • Cotización Lista
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      Elige cómo deseas finalizar tu cotización
                    </h3>
                    <p className="text-xs text-slate-500">
                      Se guardará automáticamente en el apartado{' '}
                      <strong className="text-slate-800">&ldquo;Cotizaciones&rdquo;</strong> del perfil de{' '}
                      <strong className="text-slate-800">{selectedCustomer?.name}</strong>.
                    </p>
                  </div>
                </div>

                {/* Resumen compacto de conceptos */}
                <div className="border border-slate-200/90 rounded-3xl overflow-hidden bg-white/90 divide-y divide-slate-100 text-xs shadow-sm">
                  <div className="p-3.5 bg-slate-50/90 flex items-center justify-between font-bold text-slate-700">
                    <span>Conceptos Personalizados ({calculation.items.length})</span>
                    <span>Importe</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {calculation.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 px-4 flex items-center justify-between hover:bg-slate-50/60"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {item.quantity} x {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-sky-400 font-bold block">
                        Inversión Final Cotizada
                      </span>
                      <span className="text-xs text-slate-300">
                        Anticipo 30%: <strong>{formatCurrency(calculation.total * 0.3)}</strong>
                      </span>
                    </div>
                    <span className="text-2xl font-black text-white">
                      {formatCurrency(calculation.total)}
                    </span>
                  </div>
                </div>

                {/* Notas y WhatsApp del dueño */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      WhatsApp del Dueño del Salón (Destino del PDF)
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={ownerWhatsappPhone}
                        onChange={(e) => setOwnerWhatsappPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                        placeholder="5215512345678"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Notas o peticiones especiales del cliente
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Montaje imperial blanco, menú sin gluten en mesa 1..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* LAS 2 GRANDES OPCIONES FINALES SOLICITADAS POR EL USUARIO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  {/* OPCIÓN 1: MANDAR COTIZACIÓN POR WHATSAPP AL DUEÑO + PDF + GUARDAR EN PERFIL */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 border-2 border-emerald-500/30 shadow-lg flex flex-col justify-between space-y-4 hover:shadow-xl transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                          Opción 1 • Envío Directo + PDF
                        </span>
                        <MessageCircle className="w-6 h-6 text-[#25D366]" />
                      </div>
                      <h4 className="text-lg font-black text-slate-900 tracking-tight">
                        Mandar Cotización por WhatsApp al Dueño
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Guarda la cotización en el apartado <strong>&ldquo;Cotizaciones&rdquo;</strong> de tu perfil, genera el <strong>PDF oficial</strong> y abre el WhatsApp del dueño del salón con el enlace al PDF listo para enviar.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSendViaWhatsAppToOwner}
                      className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-extrabold text-xs shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          <span>Enviar PDF por WhatsApp al Dueño y Guardar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* OPCIÓN 2: PAGAR AHORA CON API DE MERCADO PAGO */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[#009EE3]/10 via-white to-sky-500/10 border-2 border-[#009EE3]/35 shadow-lg flex flex-col justify-between space-y-4 hover:shadow-xl transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-[#009EE3]/15 text-[#009EE3] text-[10px] font-extrabold uppercase tracking-wider">
                          Opción 2 • API Mercado Pago
                        </span>
                        <CreditCard className="w-6 h-6 text-[#009EE3]" />
                      </div>
                      <h4 className="text-lg font-black text-slate-900 tracking-tight">
                        Pagar en Línea con Mercado Pago
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Guarda tu cotización en tu perfil y procede al pago seguro con tarjeta, saldo Mercado Pago o SPEI para bloquear tu fecha de inmediato.
                      </p>

                      {/* Selector rápido 30% vs 100% */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setMpAmountType('DEPOSIT')}
                          className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                            mpAmountType === 'DEPOSIT'
                              ? 'bg-[#009EE3] text-white border-[#009EE3]'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          Anticipo 30% ({formatCurrency(calculation.total * 0.3)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setMpAmountType('FULL')}
                          className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                            mpAmountType === 'FULL'
                              ? 'bg-[#009EE3] text-white border-[#009EE3]'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          Total 100% ({formatCurrency(calculation.total)})
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handlePayWithMercadoPago}
                      className="w-full py-3.5 px-5 rounded-2xl bg-[#009EE3] hover:bg-[#0088c6] text-white font-extrabold text-xs shadow-lg shadow-[#009EE3]/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Ir a Pagar con Mercado Pago</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="pt-6 border-t border-slate-200/60 flex items-center justify-between mt-6">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Paso Anterior</span>
            </button>

            {currentStep < 9 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(9, prev + 1))}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full text-xs shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
              >
                <span>Continuar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveToCustomerProfileOnly}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-full text-xs transition-all"
              >
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Solo Guardar en Perfil del Cliente</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Apple Dynamic Island Live Pricing & Budget Tracker (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="apple-dark-island text-white rounded-[28px] p-6 flex flex-col justify-between sticky top-24 space-y-5">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-black text-sm tracking-tight text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-sky-400" />
                  <span>Cotización en Tiempo Real</span>
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  MXN
                </span>
              </div>

              {/* MEDIDOR INTELIGENTE DE PRESUPUESTO ESTILO APPLE */}
              {estimatedBudget > 0 && (
                <div className="my-4 p-4 rounded-2xl bg-white/[0.06] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-sky-400" />
                      Presupuesto Cliente:
                    </span>
                    <strong className="font-bold text-white">
                      {formatCurrency(estimatedBudget)}
                    </strong>
                  </div>

                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget
                          ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                          : 'bg-gradient-to-r from-emerald-400 to-sky-400'
                      }`}
                      style={{ width: `${Math.min(100, budgetRatio)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{budgetRatio}% utilizado</span>
                    {isOverBudget ? (
                      <span className="text-rose-400 font-bold">
                        Excede por {formatCurrency(Math.abs(budgetDifference))}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">
                        Disponible: {formatCurrency(budgetDifference)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Info Summary */}
              <div className="py-3 text-xs text-slate-300 border-b border-white/10 space-y-1.5">
                <p className="flex justify-between">
                  <span className="text-slate-400">Cliente:</span>
                  <strong className="text-white">{selectedCustomer?.name || 'No seleccionado'}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Espacio:</span>
                  <strong className="text-white">{selectedVenue?.name}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Fecha:</span>
                  <strong className="text-sky-300">{eventDate}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Aforo:</span>
                  <strong className="text-white">
                    {adults} adultos {children > 0 ? `+ ${children} niños` : ''}
                  </strong>
                </p>
              </div>

              {/* Desglose de Precios */}
              <div className="py-4 space-y-2.5 text-xs divide-y divide-white/10">
                {calculation.baseVenuePrice > 0 && (
                  <div className="flex items-center justify-between pt-1 text-slate-300">
                    <span>Renta de Salón</span>
                    <span className="font-bold text-white">
                      {formatCurrency(calculation.baseVenuePrice)}
                    </span>
                  </div>
                )}

                {calculation.packagePrice > 0 && (
                  <div className="flex items-center justify-between pt-2 text-slate-300">
                    <span>Paquete {selectedPackage?.name}</span>
                    <span className="font-bold text-white">
                      {formatCurrency(calculation.packagePrice)}
                    </span>
                  </div>
                )}

                {calculation.menuPrice > 0 && (
                  <div className="flex items-center justify-between pt-2 text-slate-300">
                    <span className="truncate pr-2">
                      Banquete: {selectedMenu?.name} ({adults}x)
                    </span>
                    <span className="font-bold text-white">
                      {formatCurrency(calculation.menuPrice)}
                    </span>
                  </div>
                )}

                {calculation.entertainmentTotal > 0 && (
                  <div className="flex items-center justify-between pt-2 text-slate-300">
                    <span>Música y Shows ({selectedEnts.length})</span>
                    <span className="font-bold text-white">
                      {formatCurrency(calculation.entertainmentTotal)}
                    </span>
                  </div>
                )}

                {calculation.servicesTotal > 0 && (
                  <div className="flex items-center justify-between pt-2 text-slate-300">
                    <span>Extras y Personalizados</span>
                    <span className="font-bold text-white">
                      {formatCurrency(calculation.servicesTotal)}
                    </span>
                  </div>
                )}

                {calculation.extraHoursTotal > 0 && (
                  <div className="flex items-center justify-between pt-2 text-slate-300">
                    <span>{extraHours} Horas Extras</span>
                    <span className="font-bold text-white">
                      {formatCurrency(calculation.extraHoursTotal)}
                    </span>
                  </div>
                )}

                {calculation.discountTotal > 0 && (
                  <div className="flex items-center justify-between pt-2 text-rose-400 font-bold">
                    <span>Beneficio Aplicado</span>
                    <span>-{formatCurrency(calculation.discountTotal)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gran Total + Botón Rápido al Paso 9 */}
            <div className="pt-4 border-t border-white/15 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">
                  Inversión Total Cotizada
                </span>
                <p className="text-3xl font-black text-white tracking-tight mt-0.5">
                  {formatCurrency(calculation.total)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.07] border border-white/10 text-xs text-slate-200 flex items-center justify-between">
                <span>Anticipo 30% (Mercado Pago):</span>
                <strong className="text-sky-300 font-black">
                  {formatCurrency(calculation.total * 0.3)}
                </strong>
              </div>

              {currentStep < 9 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(9)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-bold text-xs shadow-md transition-all"
                >
                  Ir directo a Enviar por WhatsApp o Pagar →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
