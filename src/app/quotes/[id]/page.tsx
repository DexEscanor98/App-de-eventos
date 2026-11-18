import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { QuoteDetailView } from '@/components/quotes/quote-detail-view';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const [quote, businessSettings] = await Promise.all([
    prisma.quote.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        venue: true,
        eventType: true,
        items: true,
      },
    }),
    prisma.businessSettings.findUnique({
      where: { tenantId },
    }),
  ]);

  if (!quote) {
    notFound();
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <QuoteDetailView quote={quote} businessSettings={businessSettings} />
      </div>
    </AppShell>
  );
}
