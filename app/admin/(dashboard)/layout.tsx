import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If not logged in, redirect to login page
  if (!session) {
    redirect('/admin/login');
  }

  // If role is CUSTOMER, they don't have vendor/admin privileges
  if (session.role !== 'ADMIN' && session.role !== 'VENDOR') {
    redirect('/admin/login?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Dynamic Sidebar with active user context */}
      <AdminSidebar session={session} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
