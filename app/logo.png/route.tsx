import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
          borderRadius: 96,
        }}
      >
        {/* Calendar icon shape */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 280,
            height: 280,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 48,
            border: '6px solid rgba(255,255,255,0.4)',
          }}
        >
          {/* Calendar top bar */}
          <div
            style={{
              width: '100%',
              height: 60,
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '36px 36px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          />
          {/* Grid dots */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              padding: '0 24px',
            }}
          >
            {[[1, 2, 3], [1, 2, 3]].map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 14 }}>
                {row.map((_, ci) => (
                  <div
                    key={ci}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.7)',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
