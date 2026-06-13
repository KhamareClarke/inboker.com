import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export const metadata: Metadata = {
  title: 'Blog: Booking, Scheduling & Business Growth Tips',
  description:
    'Practical guides on appointment scheduling, reducing no-shows, growing your service business, and getting the most from Inboker.',
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    title: 'Inboker Blog: Scheduling & Business Growth',
    description: 'Practical guides for appointment-based businesses.',
    type: 'website',
    url: `${siteUrl}/blog`,
  },
};

const posts = [
  {
    slug: 'how-to-reduce-no-shows',
    title: 'How to reduce no-shows by up to 92% with automated SMS reminders',
    description:
      'No-shows cost appointment businesses thousands every year. This guide shows exactly how automated SMS reminders change the economics of your booking calendar.',
    category: 'No-Show Reduction',
    date: 'March 2025',
    readTime: '8 min read',
  },
  {
    slug: 'online-booking-for-salons',
    title: 'The complete guide to online booking for hair salons in 2025',
    description:
      'How to set up online booking for your salon, which features matter most, and how to get clients booking 24/7 without lifting the phone.',
    category: 'Hair Salons',
    date: 'February 2025',
    readTime: '12 min read',
  },
  {
    slug: 'ai-scheduling-explained',
    title: 'What is AI scheduling and how does it fill your calendar automatically?',
    description:
      'AI scheduling analyses your booking patterns and automatically suggests optimal time slots, reducing gaps, maximising revenue, and working while you sleep.',
    category: 'AI Scheduling',
    date: 'January 2025',
    readTime: '7 min read',
  },
  {
    slug: 'intake-forms-for-clinics',
    title: 'Digital intake forms for clinics: the complete guide',
    description:
      'How to replace paper intake forms with digital versions, what to include, GDPR considerations, and how to collect the right information before every appointment.',
    category: 'Clinics',
    date: 'December 2024',
    readTime: '10 min read',
  },
  {
    slug: 'booking-software-comparison',
    title: 'Booking software comparison 2025: the 8 best tools for service businesses',
    description:
      'We compare the top appointment booking platforms, including Inboker, Calendly, Acuity, Fresha, Booksy, Setmore, Square Appointments, and Treatwell, across features, pricing, and use cases.',
    category: 'Comparisons',
    date: 'November 2024',
    readTime: '15 min read',
  },
  {
    slug: 'white-label-booking-page',
    title: 'How to create a white-label booking page that looks like your brand',
    description:
      'Step-by-step guide to setting up a fully branded booking experience with custom colours, logo, domain, and messaging using Inboker.',
    category: 'Setup Guides',
    date: 'October 2024',
    readTime: '6 min read',
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-24">
      <div className="max-w-2xl mb-16">
        <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Blog</p>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight text-gray-900 mb-4">
          Scheduling tips, guides &amp; business growth
        </h1>
        <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
          Practical advice for appointment-based businesses. Reduce no-shows, grow your client base, and get the most from your booking system.
        </p>
      </div>

    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.12)] transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            <div className="p-7 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>

              <h2 className="text-[16px] font-bold text-gray-900 mb-3 leading-snug flex-1">
                {post.title}
              </h2>

              <p className="text-[14px] text-gray-500 leading-relaxed mb-6">
                {post.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[12px] text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Read
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Industry guides CTA */}
      <div className="mt-20 bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-gray-100 p-10 sm:p-14">
        <h2 className="font-display text-2xl font-extrabold text-gray-900 mb-4">Industry-specific guides</h2>
        <p className="text-gray-500 mb-6">Booking guides built for your specific business type.</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Hair Salons', href: '/for/salons' },
            { label: 'Clinics', href: '/for/clinics' },
            { label: 'Barbershops', href: '/for/barbershops' },
            { label: 'Personal Trainers', href: '/for/personal-trainers' },
            { label: 'Yoga Studios', href: '/for/yoga-studios' },
            { label: 'Aesthetics', href: '/for/aesthetics' },
            { label: 'Physiotherapy', href: '/for/physiotherapy' },
            { label: 'Consultants', href: '/for/consultants' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
