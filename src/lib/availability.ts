import { prisma } from './prisma';

export interface ConflictCheckResult {
  isAvailable: boolean;
  conflictingItem?: {
    id: string;
    folio: string;
    title: string;
    startTime: string;
    endTime: string;
    type: 'RESERVATION' | 'EVENT';
  };
  message?: string;
}

/**
 * Convierte una hora formato "HH:mm" a minutos desde medianoche
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Verifica si dos intervalos de horario se solapan en un mismo día:
 * newStart < existingEnd AND newEnd > existingStart
 */
export function timeSlotsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const minStartA = timeToMinutes(startA);
  const minEndA = timeToMinutes(endA);
  const minStartB = timeToMinutes(startB);
  const minEndB = timeToMinutes(endB);

  return minStartA < minEndB && minEndA > minStartB;
}

/**
 * Verifica disponibilidad de un salón en backend para una fecha y rango de horario específico
 */
export async function checkVenueAvailability(
  tenantId: string,
  venueId: string,
  eventDate: Date | string,
  startTime: string,
  endTime: string,
  excludeReservationId?: string,
  excludeEventId?: string
): Promise<ConflictCheckResult> {
  const targetDate = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;

  // Rango de todo el día para la fecha consultada (00:00:00 a 23:59:59 UTC/Local)
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Verificar reservaciones existentes activas en ese salón para esa fecha
  const existingReservations = await prisma.reservation.findMany({
    where: {
      tenantId,
      venueId,
      eventDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: 'CANCELLED',
      },
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
    },
    include: {
      customer: true,
    },
  });

  for (const res of existingReservations) {
    if (timeSlotsOverlap(startTime, endTime, res.startTime, res.endTime)) {
      return {
        isAvailable: false,
        conflictingItem: {
          id: res.id,
          folio: res.folio,
          title: `Reservación ${res.folio} (${res.customer?.name || 'Cliente'})`,
          startTime: res.startTime,
          endTime: res.endTime,
          type: 'RESERVATION',
        },
        message: `El espacio ya está reservado de ${res.startTime} a ${res.endTime} por ${res.customer?.name || 'otro cliente'}.`,
      };
    }
  }

  // 2. Verificar eventos existentes activos en ese salón para esa fecha
  const existingEvents = await prisma.event.findMany({
    where: {
      tenantId,
      venueId,
      eventDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: 'CANCELLED',
      },
      ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
      ...(excludeReservationId ? { reservationId: { not: excludeReservationId } } : {}),
    },
    include: {
      customer: true,
    },
  });

  for (const evt of existingEvents) {
    if (timeSlotsOverlap(startTime, endTime, evt.startTime, evt.endTime)) {
      return {
        isAvailable: false,
        conflictingItem: {
          id: evt.id,
          folio: evt.folio,
          title: `Evento ${evt.folio} - ${evt.name}`,
          startTime: evt.startTime,
          endTime: evt.endTime,
          type: 'EVENT',
        },
        message: `El espacio tiene programado el evento "${evt.name}" de ${evt.startTime} a ${evt.endTime}.`,
      };
    }
  }

  return { isAvailable: true };
}
