import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { QuoteWizard } from '@/components/quotes/quote-wizard';

interface Props {
  searchParams: Promise<{
    customerId?: string;
    venueId?: string;
    menuId?: string;
    packageId?: string;
  }>;
}

export default async function NewQuotePage({ searchParams }: Props) {
  const { customerId, venueId, menuId, packageId } = await searchParams;
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';
  const effectiveCustomerId = customerId || user?.customerId || undefined;

  // Consultar todos los catálogos y configuración del salón (incluyendo WhatsApp del dueño) en paralelo
  const [customers, venues, eventTypes, menus, packages, entertainments, services, businessSettings] =
    await Promise.all([
      prisma.customer.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { name: 'asc' },
      }),
      prisma.venue.findMany({
        where: { tenantId, isActive: true },
        orderBy: { capacity: 'desc' },
      }),
      prisma.eventType.findMany({
        where: { tenantId, isActive: true },
        orderBy: { name: 'asc' },
      }),
      prisma.menu.findMany({
        where: { tenantId, isActive: true },
        orderBy: { adultPrice: 'asc' },
      }),
      prisma.package.findMany({
        where: { tenantId, isActive: true },
        orderBy: { basePrice: 'asc' },
      }),
      prisma.entertainment.findMany({
        where: { tenantId, isActive: true },
        orderBy: { price: 'asc' },
      }),
      prisma.additionalService.findMany({
        where: { tenantId, isActive: true },
        orderBy: { price: 'asc' },
      }),
      prisma.businessSettings.findUnique({
        where: { tenantId },
      }),
    ]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <QuoteWizard
          customers={customers}
          venues={venues}
          eventTypes={eventTypes}
          menus={menus}
          packages={packages}
          entertainments={entertainments}
          services={services}
          businessSettings={businessSettings}
          preselectedCustomerId={effectiveCustomerId}
          preselectedVenueId={venueId}
          preselectedMenuId={menuId}
          preselectedPackageId={packageId}
          currentUserRole={user?.role}
        />
      </div>
    </AppShell>
  );
}
