import { describe, it, expect } from 'vitest';
import { calculateQuote, roundCurrency } from '../src/lib/pricing-engine';
import { timeSlotsOverlap, timeToMinutes } from '../src/lib/availability';
import { hasPermission } from '../src/lib/rbac';

describe('1. Motor de Precios y Cotizaciones - EVENTIA', () => {
  it('calcula con precisión matemática el caso demo exacto de 52,000 MXN', () => {
    // Escenario solicitado por el usuario:
    // Evento: 100 personas
    // Menú: Carnitas (100 × $300 = $30,000)
    // Salón: $10,000
    // DJ: $5,000
    // Decoración: $4,000
    // 2 horas adicionales: 2 × $1,500 = $3,000
    // TOTAL: $52,000

    const result = calculateQuote({
      adults: 100,
      children: 0,
      venuePrice: 10000,
      menuAdultPrice: 300,
      extraHours: 2,
      extraHourPrice: 1500,
      entertainments: [
        { name: 'DJ Profesional', price: 5000 },
      ],
      services: [
        { name: 'Decoración Temática', price: 4000, billingType: 'FIXED' },
      ],
    });

    expect(result.baseVenuePrice).toBe(10000);
    expect(result.menuPrice).toBe(30000);
    expect(result.entertainmentTotal).toBe(5000);
    expect(result.servicesTotal).toBe(4000);
    expect(result.extraHoursTotal).toBe(3000);
    expect(result.subtotal).toBe(52000);
    expect(result.total).toBe(52000);
  });

  it('aplica descuento fijo y porcentual correctamente', () => {
    // 10% de descuento sobre $52,000 = $5,200 -> total $46,800
    const withPercentageDiscount = calculateQuote({
      adults: 100,
      venuePrice: 10000,
      menuAdultPrice: 300,
      extraHours: 2,
      extraHourPrice: 1500,
      entertainments: [{ name: 'DJ', price: 5000 }],
      services: [{ name: 'Decoración', price: 4000, billingType: 'FIXED' }],
      discount: { type: 'PERCENTAGE', value: 10 },
    });

    expect(withPercentageDiscount.discountTotal).toBe(5200);
    expect(withPercentageDiscount.total).toBe(46800);

    // Descuento fijo de $2,000 sobre $52,000 = $50,000
    const withFixedDiscount = calculateQuote({
      adults: 100,
      venuePrice: 10000,
      menuAdultPrice: 300,
      extraHours: 2,
      extraHourPrice: 1500,
      entertainments: [{ name: 'DJ', price: 5000 }],
      services: [{ name: 'Decoración', price: 4000, billingType: 'FIXED' }],
      discount: { type: 'FIXED', value: 2000 },
    });

    expect(withFixedDiscount.discountTotal).toBe(2000);
    expect(withFixedDiscount.total).toBe(50000);
  });

  it('calcula anticipo del 30% y saldo resultante con exactitud milimétrica', () => {
    const total = 52000;
    const depositPercentage = 0.3;
    const deposit = roundCurrency(total * depositPercentage);
    const balance = roundCurrency(total - deposit);

    expect(deposit).toBe(15600);
    expect(balance).toBe(36400);
  });
});

describe('2. Prevención de Doble Reservación (Anti-Double Booking)', () => {
  it('detecta solapamientos usando la regla: newStart < existingEnd AND newEnd > existingStart', () => {
    // Evento existente: 14:00 a 19:00
    const existingStart = '14:00';
    const existingEnd = '19:00';

    // Intento 1: 15:00 a 20:00 (se solapa) -> conflicto
    expect(timeSlotsOverlap('15:00', '20:00', existingStart, existingEnd)).toBe(true);

    // Intento 2: 12:00 a 16:00 (se solapa) -> conflicto
    expect(timeSlotsOverlap('12:00', '16:00', existingStart, existingEnd)).toBe(true);

    // Intento 3: 14:30 a 18:30 (dentro del rango) -> conflicto
    expect(timeSlotsOverlap('14:30', '18:30', existingStart, existingEnd)).toBe(true);

    // Intento 4: 09:00 a 14:00 (termina justo cuando empieza el otro) -> NO se solapa
    expect(timeSlotsOverlap('09:00', '14:00', existingStart, existingEnd)).toBe(false);

    // Intento 5: 19:00 a 23:00 (empieza justo cuando termina el otro) -> NO se solapa
    expect(timeSlotsOverlap('19:00', '23:00', existingStart, existingEnd)).toBe(false);

    // Intento 6: 20:00 a 23:00 (completamente después) -> NO se solapa
    expect(timeSlotsOverlap('20:00', '23:00', existingStart, existingEnd)).toBe(false);
  });
});

describe('3. Matriz de Roles y Permisos RBAC', () => {
  it('garantiza que SALES puede cotizar pero NO gestionar configuración ni borrar tenants', () => {
    expect(hasPermission('SALES', 'canManageQuotes')).toBe(true);
    expect(hasPermission('SALES', 'canConvertQuoteToReservation')).toBe(true);
    expect(hasPermission('SALES', 'canManageSettings')).toBe(false);
    expect(hasPermission('SALES', 'canManageTenants')).toBe(false);
  });

  it('garantiza que CASHIER puede cobrar pagos pero NO crear cotizaciones', () => {
    expect(hasPermission('CASHIER', 'canManagePayments')).toBe(true);
    expect(hasPermission('CASHIER', 'canIssueRefunds')).toBe(true);
    expect(hasPermission('CASHIER', 'canManageQuotes')).toBe(false);
  });

  it('garantiza que ADMIN tiene control total sobre el negocio', () => {
    expect(hasPermission('ADMIN', 'canManageQuotes')).toBe(true);
    expect(hasPermission('ADMIN', 'canManageReservations')).toBe(true);
    expect(hasPermission('ADMIN', 'canManagePayments')).toBe(true);
    expect(hasPermission('ADMIN', 'canManageSettings')).toBe(true);
  });
});
