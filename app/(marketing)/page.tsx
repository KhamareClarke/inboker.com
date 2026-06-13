import Link from 'next/link';
import {
  Calendar, Users, Clock, Check, ArrowRight, Zap, Link as LinkIcon,
  Bell, FileText, BarChart, Star, Heart, Scissors, Briefcase,
  ChevronDown, CreditCard, Shield, Sparkles, Globe, TrendingUp,
} from 'lucide-react';
import { SocialProof } from '@/components/marketing/social-proof';
import { Stats } from '@/components/marketing/stats';
import { Testimonials } from '@/components/marketing/testimonials';
import {
  OrganizationSchema, SoftwareApplicationSchema, FAQSchema,
  ReviewSchema, HowToSchema,
} from '@/components/seo/json-ld';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export const metadata: Metadata = {
  title: 'Inboker: AI-Powered Booking Engine for Appointment-Based Businesses',
  description:
    'The white-label booking platform for clinics, salons, barbers, and freelancers. AI scheduling, multi-staff support, SMS reminders, and more. Launch in 5 minutes. No credit card required.',
  alternates: { canonical: siteUrl },
  openGraph: {
    title: 'Inboker: Your bookings, on autopilot',
    description: 'AI-powered booking engine that fills your calendar and reduces no-shows by up to 92%.',
    type: 'website',
    url: siteUrl,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Inboker Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inboker: AI-Powered Booking Engine',
    description: 'Fill your calendar on autopilot. AI scheduling and reminders for appointment businesses.',
    images: ['/og-image.png'],
  },
};

const faqs = [
  { question: 'Is there really no credit card required for the trial?', answer: 'Correct. Sign up in 30 seconds and explore every feature for 14 days with no payment until you decide to upgrade.' },
  { question: 'Can I use Inboker across multiple locations?', answer: 'Yes. The Business plan supports unlimited locations with a unified dashboard and reporting across all of them.' },
  { question: 'How does the AI scheduling work?', answer: 'Inboker analyses your booking patterns, staff availability, and historical data to automatically fill optimal time slots, reducing gaps and maximising revenue.' },
  { question: 'What reminder channels do you support?', answer: 'SMS, email, and WhatsApp. You control the timing, frequency, and message content for each channel independently.' },
  { question: 'Can I migrate from my current booking tool?', answer: 'Absolutely. We offer free data migration from any platform. Send us your export and our team handles the rest.' },
  { question: 'Is my client data secure?', answer: 'Yes. Inboker uses bank-grade encryption, is GDPR compliant, and all data is encrypted at rest and in transit. We never sell your data.' },
  { question: 'What types of businesses use Inboker?', answer: 'Clinics, salons, barbershops, nail studios, aesthetics, physiotherapy, personal trainers, yoga studios, pilates, consultants, and any appointment-based business.' },
  { question: 'How much does Inboker cost?', answer: 'Inboker starts at £29/month (Starter), £69/month (Pro), or £149/month (Business). All plans include a 14-day free trial with no credit card required.' },
];

const howToSteps = [
  { name: 'Set up your brand', text: 'Add your logo, brand colours, services, and team members. The setup wizard takes under 5 minutes.' },
  { name: 'Share your booking page', text: 'Embed on your site, share the link, or print a QR code for your location.' },
  { name: 'Watch bookings roll in', text: 'Automated confirmations and SMS reminders handle follow-up while you focus on clients.' },
];

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <FAQSchema faqs={faqs} />
      <ReviewSchema />
      <HowToSchema
        name="How to set up online booking with Inboker"
        description="Get your appointment-based business accepting online bookings in three simple steps."
        steps={howToSteps}
      />

      <div className="flex flex-col">

        {/* ═══════════════════════════════════════════════════
            HERO — Dark premium
        ═══════════════════════════════════════════════════ */}
        <section className="relative bg-gradient-to-br from-blue-900 via-[#1a2d6b] to-indigo-900 overflow-hidden -mt-[68px]">
          {/* Background layers */}
          <div className="absolute inset-0 hero-grid" />
          <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.22),transparent)]" />
          <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-cyan-400/25 rounded-full blur-[80px]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[70px]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

          <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 pt-[148px] sm:pt-[180px] pb-0">

            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.14] bg-white/[0.07] backdrop-blur-sm">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="h-3.5 w-px bg-white/20" />
                <span className="text-[13px] font-medium text-white/75">4.9 · Trusted by 2,000+ UK businesses</span>
              </div>
            </div>

            {/* Headline */}
            <div className="text-center max-w-[820px] mx-auto mb-7">
              <h1 className="font-display text-[clamp(2.75rem,7vw,5rem)] font-extrabold leading-[1.06] tracking-[-0.03em] text-white mb-5">
                Stop chasing bookings.{' '}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Start growing.
                </span>
              </h1>
              <p className="text-[clamp(1rem,2vw,1.15rem)] text-white/90 max-w-[520px] mx-auto leading-relaxed">
                The AI-powered booking platform for UK clinics, salons, and service businesses.
                Live in 5 minutes. No code needed.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
              <Link
                href="/signup"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[15px] font-semibold h-12 px-7 rounded-xl transition-colors shadow-lg shadow-blue-600/30 w-full sm:w-auto justify-center"
              >
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="flex items-center gap-2 border border-white/[0.18] text-white hover:border-white/30 bg-white/[0.07] hover:bg-white/[0.12] text-[15px] font-semibold h-12 px-7 rounded-xl transition-all w-full sm:w-auto justify-center"
              >
                Watch a demo
              </Link>
            </div>

            {/* Trust micro-copy */}
            <div className="flex items-center justify-center gap-6 text-[13px] text-white/80 mb-14">
              {['14-day free trial', 'No credit card', 'Cancel anytime'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  {t}
                </span>
              ))}
            </div>

            {/* Dashboard mockup */}
            <div className="relative">
              {/* Glow beneath dashboard */}
              <div className="absolute inset-x-1/4 -bottom-8 top-1/2 bg-blue-500/10 blur-[80px] pointer-events-none -z-10" />

              {/* Floating notification — top left */}
              <div className="hidden lg:flex absolute -top-4 -left-4 z-20 items-center gap-3 bg-white border border-gray-100 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] rounded-2xl px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-900">New booking confirmed</p>
                  <p className="text-[11px] text-gray-400">Emma R. · Tomorrow 2:00 PM</p>
                </div>
              </div>

              {/* Floating notification — right middle */}
              <div className="hidden xl:flex absolute top-1/3 -right-8 z-20 items-center gap-3 bg-white border border-gray-100 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] rounded-2xl px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Bell className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-900">SMS reminder sent</p>
                  <p className="text-[11px] text-gray-400">No-show prevented</p>
                </div>
              </div>

              {/* Floating notification — bottom left */}
              <div className="hidden lg:flex absolute -bottom-4 -left-4 z-20 items-center gap-3 bg-white border border-gray-100 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] rounded-2xl px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <BarChart className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-900">Revenue up 24%</p>
                  <p className="text-[11px] text-gray-400">vs last month</p>
                </div>
              </div>

              {/* Dashboard frame */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)]">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-gray-100 border border-gray-200 rounded-md px-4 py-1 text-[12px] text-gray-400 font-medium w-60 text-center">
                      app.inboker.com/dashboard
                    </div>
                  </div>
                </div>

                {/* App layout */}
                <div className="flex min-h-[420px] sm:min-h-[500px]">
                  {/* Sidebar */}
                  <div className="hidden md:flex flex-col w-[196px] border-r border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Calendar className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="font-display text-[13px] font-bold text-gray-900">Inboker</span>
                    </div>
                    <nav className="space-y-0.5">
                      {[
                        { label: 'Dashboard', active: true },
                        { label: 'Bookings' },
                        { label: 'Calendar' },
                        { label: 'Clients' },
                        { label: 'Services' },
                        { label: 'Analytics' },
                        { label: 'Settings' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium ${
                            item.active
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded ${item.active ? 'bg-blue-500' : 'bg-gray-200'}`} />
                          {item.label}
                        </div>
                      ))}
                    </nav>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-700">Jane&apos;s Studio</p>
                          <p className="text-[10px] text-gray-400">Pro plan</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-5 sm:p-6 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-[15px] font-bold text-gray-900">Good morning, Jane</h3>
                        <p className="text-[12px] text-gray-400">Tuesday, 7 March 2026 · 4 bookings today</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 rounded-lg">
                          <Zap className="h-3 w-3 text-blue-600" />
                          <span className="text-[10px] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">AI Active</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg">
                          + New booking
                        </div>
                      </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                      {[
                        { label: "Today's bookings", value: '18', change: '+3', icon: Calendar, gradient: 'from-blue-600 to-cyan-600', bgGradient: 'from-blue-50 to-cyan-50' },
                        { label: 'This week', value: '64', change: '+12%', icon: BarChart, gradient: 'from-green-600 to-emerald-600', bgGradient: 'from-green-50 to-emerald-50' },
                        { label: 'No-show rate', value: '4%', change: '-8%', icon: Users, gradient: 'from-orange-600 to-amber-600', bgGradient: 'from-orange-50 to-amber-50' },
                        { label: 'Revenue', value: '£2,840', change: '+24%', icon: Zap, gradient: 'from-teal-600 to-cyan-600', bgGradient: 'from-teal-50 to-cyan-50' },
                      ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                          <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className={`flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-br ${stat.bgGradient}`}>
                              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider leading-tight">{stat.label}</p>
                              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                                <Icon className="h-3.5 w-3.5 text-white" />
                              </div>
                            </div>
                            <div className="px-3.5 py-2.5 flex items-end gap-1.5">
                              <span className={`text-xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent tracking-tight leading-none`}>{stat.value}</span>
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mb-0.5">{stat.change}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Schedule + sidebar */}
                    <div className="grid lg:grid-cols-5 gap-4">
                      <div className="lg:col-span-3 bg-white border border-gray-100 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                          <h4 className="text-[12px] font-bold text-gray-600">Today&apos;s Schedule</h4>
                          <div className="flex gap-1">
                            {['Day', 'Week', 'Month'].map((v, i) => (
                              <span key={v} className={`px-2 py-0.5 text-[10px] font-medium rounded ${i === 0 ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>{v}</span>
                            ))}
                          </div>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {[
                            { time: '9:00', name: 'Sarah Johnson', service: 'Deep Tissue Massage', status: 'confirmed', avatar: 'SJ', c: 'bg-blue-500' },
                            { time: '10:30', name: 'Marcus Lee', service: 'Haircut & Beard Trim', status: 'confirmed', avatar: 'ML', c: 'bg-violet-500' },
                            { time: '11:30', name: 'Open slot', service: 'Available', status: 'open', avatar: '?', c: 'bg-gray-200' },
                            { time: '12:00', name: 'Aisha Rahman', service: 'Consultation', status: 'pending', avatar: 'AR', c: 'bg-amber-500' },
                            { time: '13:30', name: 'Tom Bradley', service: 'Sports Massage', status: 'confirmed', avatar: 'TB', c: 'bg-emerald-500' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-[12px]">
                              <span className="text-gray-400 font-medium w-[50px] shrink-0">{item.time}</span>
                              <div className={`w-6 h-6 rounded-full ${item.c} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>{item.avatar}</div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${item.status === 'open' ? 'text-gray-300 italic' : 'text-gray-700'}`}>{item.name}</p>
                                <p className="text-gray-400 text-[11px] truncate">{item.service}</p>
                              </div>
                              {item.status === 'confirmed' && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">Confirmed</span>}
                              {item.status === 'pending' && <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">Pending</span>}
                              {item.status === 'open' && <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full shrink-0">Open</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <h4 className="text-[12px] font-bold text-gray-600">Recent Clients</h4>
                          </div>
                          {[
                            { name: 'Sarah Johnson', visits: '12 visits', avatar: 'SJ', c: 'bg-blue-500' },
                            { name: 'Marcus Lee', visits: '8 visits', avatar: 'ML', c: 'bg-violet-500' },
                            { name: 'Aisha Rahman', visits: '3 visits', avatar: 'AR', c: 'bg-amber-500' },
                          ].map((c, i) => (
                            <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-50 last:border-0">
                              <div className={`w-7 h-7 rounded-full ${c.c} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>{c.avatar}</div>
                              <div>
                                <p className="text-[12px] font-medium text-gray-700">{c.name}</p>
                                <p className="text-[10px] text-gray-400">{c.visits}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                          {[
                            { text: 'SMS reminder sent to Aisha R.', dot: 'bg-blue-400' },
                            { text: 'Tom B. confirmed booking', dot: 'bg-emerald-400' },
                            { text: 'Payment received: £85.00', dot: 'bg-violet-400' },
                          ].map((a, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${a.dot} mt-[5px] shrink-0`} />
                              <p className="text-[11px] text-gray-500">{a.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fade at bottom of hero */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-indigo-900 to-transparent pointer-events-none z-10" />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            SOCIAL PROOF — Integrations logo bar
        ═══════════════════════════════════════════════════ */}
        <SocialProof />

        {/* ═══════════════════════════════════════════════════
            STATS — Clean number bar
        ═══════════════════════════════════════════════════ */}
        <Stats />

        {/* ═══════════════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32 bg-white border-t border-gray-100">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div className="max-w-lg">
                <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.1em] mb-3">How it works</p>
                <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
                  Live in three simple steps
                </h2>
                <p className="text-[16px] text-gray-400 leading-relaxed">
                  From signup to your first booking in under five minutes. No developers, no integrations, no drama.
                </p>
              </div>
              <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold h-11 px-6 rounded-xl transition-colors shadow-sm shrink-0">
                Get started in 5 minutes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  n: '01',
                  title: 'Set up your brand',
                  desc: 'Add your logo, colours, services, and team. Our setup wizard walks you through every step in minutes.',
                  icon: Sparkles,
                  detail: ['Upload logo & colours', 'Add services & pricing', 'Invite team members'],
                },
                {
                  n: '02',
                  title: 'Share your booking page',
                  desc: 'Embed on your website, post the link on socials, or print a QR code for your reception desk.',
                  icon: Globe,
                  detail: ['Embed on any website', 'Instagram & WhatsApp link', 'Print a QR code'],
                },
                {
                  n: '03',
                  title: 'Watch bookings roll in',
                  desc: 'Automated confirmations and SMS reminders handle follow-up so you can focus on your clients.',
                  icon: TrendingUp,
                  detail: ['Instant confirmations', 'SMS & WhatsApp reminders', 'No-show protection'],
                },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative bg-white border border-gray-100 hover:border-blue-200 hover:shadow-[0_4px_24px_-8px_rgba(59,130,246,0.10)] rounded-2xl p-7 transition-all duration-300 overflow-hidden flex flex-col">
                    {/* Decorative step number */}
                    <span className="absolute top-3 right-5 font-display text-[5rem] font-extrabold text-blue-50 leading-none select-none pointer-events-none">
                      {step.n}
                    </span>

                    {/* Icon */}
                    <div className="relative z-10 w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center mb-6">
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="relative z-10 font-display text-[18px] font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="relative z-10 text-[14px] text-gray-500 leading-relaxed mb-6">{step.desc}</p>

                    {/* Detail list */}
                    <div className="relative z-10 mt-auto space-y-2">
                      {step.detail.map((d) => (
                        <div key={d} className="flex items-center gap-2.5 text-[13px] text-gray-600">
                          <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FEATURES — Bento grid
        ═══════════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32 bg-gray-50/60 border-t border-gray-100">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="max-w-xl mb-16">
              <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.1em] mb-3">Features</p>
              <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="text-[16px] text-gray-400 leading-relaxed">
                One platform to manage bookings, clients, and growth. Every feature included in every plan.
              </p>
            </div>

            {/* Bento grid — 3-col, clean row flow */}
            <div className="grid lg:grid-cols-3 gap-4">

              {/* Row 1: AI card (2 cols) + Multi-Staff (1 col) */}

              {/* AI Scheduling — hero card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 via-[#1a2d6b] to-indigo-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between" style={{minHeight: '280px'}}>
                <div className="absolute inset-0 hero-grid opacity-30" />
                <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-cyan-400/25 rounded-full blur-[60px]" />
                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-blue-300/20 rounded-full blur-[50px]" />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-5">
                    <Zap className="h-5 w-5 text-cyan-300" />
                  </div>
                  <h3 className="font-display text-[22px] font-bold mb-3">AI-Powered Scheduling</h3>
                  <p className="text-[15px] text-blue-200/70 leading-relaxed max-w-[400px]">
                    Smart slot management that analyses booking patterns, syncs calendars, and fills your schedule automatically.
                  </p>
                </div>
                <div className="relative mt-8 flex flex-wrap gap-2">
                  {['Auto-fill gaps', 'Calendar sync', 'Conflict detection', 'Smart availability'].map((tag) => (
                    <span key={tag} className="text-[12px] font-medium text-blue-300/80 bg-white/[0.07] border border-white/[0.08] px-3 py-1.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Multi-Staff */}
              <div className="bg-white border border-gray-100 hover:border-blue-200 hover:shadow-[0_8px_32px_-8px_rgba(59,130,246,0.12)] rounded-3xl p-7 transition-all duration-300 flex flex-col" style={{minHeight: '280px'}}>
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-display text-[18px] font-bold text-gray-900 mb-2">Multi-Staff Management</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">Coordinate teams with individual calendars, role-based permissions, and shift planning.</p>
                <div className="mt-auto pt-6 flex items-center gap-2">
                  {[
                    { initials: 'SJ', color: 'bg-blue-500' },
                    { initials: 'ML', color: 'bg-indigo-500' },
                    { initials: 'AR', color: 'bg-cyan-600' },
                    { initials: 'TB', color: 'bg-blue-700' },
                  ].map((m, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${m.color} border-2 border-white flex items-center justify-center text-[9px] font-bold text-white -ml-2 first:ml-0`}>
                      {m.initials}
                    </div>
                  ))}
                  <span className="text-[12px] text-gray-400 ml-1">+12 staff</span>
                </div>
              </div>

              {/* Row 2: 3 equal cards */}

              {/* Smart Reminders */}
              <div className="bg-white border border-gray-100 hover:border-blue-200 hover:shadow-[0_8px_32px_-8px_rgba(59,130,246,0.12)] rounded-3xl p-7 transition-all duration-300 flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-display text-[18px] font-bold text-gray-900 mb-2">Smart Reminders</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed mb-5">SMS, email, and WhatsApp reminders that reduce no-shows by up to 92%.</p>
                <div className="mt-auto space-y-2.5">
                  {[
                    { label: '24h before', channel: 'SMS' },
                    { label: '1h before', channel: 'WhatsApp' },
                    { label: 'Instant', channel: 'Email' },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-[13px]">
                      <span className="text-gray-400">{r.label}</span>
                      <span className="font-medium text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full text-[12px]">{r.channel}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intake Forms */}
              <div className="bg-white border border-gray-100 hover:border-blue-200 hover:shadow-[0_8px_32px_-8px_rgba(59,130,246,0.12)] rounded-3xl p-7 transition-all duration-300 flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-display text-[18px] font-bold text-gray-900 mb-2">Digital Intake Forms</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed mb-5">Collect client info, consent, and e-signatures before they walk in.</p>
                <div className="mt-auto space-y-2">
                  {['Health questionnaire', 'GDPR consent', 'Custom fields', 'E-signatures'].map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-[13px] text-gray-600">
                      <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* White-label */}
              <div className="bg-white border border-gray-100 hover:border-blue-200 hover:shadow-[0_8px_32px_-8px_rgba(59,130,246,0.12)] rounded-3xl p-7 transition-all duration-300 flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                  <LinkIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-display text-[18px] font-bold text-gray-900 mb-2">White-label Ready</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed mb-5">Your logo, your colours, your domain. Clients never see &ldquo;Inboker&rdquo; unless you want them to.</p>
                <div className="mt-auto flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-[12px] text-gray-500 font-mono">bookings.yourbusiness.com</span>
                </div>
              </div>

              {/* Row 3: CRM (2 cols) + Payments (1 col) */}

              {/* CRM & Analytics */}
              <div className="lg:col-span-2 bg-white border border-gray-100 hover:border-blue-200 hover:shadow-[0_8px_32px_-8px_rgba(59,130,246,0.12)] rounded-3xl p-7 sm:p-8 transition-all duration-300">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <BarChart className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-display text-[18px] font-bold text-gray-900 mb-2">Client CRM &amp; Analytics</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed mb-6">Built-in CRM with visit history, lifetime value tracking, and revenue analytics, all in one place.</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Monthly revenue', value: '£12,840', badge: '+18%', up: true },
                    { label: 'Active clients', value: '348', badge: '+24', up: true },
                    { label: 'No-show rate', value: '3.2%', badge: '-61%', up: false },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-[11px] text-gray-400 mb-2">{m.label}</p>
                      <p className="text-[18px] font-bold text-gray-900 leading-none mb-1.5">{m.value}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${m.up ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'}`}>
                        {m.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments */}
              <div className="bg-white border border-gray-100 hover:border-blue-200 hover:shadow-[0_8px_32px_-8px_rgba(59,130,246,0.12)] rounded-3xl p-7 transition-all duration-300 flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-display text-[18px] font-bold text-gray-900 mb-2">Built-in Payments</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed mb-5">Accept deposits and full payments at booking via Stripe. No extra fees beyond Stripe&apos;s standard rate.</p>
                <div className="mt-auto space-y-2">
                  {['Stripe-powered', 'Deposits & full pay', 'Instant payouts'].map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-[13px] text-gray-600">
                      <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-10 flex items-center gap-4">
              <Link href="/features" className="inline-flex items-center gap-2 text-[14px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                See all features
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-gray-200">·</span>
              <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold h-10 px-5 rounded-xl transition-colors shadow-sm">
                Try all features free
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            WHO IT'S FOR
        ═══════════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32 bg-white border-t border-gray-100">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div className="max-w-lg">
                <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.1em] mb-3">Who it&apos;s for</p>
                <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
                  Built for every appointment business
                </h2>
                <p className="text-[16px] text-gray-400 leading-relaxed">
                  Whether you run a solo practice or a multi-location operation, Inboker scales with you.
                </p>
              </div>
              <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold h-11 px-6 rounded-xl transition-colors shrink-0">
                Start your free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Industry cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Heart,
                  name: 'Health & Clinics',
                  desc: 'Reduce admin and fill appointment slots, without the phone tag.',
                  examples: ['GP Clinics', 'Physiotherapy', 'Dental', 'Wellness', 'Osteopathy'],
                  href: '/for/clinics',
                },
                {
                  icon: Scissors,
                  name: 'Beauty & Salons',
                  desc: 'Instagram bio to booked seat in seconds. Reminders handle the rest.',
                  examples: ['Hair Salons', 'Barbershops', 'Nail Studios', 'Aesthetics', 'Lash & Brow'],
                  href: '/for/salons',
                },
                {
                  icon: Users,
                  name: 'Fitness & Sports',
                  desc: 'Class bookings, PT sessions, and memberships in one place.',
                  examples: ['Personal Training', 'Yoga', 'Pilates', 'Coaching', 'Martial Arts'],
                  href: '/for/personal-trainers',
                },
                {
                  icon: Briefcase,
                  name: 'Professional Services',
                  desc: 'Look sharp, book fast. Client intake forms included.',
                  examples: ['Consultants', 'Legal', 'Accountants', 'Therapists', 'Coaches'],
                  href: '/features',
                },
              ].map((ind, i) => {
                const Icon = ind.icon;
                return (
                  <div key={i} className="group bg-white border border-gray-100 hover:border-blue-200 hover:shadow-[0_4px_24px_-8px_rgba(59,130,246,0.12)] rounded-2xl p-6 transition-all duration-300 flex flex-col">
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>

                    {/* Name + desc */}
                    <h3 className="font-display text-[16px] font-bold text-gray-900 mb-2">{ind.name}</h3>
                    <p className="text-[13.5px] text-gray-500 leading-relaxed mb-5">{ind.desc}</p>

                    {/* Example pills */}
                    <div className="flex flex-wrap gap-1.5 mt-auto mb-5">
                      {ind.examples.map((e) => (
                        <span key={e} className="text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full">
                          {e}
                        </span>
                      ))}
                    </div>

                    {/* Link */}
                    <Link href={ind.href} className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 group-hover:gap-2.5 transition-all duration-200">
                      See how it works
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            TESTIMONIALS — Grid
        ═══════════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32 bg-gray-50/60 border-t border-gray-100">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.1em] mb-3">Testimonials</p>
                <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-gray-900 leading-tight">
                  Loved by 2,000+ businesses
                </h2>
              </div>
              <div className="flex items-center gap-3 shrink-0 bg-white border border-gray-100 rounded-2xl px-5 py-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <span className="text-[14px] font-bold text-gray-900">4.9</span>
                <span className="text-[13px] text-gray-400">· 300+ reviews</span>
              </div>
            </div>

            {/* Grid */}
            <Testimonials />

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            PRICING
        ═══════════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32 bg-white border-t border-gray-100">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="text-center max-w-xl mx-auto mb-14">
              <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.1em] mb-3">Pricing</p>
              <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-gray-900 mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-[16px] text-gray-400">
                Start free for 14 days. No credit card. Upgrade or cancel anytime.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto items-stretch">
              {[
                {
                  name: 'Starter',
                  price: '29',
                  desc: 'For solo practitioners getting started.',
                  popular: false,
                  features: [
                    '1 staff member',
                    'Up to 200 bookings/month',
                    'Custom booking page',
                    'Email reminders',
                    'Stripe payments',
                    'Basic analytics',
                  ],
                  cta: 'Start free trial',
                  href: '/signup',
                },
                {
                  name: 'Pro',
                  price: '69',
                  desc: 'For growing teams that need automation.',
                  popular: true,
                  features: [
                    'Up to 5 staff members',
                    'Unlimited bookings',
                    'SMS + WhatsApp reminders',
                    'Intake forms & e-signatures',
                    'Client CRM & history',
                    'Advanced analytics',
                    'Priority support',
                  ],
                  cta: 'Start free trial',
                  href: '/signup',
                },
                {
                  name: 'Business',
                  price: '149',
                  desc: 'For multi-location businesses.',
                  popular: false,
                  features: [
                    'Unlimited staff',
                    'Unlimited bookings',
                    'White-label branding',
                    'Custom domain',
                    'API access',
                    'Multi-location dashboard',
                    'Dedicated account manager',
                  ],
                  cta: 'Contact sales',
                  href: '/contact',
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 overflow-hidden ${
                    plan.popular
                      ? 'bg-gradient-to-br from-blue-900 via-[#1a2d6b] to-indigo-900 shadow-2xl shadow-indigo-900/30 ring-1 ring-white/[0.08]'
                      : 'bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <>
                      <div className="absolute top-0 right-0 w-[220px] h-[220px] bg-cyan-400/25 rounded-full blur-[45px] pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-[180px] h-[180px] bg-indigo-300/25 rounded-full blur-[40px] pointer-events-none" />
                    </>
                  )}
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg shadow-blue-600/30">
                        Most popular
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="mb-6">
                    <p className={`text-[11px] font-bold uppercase tracking-[0.12em] mb-5 ${plan.popular ? 'text-white/40' : 'text-gray-400'}`}>
                      {plan.name}
                    </p>
                    <div className="flex items-end gap-1.5 mb-1">
                      <span className={`font-display text-[3rem] font-extrabold tracking-tight leading-none ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                        £{plan.price}
                      </span>
                      <span className={`text-[14px] mb-1 ${plan.popular ? 'text-white/30' : 'text-gray-400'}`}>/mo</span>
                    </div>
                    <p className={`text-[13px] mb-5 ${plan.popular ? 'text-white/50' : 'text-gray-400'}`}>{plan.desc}</p>
                    <div className={`h-px ${plan.popular ? 'bg-white/[0.08]' : 'bg-gray-100'}`} />
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-blue-500/25' : 'bg-blue-50'}`}>
                          <Check className={`h-2.5 w-2.5 ${plan.popular ? 'text-cyan-300' : 'text-blue-500'}`} />
                        </div>
                        <span className={`text-[13.5px] ${plan.popular ? 'text-white/70' : 'text-gray-600'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={plan.href}
                    className={`flex items-center justify-center gap-2 h-11 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                        : 'border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-800 hover:text-blue-700'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center text-[13px] text-gray-400 mt-10">
              All plans include a 14-day free trial. No credit card required.{' '}
              <Link href="/contact" className="text-blue-600 hover:underline font-medium">Need a custom plan?</Link>
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FAQ
        ═══════════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32 bg-gray-50/60 border-t border-gray-100">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="grid lg:grid-cols-[340px_1fr] gap-16 items-start">

              {/* Left — sticky sidebar */}
              <div className="lg:sticky lg:top-28">
                <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.1em] mb-3">FAQ</p>
                <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.5rem)] font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
                  Got questions?
                </h2>
                <p className="text-[15px] text-gray-400 leading-relaxed mb-8">
                  Everything you need to know. Can&apos;t find what you&apos;re looking for?{' '}
                  <Link href="/contact" className="text-blue-600 hover:underline font-medium">Chat with us.</Link>
                </p>

                {/* Support card */}
                <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">Inboker Support</p>
                    <p className="text-[12px] text-gray-400">Usually replies within the hour</p>
                  </div>
                </div>

                {/* Quick links */}
                <div className="space-y-2">
                  {[
                    { label: 'See all features', href: '/features' },
                    { label: 'Compare plans', href: '/pricing' },
                    { label: 'Book a demo', href: '/demo' },
                  ].map((l) => (
                    <Link key={l.label} href={l.href} className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 rounded-xl transition-all group">
                      <span className="text-[13px] font-medium text-gray-700 group-hover:text-blue-700">{l.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right — accordion */}
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <details key={i} className="group bg-white border border-gray-100 hover:border-blue-200 rounded-2xl overflow-hidden transition-colors">
                    <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none">
                      <h3 className="font-display text-[15px] font-semibold text-gray-900">{faq.question}</h3>
                      <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-5 border-t border-gray-50">
                      <p className="text-[14px] text-gray-500 leading-relaxed pt-4">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FINAL CTA — Dark
        ═══════════════════════════════════════════════════ */}
        <section className="bg-gradient-to-br from-blue-900 via-[#1a2d6b] to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-50" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          <div className="absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(37,99,235,0.18),transparent)]" />
          <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[70px]" />
          <div className="absolute -top-10 -right-10 w-[400px] h-[400px] bg-indigo-300/20 rounded-full blur-[60px]" />
          <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 py-28 sm:py-36 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.15] bg-white/[0.06] text-[13px] text-white/70 mb-8">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                GDPR compliant · Bank-grade security · UK-based support
              </div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.75rem)] font-extrabold tracking-tight text-white leading-[1.08] mb-5">
                Ready to fill your calendar?
              </h2>
              <p className="text-[clamp(1rem,1.5vw,1.15rem)] text-white/70 mb-10 leading-relaxed max-w-[440px] mx-auto">
                Join 2,000+ businesses that switched to Inboker. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/signup" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[15px] font-semibold h-12 px-7 rounded-xl transition-colors shadow-lg shadow-blue-600/25 w-full sm:w-auto justify-center">
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/demo" className="flex items-center gap-2 border border-white/[0.1] text-white/60 hover:text-white hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] text-[15px] font-semibold h-12 px-7 rounded-xl transition-all w-full sm:w-auto justify-center">
                  Book a demo
                </Link>
              </div>
              <div className="flex items-center justify-center gap-5 mt-7 text-[13px] text-white/60">
                {['Free 14-day trial', 'No credit card', 'Cancel anytime'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
