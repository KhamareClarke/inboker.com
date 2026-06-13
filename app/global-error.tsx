'use client';

import { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';

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
    <html lang="en-GB">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ borderBottom: '1px solid #f3f4f6', padding: '16px 20px' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#2563eb,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg,#2563eb,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Inboker
            </span>
          </a>
        </header>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
              ⚠️
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6b7280', lineHeight: 1.6, margin: '0 0 32px' }}>
              An unexpected error occurred. Please try refreshing the page or return to the home page.
            </p>
            {error.digest && (
              <p style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace', margin: '0 0 24px' }}>
                Error ID: {error.digest}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 12, background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1px solid #e5e7eb', color: '#374151', padding: '12px 24px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
              >
                Go home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
