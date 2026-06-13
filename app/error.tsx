'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Calendar, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-white flex flex-col font-sans antialiased">
        <header className="border-b border-gray-100 px-5 py-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Inboker</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="text-center max-w-md">
            <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
              Something went wrong
            </h1>
            <p className="text-gray-500 leading-relaxed mb-8">
              An unexpected error occurred. Our team has been notified. You can try refreshing the page or return to the home page.
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 mb-6 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <Home className="h-4 w-4" />
                Go home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
