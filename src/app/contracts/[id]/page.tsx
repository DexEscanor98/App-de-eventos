import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ContractPrintView } from '@/components/contracts/contract-print-view';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reservationId?: string }>;
}

export default async function ContractPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { reservationId } = await searchParams;
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  let contract = null;
  let reservation = null;

  if (id !== 'preview') {
    contract = await prisma.contract.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        reservation: {
          include: {
            venue: true,
            eventType: true,
            payments: { where: { deletedAt: null } },
            quote: { include: { items: true } },
          },
        },
      },
    });
    reservation = contract?.reservation;
  }

  if (!contract && reservationId) {
    reservation = await prisma.reservation.findFirst({
      where: { id: reservationId, tenantId },
      include: {
        customer: true,
        venue: true,
        eventType: true,
        payments: { where: { deletedAt: null } },
        quote: { include: { items: true } },
      },
    });
  }

  if (!reservation) {
    notFound();
  }

  const [businessSettings, cancellationPolicies] = await Promise.all([
    prisma.businessSettings.findUnique({ where: { tenantId } }),
    prisma.cancellationPolicy.findMany({
      where: { tenantId },
      orderBy: { daysBeforeEvent: 'desc' },
    }),
  ]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <ContractPrintView
          contract={contract}
          reservation={reservation}
          businessSettings={businessSettings}
          policies={cancellationPolicies}
        />
      </div>
    </AppShell>
  );
}
