import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calendar,
  Zap,
  Heart,
  Shield,
  Globe,
  Users,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { OrganizationSchema, BreadcrumbSchema } from '@/components/seo/json-ld';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export const metadata: Metadata = {
  title: 'About Inboker: Built for Appointment-Based Businesses',
  description:
    'Inboker was built in 2024 to solve a simple problem: appointment-based businesses were losing hours every week to manual scheduling, no-shows, and missed follow-ups. We fixed that.',
  alternates: { canonical: `${siteUrl}/about` },
  openGraph: {
    title: 'About Inboker: Built for Appointment-Based Businesses',
    description:
      'We built Inboker to give clinics, salons, and service businesses the booking engine they deserve. Fast, smart, and built around how they actually work.',
    url: `${siteUrl}/about`,
    type: 'website',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Inboker',
    description: "Built in 2024 to fill appointment businesses' calendars on autopilot.",
    images: [`${siteUrl}/og-image.png`],
  },
};

const stats = [
  { value: '2,000+', label: 'Businesses on Inboker' },
  { value: '92%', label: 'Reduction in no-shows' },
  { value: '4.8 / 5', label: 'Average customer rating' },
  { value: '2024', label: 'Founded in the UK' },
];

const values = [
  {
    icon: Zap,
    title: 'Speed over complexity',
    description:
      'Setting up a booking system should take minutes, not days. We obsess over removing friction so business owners can go live fast and stay focused on their clients.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Heart,
    title: 'Built for the people who serve people',
    description:
      'Our users are physiotherapists, salon owners, personal trainers, and consultants, not enterprise IT teams. Every feature we build is designed for how they actually work.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Shield,
    title: 'Trust is the product',
    description:
      "When a client books with one of our customers, they're trusting that business with their time and data. We take that seriously: GDPR-compliant, encrypted at rest and in transit, always.",
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: TrendingUp,
    title: 'Outcomes, not features',
    description:
      "We don't ship features for the sake of a changelog. Every decision starts with the same question: does this help our customers book more, earn more, or stress less?",
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Globe,
    title: 'Accessible to every business size',
    description:
      "Whether you're a solo practitioner or a 50-location chain, you deserve professional booking infrastructure. We keep pricing transparent and accessible.",
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Clock,
    title: 'Give people their time back',
    description:
      'Manual scheduling, reminder calls, paper forms: these are hours stolen from skilled professionals. Automation should free them to do the work only they can do.',
    color: 'bg-cyan-50 text-cyan-600',
  },
];

const milestones = [
  {
    year: 'Q1 2024',
    title: 'Inboker is founded',
    description:
      'After watching a family member spend evenings hand-calling clients for reminder confirmations, the founding team set out to automate the parts of running an appointment business that eat up time without adding value.',
  },
  {
    year: 'Q2 2024',
    title: 'First 100 businesses',
    description:
      'We launched with hair salons and barbershops. Within three months, 100 businesses were using Inboker to take online bookings and send automated SMS reminders.',
  },
  {
    year: 'Q3 2024',
    title: 'Expanding to clinics and wellness',
    description:
      'Intake forms, e-signatures, and GDPR-grade data handling opened Inboker to clinics, physiotherapy practices, and wellness studios that needed more than a simple booking link.',
  },
  {
    year: 'Q4 2024',
    title: 'AI scheduling & CRM launched',
    description:
      'We shipped AI-powered slot optimisation, a built-in client CRM, and the white-label booking engine, giving growing businesses a complete platform under their own brand.',
  },
  {
    year: '2025',
    title: 'Scaling to 2,000+ businesses',
    description:
      'Inboker now serves thousands of appointment-based businesses across the UK and beyond, from solo practitioners to multi-location operations with full team scheduling.',
  },
];

const testimonials = [
  {
    quote:
      'Switching to Inboker cut our no-shows nearly in half. Clients rebook themselves and our front desk finally breathes.',
    author: 'Aisha R.',
    role: 'Salon owner, London',
    rating: 5,
  },
  {
    quote:
      'The intake forms alone saved us an hour a day. Everything arrives before the client does.',
    author: 'Dr. Sarah M.',
    role: 'Clinic director, Birmingham',
    rating: 5,
  },
  {
    quote:
      'I was running a spreadsheet and a WhatsApp group. Inboker gave me my evenings back.',
    author: 'Tom B.',
    role: 'Personal trainer, Edinburgh',
    rating: 5,
  },
];

export default function AboutPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'About', url: `${siteUrl}/about` },
  ];

  return (
    <>
      <OrganizationSchema />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <div className="bg-[#070c18]">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-20 sm:py-28">
            <div className="max-w-3xl">
              <p className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest mb-4">
                About Inboker
              </p>
              <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold tracking-tight text-white leading-tight mb-6">
                We built the booking engine we wished existed
              </h1>
              <p className="text-xl text-white/55 leading-relaxed mb-6 max-w-2xl">
                Appointment-based businesses are run by skilled, talented people: physiotherapists, stylists, trainers, consultants. They shouldn't be spending their evenings manually chasing confirmations and filling in spreadsheets.
              </p>
              <p className="text-xl text-white/55 leading-relaxed max-w-2xl">
                Inboker was built in 2024 to put that admin on autopilot, so the people who serve people can get back to doing the work that actually matters.
              </p>
            </div>
          </div>

          {/* Stats: inside dark hero */}
          <div className="border-t border-white/[0.06]">
            <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-display text-[clamp(2rem,4vw,2.75rem)] font-extrabold text-white leading-none mb-1">
                      {s.value}
                    </p>
                    <p className="text-sm text-white/35">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">
                Our mission
              </p>
              <h2 className="font-display text-3xl font-extrabold text-gray-900 mb-5 leading-tight">
                Give every appointment business the tools that used to cost a fortune
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Large clinic chains and enterprise spas have had sophisticated booking infrastructure for years: custom software, dedicated coordinators, automated reminder pipelines. The solo physiotherapist or the five-chair barbershop had a phone and a paper diary.
              </p>
              <p className="text-gray-500 leading-relaxed mb-4">
                That gap is what Inboker closes. Every feature we build, from AI slot optimisation and white-label branding to SMS reminders and digital intake forms, starts from the same place: what would genuinely help a real business owner today?
              </p>
              <p className="text-gray-500 leading-relaxed">
                We're a UK-based team, and we build primarily for the UK market. That means GDPR compliance, GBP pricing, and support during GMT business hours, not managed by a chatbot in a different timezone.
              </p>
            </div>

            {/* Pull quote */}
            <div className="bg-[#070c18] rounded-3xl p-10 text-white border border-white/[0.06]">
              <div className="font-display text-5xl leading-none text-blue-400 mb-4">&ldquo;</div>
              <p className="font-display text-xl font-semibold leading-relaxed mb-8 text-white/90">
                Every hour a skilled professional spends on scheduling is an hour they can't spend on the thing they trained for. We're here to reclaim those hours.
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center text-white font-bold">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">Inboker founding team</p>
                  <p className="text-white/35 text-xs">Founded 2024, United Kingdom</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-20">
            <div className="text-center max-w-xl mx-auto mb-14">
              <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">
                What we believe
              </p>
              <h2 className="font-display text-3xl font-extrabold text-gray-900">
                Principles we build by
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${v.color}`}>
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">
              Our story
            </p>
            <h2 className="font-display text-3xl font-extrabold text-gray-900">
              From idea to 2,000+ businesses
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-200 via-blue-300 to-blue-100 hidden sm:block" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div key={i} className="sm:pl-12 relative">
                  <div className="hidden sm:flex absolute left-0 top-1 h-9 w-9 rounded-full bg-blue-600 items-center justify-center shadow-md shadow-blue-200">
                    <span className="text-[10px] font-bold text-white">{i + 1}</span>
                  </div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{m.year}</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{m.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16">
            <p className="text-center text-[13px] font-semibold text-gray-400 uppercase tracking-widest mb-10">
              What our customers say
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.author} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-5">"{t.quote}"</p>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Work with us / Contact */}
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 hover:border-blue-100 hover:shadow-sm transition-all">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Get in touch</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                Questions about Inboker, partnership enquiries, or press requests? We read every email.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Contact us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl bg-[#070c18] border border-white/[0.06] p-8 text-white">
              <div className="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-white">Try Inboker free for 14 days</h3>
              <p className="text-white/45 text-sm leading-relaxed mb-5">
                No credit card. No contracts. Go live in under 5 minutes.
              </p>
              <a
                href="https://app.inboker.com/signup"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
              >
                Start free trial <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
