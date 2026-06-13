'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Auth pages — no nav, no footer
  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/signup') ||
                     pathname?.startsWith('/admin-login') ||
                     pathname?.startsWith('/forgot-password') ||
                     pathname?.startsWith('/onboarding');

  // Marketing pages have their own SiteHeader/SiteFooter via (marketing) layout
  const isMarketingPage = pathname === '/' ||
                          pathname?.startsWith('/features') ||
                          pathname?.startsWith('/integrations') ||
                          pathname?.startsWith('/pricing') ||
                          pathname?.startsWith('/about') ||
                          pathname?.startsWith('/contact') ||
                          pathname?.startsWith('/for/') ||
                          pathname?.startsWith('/vs/') ||
                          pathname?.startsWith('/privacy') ||
                          pathname?.startsWith('/terms') ||
                          pathname?.startsWith('/blog');

  // App/dashboard routes: no public navbar or footer (they have their own header)
  const isAppDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || /^\/[^/]+\/(dashboard|services|staff|bookings|appointments)/.test(pathname ?? '');

  const showNavbar = !isMarketingPage && !isAppDashboard && !isAuthPage;
  const showFooter = !isAuthPage && !isMarketingPage && !isAppDashboard;
  
  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

