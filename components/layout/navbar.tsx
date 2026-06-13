'use client';

import Link from 'next/link';
import { Calendar, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavbarWrapper } from '@/components/ui/navbar-wrapper';
import { useState } from 'react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <NavbarWrapper className="relative">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative flex items-center justify-center w-10 h-10 rounded-ds bg-gradient-to-br from-blue-600 to-cyan-600 group-hover:scale-105 transition-transform duration-300 shadow-ds-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                Inboker
              </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-ds-4">
              <Link href="#features" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Pricing
              </Link>
              <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Sign in
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <Link href="/signup" className="hidden md:block">
                <Button className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 text-white font-bold px-6 h-10 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 bg-[length:200%_100%] hover:bg-right">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Sign up
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-ds hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px]"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200/60 bg-white/95 backdrop-blur">
              <div className="py-ds-3 space-y-2">
                <Link href="#features" className="block text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 py-2">
                  Features
                </Link>
                <Link href="#pricing" className="block text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 py-2">
                  Pricing
                </Link>
                <Link href="/login" className="block text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 py-2">
                  Sign in
                </Link>
                <div className="pt-ds-2">
                  <Link href="/signup" className="block">
                    <Button className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 text-white font-bold px-6 h-10 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 bg-[length:200%_100%] hover:bg-right">
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Sign up
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </NavbarWrapper>
      </header>
    </>
  );
}
