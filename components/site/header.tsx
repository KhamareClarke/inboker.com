'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isDark = pathname === '/' && !scrolled && !mobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled || mobileMenuOpen
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_16px_rgba(0,0,0,0.06)]'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex h-[68px] items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 group-hover:bg-blue-500 transition-colors duration-200 shadow-sm shadow-blue-600/25">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className={cn(
              'font-display text-[17px] font-bold tracking-tight transition-colors duration-300',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              Inboker
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    'px-3.5 py-2 text-[14px] font-medium rounded-lg transition-all duration-150',
                    isDark
                      ? isActive
                        ? 'text-white bg-white/[0.12]'
                        : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                      : isActive
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className={cn(
                'hidden lg:block px-3.5 py-2 text-[14px] font-medium rounded-lg transition-all duration-150',
                isDark
                  ? 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={cn(
                'hidden sm:flex items-center gap-1.5 text-white text-[14px] font-semibold h-9 px-4 rounded-lg transition-all duration-150 shadow-sm',
                isDark
                  ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-white/10'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/15'
              )}
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              className={cn(
                'lg:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
                isDark
                  ? 'text-white/70 hover:bg-white/[0.1] hover:text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* Mobile menu */}
        <div className={cn(
          'lg:hidden overflow-hidden transition-all duration-200 ease-in-out',
          mobileMenuOpen ? 'max-h-[480px] pb-5' : 'max-h-0'
        )}>
          <div className={cn('border-t pt-3', isDark ? 'border-white/[0.1]' : 'border-gray-100')}>
            <nav className="flex flex-col gap-0.5 mb-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-3 py-2.5 text-[15px] font-medium rounded-lg transition-colors',
                      isDark
                        ? isActive
                          ? 'text-white bg-white/[0.1]'
                          : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                        : isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className={cn('flex flex-col gap-2 pt-3 border-t', isDark ? 'border-white/[0.1]' : 'border-gray-100')}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-center h-11 px-4 text-[15px] font-medium rounded-xl transition-colors',
                  isDark
                    ? 'text-white/80 border border-white/[0.14] hover:bg-white/[0.06]'
                    : 'text-gray-700 border border-gray-200 hover:border-gray-300'
                )}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 h-11 px-4 text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
              >
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
