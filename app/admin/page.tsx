'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <Section as="div" className="min-h-screen flex items-center justify-center py-ds-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Container size="narrow" className="text-center">
        <p className="ds-body text-purple-300">Redirecting to admin dashboard...</p>
      </Container>
    </Section>
  );
}
