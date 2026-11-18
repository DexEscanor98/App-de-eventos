/**
 * MOTOR DE PRECIOS CENTRALIZADO - EVENTIA SAAS
 * Manejo de cálculos financieros exactos evitando imprecisiones de coma flotante.
 */

export interface PricingInputItem {
  id?: string;
  name: string;
  price: number;
  quantity?: number;
  billingType?: 'FIXED' | 'PER_PERSON' | 'PER_HOUR' | 'PER_UNIT' | 'PER_TABLE' | 'PER_PACKAGE';
  hours?: number;
  extraHours?: number;
  extraHourPrice?: number;
}

export interface DiscountInput {
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
}

export interface QuoteCalculationParams {
  adults: number;
  children?: number;
  venuePrice?: number;
  packagePrice?: number;
  packageIncludedGuests?: number;
  packageExtraGuestPrice?: number;
  menuAdultPrice?: number;
  menuChildPrice?: number;
  extraHours?: number;
  extraHourPrice?: number;
  entertainments?: PricingInputItem[];
  services?: PricingInputItem[];
  discount?: DiscountInput;
  taxRate?: number; // Ej: 0.16 para 16% IVA, o 0 si exento
}

export interface CalculatedQuoteItem {
  type: 'VENUE' | 'PACKAGE' | 'MENU' | 'ENTERTAINMENT' | 'SERVICE' | 'EXTRA_HOUR' | 'EXTRA_PERSON' | 'CUSTOM';
  referenceId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface QuoteCalculationResult {
  baseVenuePrice: number;
  packagePrice: number;
  menuPrice: number;
  extraGuestsPrice: number;
  entertainmentTotal: number;
  servicesTotal: number;
  extraHoursTotal: number;
  subtotal: number;
  discountType: 'PERCENTAGE' | 'FIXED' | null;
  discountValue: number;
  discountTotal: number;
  discountedSubtotal: number;
  taxRate: number;
  taxTotal: number;
  total: number;
  items: CalculatedQuoteItem[];
}

/**
 * Redondeo financiero seguro a 2 decimales
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula el desglose monetario completo de una cotización
 */
export function calculateQuote(params: QuoteCalculationParams): QuoteCalculationResult {
  const adults = Math.max(0, params.adults || 0);
  const children = Math.max(0, params.children || 0);
  const totalGuests = adults + children;

  const items: CalculatedQuoteItem[] = [];

  // 1. Renta de Salón / Espacio
  const baseVenuePrice = roundCurrency(params.venuePrice || 0);
  if (baseVenuePrice > 0) {
    items.push({
      type: 'VENUE',
      name: 'Renta de Salón / Espacio',
      description: 'Costo base de apartado del salón por horario estándar',
      quantity: 1,
      unitPrice: baseVenuePrice,
      total: baseVenuePrice,
    });
  }

  // 2. Paquete base (si se seleccionó)
  let packagePrice = roundCurrency(params.packagePrice || 0);
  let extraGuestsPrice = 0;
  if (packagePrice > 0) {
    items.push({
      type: 'PACKAGE',
      name: 'Paquete de Evento',
      description: `Incluye hasta ${params.packageIncludedGuests || 100} personas`,
      quantity: 1,
      unitPrice: packagePrice,
      total: packagePrice,
    });

    const includedGuests = params.packageIncludedGuests || 100;
    const extraGuestPrice = params.packageExtraGuestPrice || 0;
    if (totalGuests > includedGuests && extraGuestPrice > 0) {
      const extraCount = totalGuests - includedGuests;
      extraGuestsPrice = roundCurrency(extraCount * extraGuestPrice);
      items.push({
        type: 'EXTRA_PERSON',
        name: `Personas adicionales al paquete (${extraCount})`,
        quantity: extraCount,
        unitPrice: extraGuestPrice,
        total: extraGuestsPrice,
      });
    }
  }

  // 3. Menú por persona
  let menuPrice = 0;
  const menuAdultPrice = params.menuAdultPrice || 0;
  const menuChildPrice = params.menuChildPrice || 0;

  if (menuAdultPrice > 0 && adults > 0) {
    const adultTotal = roundCurrency(adults * menuAdultPrice);
    menuPrice += adultTotal;
    items.push({
      type: 'MENU',
      name: `Banquete Adultos (${adults} personas)`,
      quantity: adults,
      unitPrice: menuAdultPrice,
      total: adultTotal,
    });
  }

  if (menuChildPrice > 0 && children > 0) {
    const childTotal = roundCurrency(children * menuChildPrice);
    menuPrice += childTotal;
    items.push({
      type: 'MENU',
      name: `Banquete Niños (${children} niños)`,
      quantity: children,
      unitPrice: menuChildPrice,
      total: childTotal,
    });
  }

  // 4. Horas adicionales
  const extraHours = Math.max(0, params.extraHours || 0);
  const extraHourRate = params.extraHourPrice || 1500;
  const extraHoursTotal = roundCurrency(extraHours * extraHourRate);
  if (extraHours > 0) {
    items.push({
      type: 'EXTRA_HOUR',
      name: `Horas adicionales de servicio (${extraHours} hrs)`,
      quantity: extraHours,
      unitPrice: extraHourRate,
      total: extraHoursTotal,
    });
  }

  // 5. Entretenimiento
  let entertainmentTotal = 0;
  if (params.entertainments && params.entertainments.length > 0) {
    for (const ent of params.entertainments) {
      const baseCost = ent.price || 0;
      const extraH = ent.extraHours || 0;
      const extraHRate = ent.extraHourPrice || 0;
      const totalEnt = roundCurrency(baseCost + (extraH * extraHRate));
      entertainmentTotal += totalEnt;

      items.push({
        type: 'ENTERTAINMENT',
        referenceId: ent.id,
        name: ent.name,
        description: extraH > 0 ? `Incluye ${extraH} hrs extras` : undefined,
        quantity: 1,
        unitPrice: totalEnt,
        total: totalEnt,
      });
    }
  }

  // 6. Servicios Adicionales (Extras)
  let servicesTotal = 0;
  if (params.services && params.services.length > 0) {
    for (const s of params.services) {
      let qty = s.quantity || 1;
      let unitPrice = s.price || 0;

      if (s.billingType === 'PER_PERSON') {
        qty = totalGuests;
      }

      const totalService = roundCurrency(qty * unitPrice);
      servicesTotal += totalService;

      items.push({
        type: 'SERVICE',
        referenceId: s.id,
        name: s.name,
        quantity: qty,
        unitPrice: unitPrice,
        total: totalService,
      });
    }
  }

  // 7. Subtotal
  const subtotal = roundCurrency(
    baseVenuePrice +
    packagePrice +
    extraGuestsPrice +
    menuPrice +
    extraHoursTotal +
    entertainmentTotal +
    servicesTotal
  );

  // 8. Descuentos
  let discountTotal = 0;
  let discountType: 'PERCENTAGE' | 'FIXED' | null = null;
  let discountValue = 0;

  if (params.discount && params.discount.value > 0) {
    discountType = params.discount.type;
    discountValue = params.discount.value;

    if (params.discount.type === 'PERCENTAGE') {
      discountTotal = roundCurrency((subtotal * Math.min(100, params.discount.value)) / 100);
    } else {
      discountTotal = roundCurrency(Math.min(subtotal, params.discount.value));
    }
  }

  const discountedSubtotal = roundCurrency(Math.max(0, subtotal - discountTotal));

  // 9. Impuestos (IVA u opcional)
  const taxRate = params.taxRate !== undefined ? params.taxRate : 0;
  const taxTotal = roundCurrency(discountedSubtotal * taxRate);

  // 10. Total general
  const total = roundCurrency(discountedSubtotal + taxTotal);

  return {
    baseVenuePrice,
    packagePrice,
    menuPrice,
    extraGuestsPrice,
    entertainmentTotal,
    servicesTotal,
    extraHoursTotal,
    subtotal,
    discountType,
    discountValue,
    discountTotal,
    discountedSubtotal,
    taxRate,
    taxTotal,
    total,
    items,
  };
}
