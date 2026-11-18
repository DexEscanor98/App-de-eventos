import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { PaymentsView } from '@/components/payments/payments-view';

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const [payments, customersWithReservations] = await Promise.all([
    prisma.payment.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        customer: true,
        reservation: true,
        receivedBy: true,
      },
      orderBy: { paymentDate: 'desc' },
    }),
    prisma.customer.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        reservations: {
          where: { status: { not: 'CANCELLED' } },
          select: { id: true, folio: true, balanceAmount: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <PaymentsView
          initialPayments={payments}
          customers={customersWithReservations}
        />
      </div>
    </AppShell>
  );
}
