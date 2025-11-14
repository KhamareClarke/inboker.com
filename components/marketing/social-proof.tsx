export function SocialProof() {
  const logos = [
    { name: 'Stripe', width: 'w-20' },
    { name: 'Google Calendar', width: 'w-32' },
    { name: 'WhatsApp', width: 'w-28' },
    { name: 'Twilio', width: 'w-24' },
    { name: 'SendGrid', width: 'w-28' },
    { name: 'Clerk', width: 'w-20' },
    { name: 'Supabase', width: 'w-28' },
  ];

  return (
    <div className="border-y bg-muted/30 py-8">
      <div className="container mx-auto max-w-screen-xl px-6">
        <p className="text-center text-sm text-muted-foreground mb-6">
          Trusted integrations with industry leaders
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
          {logos.map((logo) => (
            <div key={logo.name} className={`${logo.width} h-8 bg-muted rounded flex items-center justify-center text-xs font-medium`}>
              {logo.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
