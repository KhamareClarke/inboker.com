'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide footer on auth pages
  const isAuthPage = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/signup') || 
                     pathname?.startsWith('/admin-login');
  
  // Hide navbar on marketing pages (they have their own SiteHeader)
  const isMarketingPage = pathname === '/' || 
                          pathname?.startsWith('/features') ||
                          pathname?.startsWith('/pricing') ||
                          pathname?.startsWith('/templates') ||
                          pathname?.startsWith('/industries') ||
                          pathname?.startsWith('/testimonials') ||
                          pathname?.startsWith('/docs') ||
                          pathname?.startsWith('/blog');

  // App/dashboard routes: no public navbar or footer (they have their own header; no "Sign up" / "Sign in")
  const isAppDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || /^\/[^/]+\/(dashboard|services|staff|bookings|appointments)/.test(pathname ?? '');

  const showNavbar = !isMarketingPage && !isAppDashboard;
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

