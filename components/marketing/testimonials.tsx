import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Switching to Inboker cut our no-shows nearly in half. Clients rebook themselves and our front desk finally breathes.",
    author: "Aisha R.",
    role: "Clinic Manager",
    business: "Prime Health Clinic",
    initials: "AR",
    color: "from-blue-500 to-indigo-600",
  },
  {
    quote: "The WhatsApp link converts like crazy. Bookings straight from the bio. Game changer for us.",
    author: "Marco P.",
    role: "Owner",
    business: "Marco's Barber Studio",
    initials: "MP",
    color: "from-indigo-500 to-blue-700",
  },
  {
    quote: "The AI scheduling just works. No more double-bookings, no more gaps. Revenue went up 24% in month one.",
    author: "Sarah L.",
    role: "Aesthetician",
    business: "Glow Aesthetics",
    initials: "SL",
    color: "from-blue-600 to-cyan-600",
  },
  {
    quote: "Multi-staff scheduling was a nightmare before Inboker. Now everyone sees their shifts and we're fully booked.",
    author: "James K.",
    role: "Salon Owner",
    business: "Luxe Hair & Beauty",
    initials: "JK",
    color: "from-blue-700 to-indigo-800",
  },
  {
    quote: "The intake forms saved us hours of paperwork. Everything's digital, secure, and ready before the client walks in.",
    author: "Dr. Patel",
    role: "Dentist",
    business: "Smile Dental Practice",
    initials: "DP",
    color: "from-indigo-600 to-blue-800",
  },
  {
    quote: "We went from juggling three tools to just Inboker. Simpler, faster, and our clients love the booking page.",
    author: "Nina T.",
    role: "Studio Manager",
    business: "Zen Pilates",
    initials: "NT",
    color: "from-blue-500 to-indigo-700",
  },
];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-[0_4px_24px_-8px_rgba(59,130,246,0.10)] transition-all duration-300 flex flex-col">
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <blockquote className="text-[14px] text-gray-600 leading-relaxed flex-1 mb-5">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
          {t.initials}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-900">{t.author}</p>
          <p className="text-[12px] text-gray-400">{t.role} · {t.business}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {testimonials.map((t, i) => (
        <TestimonialCard key={i} t={t} />
      ))}
    </div>
  );
}
