// ============================================================================
// EVENTIA — Almacenamiento auxiliar local del navegador (Indexed LocalStorage)
// Almacena presupuestos, cotizaciones personalizadas por cliente y pagos
// ============================================================================

export interface LocalCustomItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface LocalQuoteRecord {
  id: string;
  folio: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  venueName: string;
  eventTypeName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  adults: number;
  children: number;
  estimatedBudget: number;
  total: number;
  depositRequired: number;
  status: string;
  customItems: LocalCustomItem[];
  notes?: string;
  pdfUrl: string;
  createdAt: string;
}

export interface LocalBudgetRecord {
  id: string;
  customerId: string;
  customerName: string;
  estimatedBudget: number;
  calculatedTotal: number;
  difference: number;
  eventDate: string;
  updatedAt: string;
}

export interface LocalDBState {
  quotes: LocalQuoteRecord[];
  budgets: LocalBudgetRecord[];
  ownerWhatsapp: string;
  lastSyncedAt: string;
}

const STORAGE_KEY = 'eventia_apple_local_db_v2';

const DEFAULT_STATE: LocalDBState = {
  quotes: [],
  budgets: [],
  ownerWhatsapp: '5215512345678', // WhatsApp del dueño del salón por defecto
  lastSyncedAt: new Date().toISOString(),
};

export function getLocalDB(): LocalDBState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
      return DEFAULT_STATE;
    }
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveLocalQuote(quote: LocalQuoteRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const db = getLocalDB();
    const existingIdx = db.quotes.findIndex((q) => q.id === quote.id || q.folio === quote.folio);
    if (existingIdx >= 0) {
      db.quotes[existingIdx] = quote;
    } else {
      db.quotes.unshift(quote);
    }

    // También guardar registro de presupuesto
    if (quote.estimatedBudget > 0) {
      const budgetRec: LocalBudgetRecord = {
        id: `bud-${quote.id}`,
        customerId: quote.customerId,
        customerName: quote.customerName,
        estimatedBudget: quote.estimatedBudget,
        calculatedTotal: quote.total,
        difference: quote.estimatedBudget - quote.total,
        eventDate: quote.eventDate,
        updatedAt: new Date().toISOString(),
      };
      const bIdx = db.budgets.findIndex((b) => b.customerId === quote.customerId && b.eventDate === quote.eventDate);
      if (bIdx >= 0) {
        db.budgets[bIdx] = budgetRec;
      } else {
        db.budgets.unshift(budgetRec);
      }
    }

    db.lastSyncedAt = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Error guardando en base local:', err);
  }
}

export function getCustomerLocalQuotes(customerId: string): LocalQuoteRecord[] {
  const db = getLocalDB();
  return db.quotes.filter((q) => q.customerId === customerId);
}

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD según la zona horaria local.
 * Nunca permite fechas en el pasado.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Valida que una cadena YYYY-MM-DD sea hoy o en el futuro.
 */
export function isDateTodayOrFuture(dateStr: string): boolean {
  if (!dateStr) return false;
  const cleanDate = dateStr.split('T')[0];
  const todayStr = getTodayDateString();
  return cleanDate >= todayStr;
}

/**
 * Construye el enlace de WhatsApp dirigido al dueño del salón con el resumen
 * y el link directo al PDF de la cotización guardada en el perfil del cliente.
 */
export function buildOwnerWhatsAppUrl(params: {
  ownerWhatsapp?: string | null;
  salonName?: string;
  folio: string;
  customerName: string;
  customerPhone: string;
  venueName: string;
  eventTypeName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  guests: number;
  estimatedBudget?: number;
  total: number;
  deposit: number;
  quoteId: string;
  itemsSummary?: string[];
}): string {
  const rawPhone = (params.ownerWhatsapp || '5215512345678').replace(/\D/g, '');
  const phone = rawPhone.length === 10 ? `521${rawPhone}` : rawPhone;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const pdfLink = `${origin}/quotes/${params.quoteId}?print=pdf`;

  const formatMXN = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  const lines = [
    `✨ *NUEVA COTIZACIÓN PERSONALIZADA — ${params.salonName || 'SALÓN IMPERIAL'}* ✨`,
    ``,
    `📄 *Folio:* ${params.folio}`,
    `👤 *Cliente:* ${params.customerName} (${params.customerPhone})`,
    `🏛️ *Espacio:* ${params.venueName}`,
    `🎉 *Evento:* ${params.eventTypeName}`,
    `📅 *Fecha:* ${params.eventDate} (${params.startTime} - ${params.endTime})`,
    `👥 *Invitados:* ${params.guests} personas`,
  ];

  if (params.estimatedBudget && params.estimatedBudget > 0) {
    lines.push(`🎯 *Presupuesto Meta del Cliente:* ${formatMXN(params.estimatedBudget)}`);
  }

  if (params.itemsSummary && params.itemsSummary.length > 0) {
    lines.push(``, `📋 *Conceptos personalizados:*`);
    params.itemsSummary.slice(0, 7).forEach((item) => {
      lines.push(`  • ${item}`);
    });
  }

  lines.push(
    ``,
    `💰 *INVERSIÓN TOTAL COTIZADA:* ${formatMXN(params.total)}`,
    `💳 *Anticipo sugerido (30%):* ${formatMXN(params.deposit)}`,
    ``,
    `📥 *Descargar / Ver PDF Oficial de Cotización:*`,
    `${pdfLink}`,
    ``,
    `_Esta cotización ya quedó guardada en el apartado "Cotizaciones" del perfil del cliente._`
  );

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${phone}?text=${encoded}`;
}
