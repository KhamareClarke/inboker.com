export const contentType = 'image/svg+xml';
export const size = { width: 32, height: 32 };

export default function Icon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#2563eb"/>
  <rect x="7" y="9" width="18" height="16" rx="3" fill="none" stroke="white" stroke-width="2.5"/>
  <rect x="7" y="9" width="18" height="5" rx="1.5" fill="rgba(255,255,255,0.35)"/>
  <line x1="11" y1="19" x2="21" y2="19" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="11" y1="22" x2="17" y2="22" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}
