'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { useAuth } from '@/lib/providers/auth-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = useAuth();

  // Customers get a simple full-width layout (no sidebar)
  if (role === 'customer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-gray-200 bg-white">
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
