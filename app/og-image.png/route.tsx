import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'AI-Powered Booking Engine';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 55%, #312e81 100%)',
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top-right accent dots */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            right: 72,
            display: 'flex',
            gap: 12,
          }}
        >
          {['#60a5fa', '#34d399', '#a78bfa'].map((color, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: color,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        {/* Logo row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 36,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.85)' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.55)' }} />
              ))}
            </div>
          </div>
          <span
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: 'white',
              letterSpacing: -1,
            }}
          >
            Inboker
          </span>
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: title.length > 50 ? 54 : 64,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            letterSpacing: -2,
            marginBottom: 28,
            maxWidth: 960,
            zIndex: 1,
          }}
        >
          {title}
        </div>

        {/* URL tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 100,
            padding: '8px 20px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#34d399',
            }}
          />
          <span style={{ fontSize: 22, color: 'rgba(147,197,253,1)', fontWeight: 500 }}>
            inboker.com
          </span>
        </div>

        {/* Right-side decorative card */}
        <div
          style={{
            position: 'absolute',
            right: 72,
            bottom: 72,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 20,
            padding: '20px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minWidth: 220,
          }}
        >
          {[
            { label: '92% fewer no-shows', dot: '#34d399' },
            { label: '14-day free trial', dot: '#60a5fa' },
            { label: '2,000+ businesses', dot: '#a78bfa' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: item.dot,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
