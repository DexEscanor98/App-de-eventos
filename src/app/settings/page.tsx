import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/layout/app-shell';
import { SettingsView } from '@/components/settings/settings-view';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId || 'tenant-salon-imperial';

  const [settings, tenant] = await Promise.all([
    prisma.businessSettings.findUnique({ where: { tenantId } }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <SettingsView settings={settings} tenant={tenant} />
      </div>
    </AppShell>
  );
}
