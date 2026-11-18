import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { redirect } from 'next/navigation';

interface AppShellProps {
  children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden apple-mesh-bg font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar adaptativo (Dock lateral en PC y Tab Bar inferior en Móvil) */}
      <Sidebar
        userRole={user.role}
        tenantName={user.tenantName || 'Salón Imperial'}
        customerId={user.customerId}
      />

      {/* Contenedor principal con padding inferior extra en móvil para la Tab Bar iOS */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 lg:pb-10 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
