const integrations = [
  {
    name: 'Stripe',
    desc: 'Accept deposits & payments at booking',
    logo: (
      <svg viewBox="0 0 60 25" fill="none" className="h-[22px] w-auto">
        <path d="M5.996 10.222c0-.834.684-1.154 1.818-1.154 1.625 0 3.678.493 5.303 1.373V5.605c-1.776-.703-3.53-1.032-5.303-1.032C3.136 4.573 0 7.092 0 10.948c0 5.976 8.226 5.022 8.226 7.604 0 .988-.858 1.307-2.06 1.307-1.776 0-4.053-.73-5.856-1.712v4.905c1.992.856 4.009 1.22 5.856 1.22 4.558 0 7.694-2.247 7.694-6.16-.022-6.448-8.264-5.306-8.264-7.89zm14.89-6.225l-4.35.925v4.25l4.35-.925V3.997zm-4.35 5.475V24.11h4.35V9.472h-4.35zm10.04 0l-.272-1.667h-3.823v16.306h4.35V13.345c1.028-1.343 2.77-1.096 3.314-.904V9.472c-.566-.214-2.637-.61-3.57 1.001zm8.09-3.565l-4.304.916-.012 14.925c0 2.758 2.07 4.792 4.828 4.792 1.527 0 2.646-.28 3.262-.614v-3.531c-.594.24-3.524 1.095-3.524-1.65v-6.594h3.524V9.472h-3.524l-.25-2.564zm11.71 3.16c-1.557 0-2.558.73-3.114 1.24l-.206-1.307h-3.836v16.11h4.35v-10.95c1.028-1.316 2.762-.997 3.292-.831V9.472a4.365 4.365 0 00-.486-.405zm5.28 15.547h4.35V4.573h-4.35v20.036z" fill="#635BFF"/>
      </svg>
    ),
  },
  {
    name: 'Google Calendar',
    desc: 'Two-way calendar sync, always live',
    logo: (
      <svg viewBox="0 0 200 200" className="h-[28px] w-[28px]">
        <path d="M152.637 43.363H47.363C45.161 43.363 43.363 45.161 43.363 47.363v105.273c0 2.203 1.798 4 4 4h105.274c2.202 0 4-1.797 4-4V47.363c0-2.202-1.798-4-4-4" fill="#FFF"/>
        <path d="M152.637 200H47.363C21.2 200 0 178.8 0 152.637V47.363C0 21.2 21.2 0 47.363 0h105.274C178.8 0 200 21.2 200 47.363v105.274C200 178.8 178.8 200 152.637 200" fill="#4285F4"/>
        <path d="M152.637 43.363H47.363C45.161 43.363 43.363 45.161 43.363 47.363v105.273c0 2.203 1.798 4 4 4h105.274c2.202 0 4-1.797 4-4V47.363c0-2.202-1.798-4-4-4" fill="#FFF"/>
        <path fill="#EA4335" d="M130.545 74.545H69.455V130.545h61.09V74.545z" opacity=".05"/>
        <text x="100" y="128" textAnchor="middle" fill="#4285F4" fontSize="42" fontWeight="bold" fontFamily="Arial">17</text>
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    desc: 'Automated reminders & confirmations',
    logo: (
      <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
      </svg>
    ),
  },
  {
    name: 'Twilio',
    desc: 'SMS reminders delivered globally',
    logo: (
      <svg viewBox="0 0 30 30" className="h-[28px] w-[28px]">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15zm0 26.25c-6.213 0-11.25-5.037-11.25-11.25S8.787 3.75 15 3.75 26.25 8.787 26.25 15 21.213 26.25 15 26.25zm-2.25-9.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm9 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-9-6.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm9 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" fill="#F22F46"/>
      </svg>
    ),
  },
  {
    name: 'Zapier',
    desc: 'Connect with 5,000+ apps instantly',
    logo: (
      <svg viewBox="0 0 244.4 66" className="h-[20px] w-auto">
        <path d="M57.8 27.2L34.5 50.5h30.6l-3.2 8.4H19.1l3.2-8.4L45.6 27H16.8l3.2-8.4h41l-3.2 8.6zm46.6-8.5h10l-21 40.2h-10.6l-21-40.2h10.7l15.8 32 16.1-32zm36.6 0c14 0 23.1 8.6 23.1 20.5 0 12-9.1 20.5-23.1 20.5-14 0-23.1-8.5-23.1-20.5.1-11.9 9.2-20.5 23.1-20.5zm0 8.2c-8 0-13.3 5.2-13.3 12.3s5.3 12.3 13.3 12.3c8 0 13.3-5.2 13.3-12.3s-5.3-12.3-13.3-12.3zm59.2-8.2c13.5 0 21.3 8.5 21.3 20 0 .8-.1 2.2-.2 3.1h-33c1.3 6.3 6.4 9.8 14 9.8 5.2 0 10-1.6 14.1-4.7l4.7 6.7c-5.4 4.1-12 6.1-19.3 6.1-15 0-23.4-9.1-23.4-20.6 0-12.2 9-20.4 21.8-20.4zm11.6 16.6c-.5-5.7-4.9-9-11.4-9s-11.3 3.4-12.7 9h24.1zm32.2 23.6h-9.5V18.7H244l-.3 6.1c3.4-4.2 8.7-6.9 14.8-6.9l-1.2 9c-5.5 0-10.5 2.6-13.3 7.6v25.4z" fill="#FF4A00"/>
      </svg>
    ),
  },
  {
    name: 'iCal & Outlook',
    desc: 'Sync with any calendar app you use',
    logo: (
      <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="#0078D4" strokeWidth="1.5" fill="#E8F3FF"/>
        <path d="M3 9h18" stroke="#0078D4" strokeWidth="1.5"/>
        <rect x="8" y="2" width="2" height="4" rx="1" fill="#0078D4"/>
        <rect x="14" y="2" width="2" height="4" rx="1" fill="#0078D4"/>
        <path d="M7 13h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" fill="#0078D4"/>
      </svg>
    ),
  },
];

export function SocialProof() {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.1em] mb-1">Integrations</p>
            <h2 className="font-display text-[clamp(1.25rem,2vw,1.6rem)] font-extrabold text-gray-900 tracking-tight">
              Works with the tools you already use
            </h2>
          </div>
          <p className="text-[14px] text-gray-400 sm:text-right max-w-[220px]">
            No ripping out existing tools. Just connect and go.
          </p>
        </div>

        {/* Integration cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {integrations.map((item, i) => (
            <div
              key={i}
              className="group flex flex-col items-center text-center bg-white border border-gray-100 hover:border-blue-200 hover:shadow-[0_4px_20px_-8px_rgba(59,130,246,0.12)] rounded-2xl p-5 transition-all duration-200"
            >
              <div className="mb-3 h-8 flex items-center justify-center">
                {item.logo}
              </div>
              <p className="text-[13px] font-semibold text-gray-900 mb-1">{item.name}</p>
              <p className="text-[11px] text-gray-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
