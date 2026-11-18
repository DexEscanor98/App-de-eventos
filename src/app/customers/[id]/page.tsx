import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { notFound } from 'next/navigation';
import { CustomerProfileClient } from '@/components/customers/customer-profile-client';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; highlight?: string }>;
}

export default async function CustomerDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab, highlight } = await searchParams;
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const [customer, businessSettings] = await Promise.all([
    prisma.customer.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      include: {
        quotes: {
          where: { deletedAt: null },
          include: { venue: true, eventType: true },
          orderBy: { createdAt: 'desc' },
        },
        reservations: {
          include: { venue: true, eventType: true },
          orderBy: { eventDate: 'desc' },
        },
        events: {
          where: { deletedAt: null },
          include: { venue: true, eventType: true },
          orderBy: { eventDate: 'desc' },
        },
        payments: {
          where: { deletedAt: null },
          orderBy: { paymentDate: 'desc' },
        },
      },
    }),
    prisma.businessSettings.findUnique({
      where: { tenantId },
    }),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <AppShell>
      <CustomerProfileClient
        customer={customer}
        businessSettings={businessSettings}
        initialTab={tab}
        highlightQuoteId={highlight}
      />
    </AppShell>
  );
}
