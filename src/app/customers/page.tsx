import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { CustomersView } from '@/components/customers/customers-view';

export default async function CustomersPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const customers = await prisma.customer.findMany({
    where: {
      tenantId,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          quotes: true,
          reservations: true,
          events: true,
          payments: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <CustomersView initialCustomers={customers} />
      </div>
    </AppShell>
  );
}
