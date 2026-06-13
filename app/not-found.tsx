import Link from 'next/link';
import { Calendar, ArrowRight, Home, Search } from 'lucide-react';

export default function NotFound() {
  const suggestions = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-gray-100 px-5 py-4">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Inboker</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="text-center max-w-lg">
          {/* 404 visual */}
          <div className="relative inline-flex mb-8">
            <div className="text-[120px] sm:text-[160px] font-extrabold leading-none tracking-tight text-gray-100 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                <Search className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
            Page not found
          </h1>
          <p className="text-gray-500 leading-relaxed mb-8">
            The page you're looking for doesn't exist or has been moved. Here are some pages that might help.
          </p>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                {s.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              <Home className="h-4 w-4" />
              Go to home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              Contact support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
