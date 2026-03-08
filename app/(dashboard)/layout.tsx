'use client';

import { Container } from '@/components/ui/container';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 dark:from-slate-950 dark:via-blue-950/10 dark:to-cyan-950/10">
      <main className="w-full overflow-y-auto">
        <Container size="wide" className="py-ds-4 sm:py-ds-6">
          {children}
        </Container>
      </main>
    </div>
  );
}
