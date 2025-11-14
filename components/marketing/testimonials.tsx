import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Switching to Inboker cut our no-shows nearly in half. Clients rebook themselves — our front desk finally breathes.",
    author: "Aisha R.",
    role: "Clinic Manager",
    business: "Prime Health Clinic"
  },
  {
    quote: "Inboker's WhatsApp link converts like crazy. Bookings straight from the bio.",
    author: "Marco P.",
    role: "Owner",
    business: "Marco's Barber Studio"
  },
  {
    quote: "The AI scheduling just works. No more double-bookings, no more confusion about time zones.",
    author: "Sarah L.",
    role: "Aesthetician",
    business: "Glow Aesthetics"
  },
  {
    quote: "Multi-staff scheduling was a nightmare before Inboker. Now everyone sees their shifts and we're fully booked.",
    author: "James K.",
    role: "Salon Owner",
    business: "Luxe Hair & Beauty"
  },
  {
    quote: "The intake forms saved us hours of paperwork. Everything's digital, secure, and ready before the client walks in.",
    author: "Dr. Patel",
    role: "Dentist",
    business: "Smile Dental Practice"
  },
];

export function Testimonials() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="relative">
          <CardContent className="pt-6">
            <Quote className="h-8 w-8 text-blue-600 opacity-20 mb-4" />
            <blockquote className="text-sm mb-4 leading-relaxed">
              "{testimonial.quote}"
            </blockquote>
            <div className="border-t pt-4">
              <div className="font-semibold text-sm">{testimonial.author}</div>
              <div className="text-xs text-muted-foreground">{testimonial.role}</div>
              <div className="text-xs text-muted-foreground">{testimonial.business}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
