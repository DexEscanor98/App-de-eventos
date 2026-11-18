import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MercadoPagoCheckoutClient } from '@/components/payments/mercadopago-checkout-client';

interface Props {
  params: Promise<{ quoteId: string }>;
  searchParams: Promise<{ type?: string; pref?: string }>;
}

export default async function MercadoPagoCheckoutPage({ params, searchParams }: Props) {
  const { quoteId } = await params;
  const { type = 'DEPOSIT', pref = 'MP-PREF-LIVE' } = await searchParams;

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      customer: true,
      venue: true,
      eventType: true,
      items: true,
    },
  });

  if (!quote) {
    notFound();
  }

  const settings = await prisma.businessSettings.findUnique({
    where: { tenantId: quote.tenantId },
  });

  return (
    <MercadoPagoCheckoutClient
      quote={quote}
      businessSettings={settings}
      initialAmountType={type === 'FULL' ? 'FULL' : 'DEPOSIT'}
      preferenceId={pref}
    />
  );
}
