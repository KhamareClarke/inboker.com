'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Switching to Inboker cut our no-shows nearly in half. Clients rebook themselves \u2014 our front desk finally breathes.",
    author: "Aisha R.",
    role: "Clinic Manager",
    business: "Prime Health Clinic",
    rating: 5,
  },
  {
    quote: "The WhatsApp link converts like crazy. Bookings straight from the bio. Game changer for us.",
    author: "Marco P.",
    role: "Owner",
    business: "Marco's Barber Studio",
    rating: 5,
  },
  {
    quote: "The AI scheduling just works. No more double-bookings, no more confusion about time zones.",
    author: "Sarah L.",
    role: "Aesthetician",
    business: "Glow Aesthetics",
    rating: 5,
  },
  {
    quote: "Multi-staff scheduling was a nightmare before Inboker. Now everyone sees their shifts and we're fully booked.",
    author: "James K.",
    role: "Salon Owner",
    business: "Luxe Hair & Beauty",
    rating: 5,
  },
  {
    quote: "The intake forms saved us hours of paperwork. Everything's digital, secure, and ready before the client walks in.",
    author: "Dr. Patel",
    role: "Dentist",
    business: "Smile Dental Practice",
    rating: 5,
  },
  {
    quote: "We went from juggling three tools to just Inboker. Simpler, faster, and our clients love the booking page.",
    author: "Nina T.",
    role: "Studio Manager",
    business: "Zen Pilates",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-gray-100 p-7 hover:border-blue-200 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.12)] transition-all duration-300 hover:-translate-y-1 flex flex-col"
        >
          <div className="flex gap-0.5 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <blockquote className="text-[15px] text-gray-600 leading-relaxed mb-6 flex-1">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-[13px] font-bold shrink-0 shadow-md shadow-blue-500/20">
              {testimonial.author.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-gray-900">{testimonial.author}</p>
              <p className="text-[13px] text-gray-400">{testimonial.role}, {testimonial.business}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
