import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Check, ArrowRight, Zap, Link as LinkIcon, Bell, FileText, BarChart, Star, Heart, Scissors, Briefcase, ChevronDown } from 'lucide-react';
import { SocialProof } from '@/components/marketing/social-proof';
import { Stats } from '@/components/marketing/stats';
import { Testimonials } from '@/components/marketing/testimonials';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inboker - AI-Powered Booking Engine for Appointment-Based Businesses',
  description: 'The white-label booking platform for clinics, salons, barbers, and freelancers. AI scheduling, multi-staff support, SMS reminders, and more. Launch in 5 minutes.',
  openGraph: {
    title: 'Inboker - Your bookings, on autopilot',
    description: 'AI-powered booking engine that fills your calendar and reduces no-shows',
    type: 'website',
  },
};

export default function HomePage() {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Scheduling',
      description: 'Smart slot management that syncs calendars and optimizes availability automatically.',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Users,
      title: 'Multi-Staff Management',
      description: 'Coordinate teams with shift planning, role-based permissions, and individual calendars.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: LinkIcon,
      title: 'Embeddable Everywhere',
      description: 'Widgets, shareable links, and QR codes that work on any website or social platform.',
      color: 'bg-violet-50 text-violet-600',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Automated SMS and email reminders that reduce no-shows by up to 90%.',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: FileText,
      title: 'Intake Forms',
      description: 'Digital forms with e-signatures. Collect info before clients walk in the door.',
      color: 'bg-rose-50 text-rose-600',
    },
    {
      icon: BarChart,
      title: 'Client Intelligence',
      description: 'Built-in CRM with pipeline tracking, lead scoring, and activity history.',
      color: 'bg-cyan-50 text-cyan-600',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Set up your brand',
      description: 'Add your logo, colors, services, and team. Takes under 5 minutes.',
    },
    {
      number: '02',
      title: 'Share your booking page',
      description: 'Embed on your site, share the link, or print a QR code for your location.',
    },
    {
      number: '03',
      title: 'Watch bookings roll in',
      description: 'Automated confirmations and reminders handle the rest while you focus on clients.',
    },
  ];

  const industries = [
    {
      icon: Heart,
      name: 'Health & Clinics',
      description: 'GP surgeries, physio practices, dental clinics, and wellness centres.',
      examples: ['GP Clinics', 'Physiotherapy', 'Dental', 'Wellness'],
      bg: 'bg-rose-50 hover:bg-rose-100/70',
      border: 'border-rose-100 hover:border-rose-200',
      iconBg: 'bg-rose-100 text-rose-600',
      tagBg: 'bg-white/80 text-rose-700',
    },
    {
      icon: Scissors,
      name: 'Beauty & Salons',
      description: 'Hair salons, barbershops, nail studios, and aesthetics practices.',
      examples: ['Hair Salons', 'Barbershops', 'Nail Studios', 'Aesthetics'],
      bg: 'bg-violet-50 hover:bg-violet-100/70',
      border: 'border-violet-100 hover:border-violet-200',
      iconBg: 'bg-violet-100 text-violet-600',
      tagBg: 'bg-white/80 text-violet-700',
    },
    {
      icon: Users,
      name: 'Fitness & Sports',
      description: 'Personal trainers, yoga studios, pilates, and sports coaching.',
      examples: ['Personal Training', 'Yoga', 'Pilates', 'Coaching'],
      bg: 'bg-emerald-50 hover:bg-emerald-100/70',
      border: 'border-emerald-100 hover:border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-600',
      tagBg: 'bg-white/80 text-emerald-700',
    },
    {
      icon: Briefcase,
      name: 'Professional Services',
      description: 'Consultants, lawyers, accountants, and financial advisors.',
      examples: ['Consultants', 'Legal', 'Accountants', 'Advisors'],
      bg: 'bg-blue-50 hover:bg-blue-100/70',
      border: 'border-blue-100 hover:border-blue-200',
      iconBg: 'bg-blue-100 text-blue-600',
      tagBg: 'bg-white/80 text-blue-700',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '29',
      description: 'For solo practitioners just getting started.',
      popular: false,
      features: [
        '1 staff member',
        'Up to 200 bookings / month',
        'Custom booking page',
        'Email reminders',
        'Stripe payments',
        'Basic analytics',
        'Email support',
      ],
      cta: 'Start free trial',
      ctaHref: '/signup',
    },
    {
      name: 'Pro',
      price: '69',
      description: 'For growing teams that need powerful automation.',
      popular: true,
      features: [
        'Up to 5 staff members',
        'Unlimited bookings',
        'SMS + email reminders',
        'Intake forms & e-signatures',
        'Client CRM & history',
        'Online & Stripe payments',
        'Advanced analytics',
        'Priority support',
      ],
      cta: 'Start free trial',
      ctaHref: '/signup',
    },
    {
      name: 'Business',
      price: '149',
      description: 'For multi-location businesses that demand the best.',
      popular: false,
      features: [
        'Unlimited staff members',
        'Unlimited bookings',
        'White-label branding',
        'Custom domain',
        'API access & webhooks',
        'Multi-location support',
        'Dedicated account manager',
        'SLA & uptime guarantee',
      ],
      cta: 'Contact sales',
      ctaHref: '/contact',
    },
  ];

  const faqs = [
    {
      question: 'Is there really no credit card required for the trial?',
      answer: 'Correct. Sign up in 30 seconds and explore every feature for 14 days — no payment until you decide to upgrade.',
    },
    {
      question: 'Can I use Inboker across multiple locations?',
      answer: 'Yes. The Business plan supports unlimited locations with a unified dashboard and reporting across all of them.',
    },
    {
      question: 'How does the AI scheduling work?',
      answer: 'Inboker analyses your booking patterns, staff availability, and historical data to automatically fill optimal time slots — reducing gaps and maximising revenue.',
    },
    {
      question: 'What reminder channels do you support?',
      answer: 'SMS, email, and WhatsApp. You control the timing, frequency, and message content for each channel independently.',
    },
    {
      question: 'Can I migrate from my current booking tool?',
      answer: 'Absolutely. We offer free data migration from any platform. Send us your export and our team handles the rest.',
    },
    {
      question: 'Is my client data secure?',
      answer: 'Yes. Inboker uses bank-grade encryption, is GDPR compliant, and all data is encrypted at rest and in transit. We never sell your data.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-cyan-100/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-50/40 rounded-full blur-[100px]" />
        </div>
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/60 text-[13px] font-medium text-blue-700 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Trusted by 2,000+ appointment-based businesses
            </div>

            <h1 className="text-[clamp(2.25rem,5.5vw,4.25rem)] font-extrabold leading-[1.08] tracking-tight text-gray-900 mb-6">
              Stop chasing bookings.
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Start growing.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              The all-in-one booking engine for clinics, salons, barbers, and freelancers.
              Live in 5 minutes. No code needed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-[15px] font-semibold h-12 px-7 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 w-full sm:w-auto">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" className="text-[15px] font-semibold h-12 px-7 rounded-xl border-blue-200 hover:bg-blue-50/50 text-blue-700 w-full sm:w-auto">
                  Book a demo
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-[13px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                No credit card required
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* ── Social proof – above dashboard ── */}
          <div className="mt-12">
            <SocialProof />
          </div>

          {/* ── Realistic dashboard preview ── */}
          <div className="mt-10 sm:mt-14 relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-blue-100/60 via-cyan-50/30 to-transparent rounded-[28px] -z-10" />
            {/* Floating notification card — top left */}
            <div className="hidden lg:flex absolute -top-6 -left-8 z-20 items-center gap-3 bg-white rounded-2xl shadow-[0_8px_40px_-6px_rgba(0,0,0,0.10)] border border-gray-100 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Check className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-800">New booking!</p>
                <p className="text-[11px] text-gray-400">Emma R. · Tomorrow 2:00 PM</p>
              </div>
            </div>
            {/* Floating notification card — bottom right */}
            <div className="hidden lg:flex absolute -bottom-6 -right-8 z-20 items-center gap-3 bg-white rounded-2xl shadow-[0_8px_40px_-6px_rgba(0,0,0,0.10)] border border-gray-100 px-5 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shrink-0">
                <BarChart className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-800">Revenue +24%</p>
                <p className="text-[11px] text-gray-400">vs last month · just now</p>
              </div>
            </div>
            {/* Floating notification card — mid right */}
            <div className="hidden xl:flex absolute top-1/3 -right-10 z-20 items-center gap-3 bg-white rounded-2xl shadow-[0_8px_40px_-6px_rgba(0,0,0,0.10)] border border-gray-100 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-800">Reminder sent</p>
                <p className="text-[11px] text-gray-400">No-show prevented · 3 min ago</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-blue-200/40 shadow-[0_8px_60px_-12px_rgba(59,130,246,0.15)] overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white rounded-lg border border-gray-200 px-4 py-1 text-[12px] text-gray-400 font-medium w-64 text-center">
                    yourbusiness.com/dashboard
                  </div>
                </div>
              </div>

              {/* App layout: sidebar + main content */}
              <div className="flex min-h-[420px] sm:min-h-[480px]">
                {/* Sidebar */}
                <div className="hidden md:flex flex-col w-[200px] border-r border-gray-100 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <Calendar className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-[13px] font-bold text-gray-800">Inboker</span>
                  </div>
                  <nav className="space-y-1">
                    {[
                      { label: 'Dashboard', icon: '◻', active: true },
                      { label: 'Bookings', icon: '◻', active: false },
                      { label: 'Calendar', icon: '◻', active: false },
                      { label: 'Clients', icon: '◻', active: false },
                      { label: 'Services', icon: '◻', active: false },
                      { label: 'Analytics', icon: '◻', active: false },
                      { label: 'Settings', icon: '◻', active: false },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium ${
                          item.active
                            ? 'bg-white text-blue-700 shadow-sm border border-blue-100/60'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded ${item.active ? 'bg-blue-100' : 'bg-gray-100'}`} />
                        {item.label}
                      </div>
                    ))}
                  </nav>
                  <div className="mt-auto pt-4 border-t border-gray-200/60">
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
                <div className="flex-1 p-5 sm:p-6 overflow-hidden">
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900">Good morning, Jane</h3>
                      <p className="text-[12px] text-gray-400">Tuesday, 7 March 2026 · 4 bookings today</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Bell className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[11px] font-semibold rounded-lg">
                        <span>+ New booking</span>
                      </div>
                    </div>
                  </div>

                  {/* Stat cards row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: "Today's bookings", value: '18', change: '+3', icon: Calendar },
                      { label: 'This week', value: '64', change: '+12%', icon: BarChart },
                      { label: 'No-show rate', value: '4%', change: '-8%', icon: Users },
                      { label: 'Revenue', value: '£2,840', change: '+24%', icon: Zap },
                    ].map((stat, i) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={i} className="bg-white rounded-xl p-3.5 border border-gray-100 hover:border-blue-100 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <StatIcon className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                          <div className="flex items-end gap-1.5">
                            <span className="text-xl font-bold text-gray-900 tracking-tight leading-none">{stat.value}</span>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md mb-0.5">{stat.change}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Two-column: Schedule + Clients */}
                  <div className="grid lg:grid-cols-5 gap-4">
                    {/* Calendar / Schedule - 3 cols */}
                    <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                        <h4 className="text-[12px] font-bold text-gray-800">Today&apos;s Schedule</h4>
                        <div className="flex items-center gap-1">
                          <div className="px-2 py-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 rounded-md">Day</div>
                          <div className="px-2 py-0.5 text-[10px] font-medium text-gray-400 rounded-md">Week</div>
                          <div className="px-2 py-0.5 text-[10px] font-medium text-gray-400 rounded-md">Month</div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {[
                          { time: '9:00 AM', name: 'Sarah Johnson', service: 'Deep Tissue Massage', duration: '60 min', staff: 'Dr. Patel', status: 'confirmed', avatar: 'SJ', avatarBg: 'bg-blue-500' },
                          { time: '10:30 AM', name: 'Marcus Lee', service: 'Haircut & Beard Trim', duration: '45 min', staff: 'James B.', status: 'confirmed', avatar: 'ML', avatarBg: 'bg-violet-500' },
                          { time: '11:30 AM', name: 'Open slot', service: 'Available', duration: '30 min', staff: '—', status: 'open', avatar: '?', avatarBg: 'bg-gray-300' },
                          { time: '12:00 PM', name: 'Aisha Rahman', service: 'Consultation', duration: '30 min', staff: 'Dr. Patel', status: 'pending', avatar: 'AR', avatarBg: 'bg-amber-500' },
                          { time: '1:30 PM', name: 'Tom Bradley', service: 'Sports Massage', duration: '90 min', staff: 'Lisa K.', status: 'confirmed', avatar: 'TB', avatarBg: 'bg-emerald-500' },
                        ].map((item, i) => (
                          <div key={i} className={`flex items-center gap-3 px-4 py-2.5 text-[12px] ${item.status === 'open' ? 'bg-gray-50/50' : 'bg-white'}`}>
                            <span className="text-gray-400 font-medium w-[60px] shrink-0">{item.time}</span>
                            <div className={`w-6 h-6 rounded-full ${item.avatarBg} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>{item.avatar}</div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${item.status === 'open' ? 'text-gray-400 italic' : 'text-gray-800'}`}>{item.name}</p>
                              <p className="text-gray-400 truncate text-[11px]">{item.service} · {item.duration}</p>
                            </div>
                            <span className="hidden sm:block text-gray-400 text-[11px] shrink-0">{item.staff}</span>
                            {item.status === 'confirmed' && (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">Confirmed</span>
                            )}
                            {item.status === 'pending' && (
                              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">Pending</span>
                            )}
                            {item.status === 'open' && (
                              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">Open</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right panel: Clients + Activity */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Recent Clients */}
                      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-50">
                          <h4 className="text-[12px] font-bold text-gray-800">Recent Clients</h4>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {[
                            { name: 'Sarah Johnson', visits: '12 visits', lastSeen: '2 hours ago', avatar: 'SJ', bg: 'bg-blue-500' },
                            { name: 'Marcus Lee', visits: '8 visits', lastSeen: 'Today', avatar: 'ML', bg: 'bg-violet-500' },
                            { name: 'Aisha Rahman', visits: '3 visits', lastSeen: 'Yesterday', avatar: 'AR', bg: 'bg-amber-500' },
                          ].map((client, i) => (
                            <div key={i} className="flex items-center gap-2.5 px-4 py-2.5">
                              <div className={`w-7 h-7 rounded-full ${client.bg} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>{client.avatar}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-gray-800 truncate">{client.name}</p>
                                <p className="text-[10px] text-gray-400">{client.visits}</p>
                              </div>
                              <span className="text-[10px] text-gray-300 shrink-0">{client.lastSeen}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Activity feed */}
                      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-50">
                          <h4 className="text-[12px] font-bold text-gray-800">Activity</h4>
                        </div>
                        <div className="px-4 py-2.5 space-y-3">
                          {[
                            { text: 'SMS reminder sent to Aisha R.', time: '3 min ago', dot: 'bg-blue-400' },
                            { text: 'Tom B. confirmed booking', time: '12 min ago', dot: 'bg-emerald-400' },
                            { text: 'Payment received — £85.00', time: '1 hour ago', dot: 'bg-violet-400' },
                            { text: 'New client: Emma R. signed up', time: '2 hours ago', dot: 'bg-cyan-400' },
                          ].map((activity, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${activity.dot} mt-[5px] shrink-0`} />
                              <div>
                                <p className="text-[11px] text-gray-600 leading-snug">{activity.text}</p>
                                <p className="text-[10px] text-gray-300">{activity.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <Stats />

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-gray-900">
              Live in three simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center group">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[calc(100%-20%)] h-px bg-gradient-to-r from-blue-200 to-cyan-200" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-lg font-bold mb-6 group-hover:scale-105 transition-transform duration-200 shadow-lg shadow-blue-500/20">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-[15px] font-semibold h-12 px-7 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30">
                Get started in 5 minutes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="relative py-20 sm:py-28 bg-gradient-to-b from-slate-50 via-blue-50/20 to-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-100/30 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[100px] -z-10" />
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-gray-900 mb-4">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              One platform to manage bookings, clients, and growth. All included in every plan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group bg-white rounded-2xl border border-gray-100 p-7 hover:border-blue-200 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.12)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${feature.color} mb-5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-14">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-[15px] font-semibold h-12 px-7 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30">
                Try all features free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-[13px] text-gray-400 mt-3">No credit card required</p>
          </div>
        </div>
      </section>

      {/* ═══════════════ WHO IT'S FOR ═══════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Who it&apos;s for</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-gray-900 mb-4">
              Built for every appointment business
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Whether you run a one-person practice or a multi-location operation, Inboker scales with you.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {industries.map((industry, i) => {
              const Icon = industry.icon;
              return (
                <div
                  key={i}
                  className={`group rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${industry.bg} ${industry.border}`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 ${industry.iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 mb-2">{industry.name}</h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed mb-4">{industry.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {industry.examples.map((ex) => (
                      <span key={ex} className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 ${industry.tagBg}`}>
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-14">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-[15px] font-semibold h-12 px-7 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30">
                Start your free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" className="relative py-20 sm:py-28 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[140px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/20 rounded-full blur-[120px] -z-10" />
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Start free for 14 days. No credit card required. Upgrade or cancel anytime.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-3xl p-8 flex flex-col ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 shadow-2xl shadow-blue-900/25 scale-[1.04] z-10'
                    : 'bg-white border border-gray-100 hover:border-blue-200 hover:shadow-[0_8px_40px_-8px_rgba(59,130,246,0.10)] transition-all duration-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[12px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30">
                      ✦ Most popular
                    </span>
                  </div>
                )}
                <div className="mb-7">
                  <h3 className={`text-[15px] font-bold mb-1 ${plan.popular ? 'text-blue-200' : 'text-gray-500'}`}>{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-3">
                    <span className={`text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold tracking-tight leading-none ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      &pound;{plan.price}
                    </span>
                    <span className={`text-[15px] mb-1.5 ${plan.popular ? 'text-blue-300' : 'text-gray-400'}`}>/mo</span>
                  </div>
                  <p className={`text-[14px] leading-relaxed ${plan.popular ? 'text-blue-200/70' : 'text-gray-500'}`}>{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        plan.popular ? 'bg-white/10' : 'bg-emerald-50'
                      }`}>
                        <Check className={`h-3 w-3 ${plan.popular ? 'text-cyan-300' : 'text-emerald-500'}`} />
                      </div>
                      <span className={`text-[14px] leading-snug ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.ctaHref}>
                  <Button
                    className={`w-full h-12 text-[15px] font-semibold rounded-xl transition-all duration-200 ${
                      plan.popular
                        ? 'bg-white hover:bg-gray-50 text-blue-700 shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] text-gray-400 mt-12">
            All plans include a 14-day free trial &mdash; no credit card required.&nbsp;
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">Need a custom plan?</Link>
          </p>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section id="testimonials" className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-gray-900 mb-4">
              Loved by businesses like yours
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              See why thousands of professionals trust Inboker for their scheduling.
            </p>
          </div>
          <Testimonials />

          <div className="text-center mt-14">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-[15px] font-semibold h-12 px-7 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30">
                Join 2,000+ happy businesses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-slate-50/60">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-gray-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Everything you need to know. Can&apos;t find an answer?{' '}
              <Link href="/contact" className="text-blue-600 hover:underline font-medium">Chat with us.</Link>
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-5">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 p-7 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.08)] transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <ChevronDown className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 leading-snug">{faq.question}</h3>
                </div>
                <p className="text-[14px] text-gray-500 leading-relaxed pl-10">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-[15px] font-semibold h-12 px-7 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-[13px] text-gray-400 mt-3">Still have questions? <Link href="/contact" className="text-blue-600 hover:underline font-medium">Talk to us.</Link></p>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl overflow-hidden px-8 py-16 sm:px-16 sm:py-20 text-center">
            <div className="absolute inset-0 -z-0">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-white mb-4">
                Ready to fill your calendar?
              </h2>
              <p className="text-lg text-blue-200/80 mb-10 leading-relaxed">
                Join 2,000+ businesses that switched to Inboker and never looked back.
                Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/signup">
                  <Button className="bg-white hover:bg-gray-50 text-blue-700 text-[15px] font-semibold h-12 px-7 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-white/20 w-full sm:w-auto">
                    Start free trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" className="text-[15px] font-semibold h-12 px-7 rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm w-full sm:w-auto">
                    Book a demo
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 text-[13px] text-blue-300/70">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-cyan-400" />
                  Free 14-day trial
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-cyan-400" />
                  No credit card
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
