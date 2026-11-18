import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { ReservationDetailView } from '@/components/reservations/reservation-detail-view';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReservationDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const [reservation, businessSettings] = await Promise.all([
    prisma.reservation.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        venue: true,
        eventType: true,
        quote: { include: { items: true } },
        payments: {
          where: { deletedAt: null },
          include: { receivedBy: true },
          orderBy: { paymentDate: 'desc' },
        },
        contracts: true,
      },
    }),
    prisma.businessSettings.findUnique({
      where: { tenantId },
    }),
  ]);

  if (!reservation) {
    notFound();
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <ReservationDetailView
          reservation={reservation}
          businessSettings={businessSettings}
        />
      </div>
    </AppShell>
  );
}
