import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { CalendarView } from '@/components/calendar/calendar-view';

export default async function CalendarPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const [venues, reservations, events] = await Promise.all([
    prisma.venue.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
      orderBy: { capacity: 'desc' },
    }),
    prisma.reservation.findMany({
      where: {
        tenantId,
        status: { not: 'CANCELLED' },
      },
      include: {
        customer: true,
        venue: true,
        eventType: true,
        payments: { where: { deletedAt: null } },
      },
    }),
    prisma.event.findMany({
      where: {
        tenantId,
        status: { not: 'CANCELLED' },
        reservationId: null, // Si no está ligada a reservación para evitar duplicados
      },
      include: {
        customer: true,
        venue: true,
        eventType: true,
        payments: { where: { deletedAt: null } },
      },
    }),
  ]);

  // Mapear reservaciones a formato común para el calendario
  const calendarEvents = [
    ...reservations.map((r) => {
      const paid = r.payments.reduce((acc, p) => acc + p.amount, 0) || r.paidAmount;
      return {
        id: r.id,
        folio: r.folio,
        title: `${r.eventType.name} - ${r.customer.name}`,
        customerName: r.customer.name,
        customerPhone: r.customer.phone,
        venueId: r.venueId,
        venueName: r.venue.name,
        eventTypeName: r.eventType.name,
        eventColor: r.eventType.color,
        eventDate: r.eventDate.toISOString(),
        startTime: r.startTime,
        endTime: r.endTime,
        adults: r.adults,
        totalAmount: r.totalAmount,
        paidAmount: paid,
        balanceAmount: Math.max(0, r.totalAmount - paid),
        status: r.status,
        type: 'RESERVATION' as const,
      };
    }),
    ...events.map((e) => {
      const paid = e.payments.reduce((acc, p) => acc + p.amount, 0) || e.paidAmount;
      return {
        id: e.id,
        folio: e.folio,
        title: e.name,
        customerName: e.customer.name,
        customerPhone: e.customer.phone,
        venueId: e.venueId,
        venueName: e.venue.name,
        eventTypeName: e.eventType.name,
        eventColor: e.eventType.color,
        eventDate: e.eventDate.toISOString(),
        startTime: e.startTime,
        endTime: e.endTime,
        adults: e.adults,
        totalAmount: e.totalAmount,
        paidAmount: paid,
        balanceAmount: Math.max(0, e.totalAmount - paid),
        status: e.status,
        type: 'EVENT' as const,
      };
    }),
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <CalendarView initialEvents={calendarEvents} venues={venues} />
      </div>
    </AppShell>
  );
}
