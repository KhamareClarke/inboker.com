import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Zap,
  Bell,
  Users,
  Link as LinkIcon,
  FileText,
  BarChart,
  CreditCard,
  Palette,
  ShieldCheck,
  Check,
  ArrowRight,
  CalendarDays,
  Smartphone,
  Globe,
  QrCode,
  MessageSquare,
  Mail,
  Clock,
  UserCheck,
  Lock,
  TrendingUp,
  PenLine,
  Star,
  BadgeCheck,
  Webhook,
} from 'lucide-react';
import { SoftwareApplicationSchema, FAQSchema, BreadcrumbSchema } from '@/components/seo/json-ld';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export const metadata: Metadata = {
  title: 'Features: Everything in One Booking Platform | Inboker',
  description:
    'AI scheduling, SMS reminders, multi-staff calendars, intake forms, CRM, payments, analytics, and white-label branding. All in one platform built for appointment-based businesses.',
  alternates: { canonical: `${siteUrl}/features` },
  openGraph: {
    title: 'Inboker Features: Complete Booking Platform',
    description:
      'AI scheduling, SMS & WhatsApp reminders, intake forms, CRM, Stripe payments, and white-label branding. One platform for every appointment-based business.',
    url: `${siteUrl}/features`,
    type: 'website',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inboker Features',
    description: 'Everything appointment businesses need in one platform.',
    images: [`${siteUrl}/og-image.png`],
  },
};

const featureNav = [
  { label: 'Online Booking', href: '#online-booking' },
  { label: 'Reminders', href: '#reminders' },
  { label: 'AI Scheduling', href: '#ai-scheduling' },
  { label: 'Multi-Staff', href: '#multi-staff' },
  { label: 'Intake Forms', href: '#intake-forms' },
  { label: 'CRM', href: '#crm' },
  { label: 'Payments', href: '#payments' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'White-label', href: '#white-label' },
  { label: 'Security', href: '#security' },
];

const overview = [
  { icon: LinkIcon,   title: 'Online Booking',    color: 'bg-violet-50 text-violet-600',  href: '#online-booking' },
  { icon: Bell,       title: 'Smart Reminders',   color: 'bg-emerald-50 text-emerald-600', href: '#reminders' },
  { icon: Zap,        title: 'AI Scheduling',     color: 'bg-amber-50 text-amber-600',    href: '#ai-scheduling' },
  { icon: Users,      title: 'Multi-Staff',       color: 'bg-blue-50 text-blue-600',      href: '#multi-staff' },
  { icon: FileText,   title: 'Intake Forms',      color: 'bg-rose-50 text-rose-600',      href: '#intake-forms' },
  { icon: BarChart,   title: 'CRM & Clients',     color: 'bg-cyan-50 text-cyan-600',      href: '#crm' },
  { icon: CreditCard, title: 'Payments',          color: 'bg-indigo-50 text-indigo-600',  href: '#payments' },
  { icon: TrendingUp, title: 'Analytics',         color: 'bg-pink-50 text-pink-600',      href: '#analytics' },
  { icon: Palette,    title: 'White-label',       color: 'bg-orange-50 text-orange-600',  href: '#white-label' },
  { icon: ShieldCheck,title: 'Security & GDPR',   color: 'bg-teal-50 text-teal-600',      href: '#security' },
];

function PlanBadge({ plan }: { plan: 'All plans' | 'Pro & Business' | 'Business' }) {
  const styles: Record<string, string> = {
    'All plans':      'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Pro & Business': 'bg-blue-50 text-blue-700 border-blue-200',
    'Business':       'bg-violet-50 text-violet-700 border-violet-200',
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${styles[plan]}`}>
      {plan}
    </span>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <Check className="h-2.5 w-2.5 text-emerald-500" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function SectionHeader({
  id,
  icon: Icon,
  color,
  plan,
  eyebrow,
  title,
  description,
}: {
  id: string;
  icon: React.ElementType;
  color: string;
  plan: 'All plans' | 'Pro & Business' | 'Business';
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 mb-10">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest">{eyebrow}</span>
        <PlanBadge plan={plan} />
      </div>
      <h2 className="font-display text-3xl font-extrabold text-gray-900 mb-4 leading-tight">{title}</h2>
      <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">{description}</p>
    </div>
  );
}

export default function FeaturesPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Features', url: `${siteUrl}/features` },
  ];

  const featureFaqs = [
    { question: 'What features does Inboker include?', answer: 'Inboker includes online booking pages, embeddable widgets, AI-powered scheduling, automated SMS and email reminders, multi-staff calendar management, digital intake forms with e-signatures, a built-in client CRM, Stripe payment processing, gift vouchers, promo codes, advanced analytics, white-label branding, custom domain support, API access, and webhooks.' },
    { question: 'Does Inboker have a mobile app?', answer: 'Inboker is a fully responsive web application that works on any device, including iPhone, Android, tablet, or desktop, without needing a separate app download. Your clients book via mobile browser, and you manage everything from any device.' },
    { question: 'How long does it take to set up Inboker?', answer: 'Most businesses are live and taking bookings within 5 minutes. The setup wizard walks you through adding your services, staff, and booking link. More advanced features like intake forms and custom domains take a little longer to configure.' },
    { question: 'Does Inboker work for multi-location businesses?', answer: 'Yes. The Business plan supports unlimited locations under one account with a unified dashboard, cross-location reporting, and centralised client management.' },
    { question: 'Can I try all features before paying?', answer: 'Yes. The 14-day free trial gives you full access to all Pro features. No credit card required. You can explore every feature before deciding which plan fits your business.' },
    { question: 'How does AI scheduling work in Inboker?', answer: "Inboker's AI analyses your booking patterns, staff availability, and historical data to identify and fill gaps in your calendar. It clusters bookings to minimise dead time, detects your busiest periods, and surfaces re-engagement opportunities for lapsed clients, all automatically." },
  ];

  return (
    <>
      <SoftwareApplicationSchema />
      <FAQSchema faqs={featureFaqs} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <div className="bg-[#070c18]">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest mb-3">Features</p>
              <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold tracking-tight text-white leading-tight mb-5">
                One platform. Every tool your booking business needs.
              </h1>
              <p className="text-xl text-white/55 leading-relaxed mb-8 max-w-2xl">
                From the first booking link to the client's third rebooking: AI scheduling, automated reminders, intake forms, CRM, and payments. Everything connected, nothing bolted on.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://app.inboker.com/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Start free trial <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white/40 hover:text-white transition-colors"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature overview grid */}
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {overview.map((f) => (
                <a
                  key={f.title}
                  href={f.href}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 text-center hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform`}>
                    <f.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">{f.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky anchor nav */}
        <div className="sticky top-[64px] z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none no-scrollbar">
              {featureNav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                  {n.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Feature deep-dives */}
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-20 space-y-24">

          {/* ── Online Booking ── */}
          <section>
            <SectionHeader
              id="online-booking"
              icon={LinkIcon}
              color="bg-violet-50 text-violet-600"
              plan="All plans"
              eyebrow="Core feature"
              title="A booking page that works around the clock"
              description="Give clients a fast, professional way to book directly from your website, social bio, WhatsApp, or a QR code. No app download, no account required."
            />
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-violet-500" /> Share anywhere
                  </h3>
                  <FeatureList items={[
                    'Unique booking URL you can share in bio, DMs, and emails',
                    'Embeddable widget: paste one line of code into any website',
                    'QR code that clients scan in-store to book on the spot',
                    'WhatsApp-optimised link with instant mobile checkout',
                    'Direct service links to skip straight to a specific offering',
                  ]} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-violet-500" /> Client experience
                  </h3>
                  <FeatureList items={[
                    'Real-time availability. No double bookings, ever',
                    'Service, staff member, date, and time selection in one flow',
                    'Instant confirmation email and calendar invite to client',
                    'Mobile-first design. Books in under 60 seconds',
                    'No account required for clients to book',
                  ]} />
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-7 space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Booking entry points</p>
                {[
                  { icon: Globe,       label: 'Website embed',      sub: 'Paste a widget onto any page' },
                  { icon: Smartphone,  label: 'Booking link',       sub: 'Share in any channel' },
                  { icon: QrCode,      label: 'QR code',            sub: 'Print for reception or window' },
                  { icon: MessageSquare, label: 'WhatsApp link',    sub: 'Converts direct from bio' },
                ].map((e) => (
                  <div key={e.label} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                    <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <e.icon className="h-4 w-4 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{e.label}</p>
                      <p className="text-xs text-gray-400">{e.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Smart Reminders ── */}
          <section>
            <SectionHeader
              id="reminders"
              icon={Bell}
              color="bg-emerald-50 text-emerald-600"
              plan="Pro & Business"
              eyebrow="No-show prevention"
              title="Cut no-shows by up to 92% with automated reminders"
              description="Send the right message, at the right time, on the right channel. SMS, email, and WhatsApp reminders run automatically. You set them once and forget."
            />
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-7 space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reminder timeline</p>
                {[
                  { time: '48 hrs before', channel: 'Email', msg: 'Appointment confirmation with details' },
                  { time: '24 hrs before', channel: 'SMS',   msg: 'Friendly reminder with 1-tap confirm' },
                  { time: '2 hrs before',  channel: 'SMS',   msg: 'Last-chance nudge to reduce walk-outs' },
                  { time: 'After visit',   channel: 'Email', msg: 'Review request + rebooking prompt' },
                ].map((r) => (
                  <div key={r.time} className="flex gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                    <div className="shrink-0 w-20 text-xs font-semibold text-emerald-600 pt-0.5">{r.time}</div>
                    <div>
                      <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 mb-1">{r.channel}</span>
                      <p className="text-xs text-gray-600">{r.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-500" /> Channels
                  </h3>
                  <FeatureList items={[
                    'SMS reminders to any UK or international number',
                    'Email reminders with your logo and branding',
                    'WhatsApp messages via WhatsApp Business',
                    'Two-way messaging: clients can confirm or cancel by reply',
                    'Cancellation waitlist: auto-fill gaps when clients cancel',
                  ]} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" /> Customisation
                  </h3>
                  <FeatureList items={[
                    'Set your own timing: 48h, 24h, 2h, or custom intervals',
                    'Edit message templates with your own tone and wording',
                    'Per-service and per-staff reminder rules',
                    'Opt-out handling compliant with UK SMS regulations',
                    'Full delivery log so you can see what was sent and when',
                  ]} />
                </div>
              </div>
            </div>
          </section>

          {/* ── AI Scheduling ── */}
          <section>
            <SectionHeader
              id="ai-scheduling"
              icon={Zap}
              color="bg-amber-50 text-amber-600"
              plan="Pro & Business"
              eyebrow="Artificial intelligence"
              title="AI that fills your calendar while you work"
              description="Inboker analyses your booking patterns, staff availability, and historical data to automatically suggest and fill optimal time slots, reducing gaps and maximising revenue without any manual effort."
            />
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                {
                  icon: CalendarDays,
                  title: 'Smart slot optimisation',
                  items: [
                    'Detects and fills gaps between appointments automatically',
                    'Clusters bookings to minimise dead time',
                    "Adapts to each staff member's peak booking times",
                    'Avoids back-to-back overload with built-in buffer rules',
                  ],
                },
                {
                  icon: TrendingUp,
                  title: 'Demand forecasting',
                  items: [
                    'Predicts your busy and quiet periods up to 4 weeks ahead',
                    'Surfaces under-performing services before they become gaps',
                    'Recommends optimal opening hours based on booking history',
                    'Flags unusual drop-offs in rebooking rate early',
                  ],
                },
                {
                  icon: UserCheck,
                  title: 'Client matching',
                  items: [
                    'Learns client preferences and pre-selects their preferred staff',
                    'Suggests rebooking intervals based on service type',
                    'Sends re-engagement nudges to lapsed clients automatically',
                    'Identifies VIP clients and surfaces upsell opportunities',
                  ],
                },
              ].map((g) => (
                <div key={g.title} className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-sm transition-all">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                    <g.icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-amber-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">{g.title}</h3>
                  <FeatureList items={g.items} />
                </div>
              ))}
            </div>
          </section>

          {/* ── Multi-Staff ── */}
          <section>
            <SectionHeader
              id="multi-staff"
              icon={Users}
              color="bg-blue-50 text-blue-600"
              plan="Pro & Business"
              eyebrow="Team management"
              title="Run your whole team from one dashboard"
              description="Individual calendars, shift planning, role-based access, and real-time availability. Everything your team needs without the chaos of shared spreadsheets or group chats."
            />
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-500" /> Scheduling
                  </h3>
                  <FeatureList items={[
                    'Individual calendar per staff member with real-time availability',
                    'Clients choose their preferred team member at booking',
                    '"Any available" option to fill the next open slot',
                    'Block time off for holidays, training, and breaks',
                    'Shift patterns: set recurring weekly schedules per person',
                  ]} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-500" /> Access & permissions
                  </h3>
                  <FeatureList items={[
                    'Owner, Manager, and Staff roles with separate permission levels',
                    'Staff see only their own calendar; owners see everything',
                    'Managers can approve, edit, and cancel bookings for their team',
                    'Individual login per team member. No shared passwords',
                    'Activity log: see who changed what and when',
                  ]} />
                </div>
              </div>
              <div className="rounded-2xl bg-[#070c18] border border-white/[0.06] p-7 text-white">
                <p className="text-sm font-semibold text-white/40 mb-5">What you see at a glance</p>
                <div className="space-y-3">
                  {[
                    { name: 'Priya',    role: 'Senior stylist',   status: '3 bookings today',       dot: 'bg-emerald-400' },
                    { name: 'Marcus',   role: 'Barber',           status: 'Available from 2pm',      dot: 'bg-emerald-400' },
                    { name: 'Chloe',    role: 'Beauty therapist', status: 'Day off, covered',         dot: 'bg-amber-400' },
                    { name: 'James',    role: 'Manager',          status: '5 bookings today',        dot: 'bg-emerald-400' },
                  ].map((m) => (
                    <div key={m.name} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${m.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{m.name}</p>
                        <p className="text-xs text-white/40 truncate">{m.role}</p>
                      </div>
                      <p className="text-xs text-white/40 shrink-0">{m.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Intake Forms ── */}
          <section>
            <SectionHeader
              id="intake-forms"
              icon={FileText}
              color="bg-rose-50 text-rose-600"
              plan="Pro & Business"
              eyebrow="Digital paperwork"
              title="Intake forms and e-signatures, sent automatically"
              description="Replace paper forms with digital questionnaires that clients complete before they arrive. Collect medical history, consent, and preferences. All signed, stored, and GDPR-compliant."
            />
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                {
                  icon: PenLine,
                  title: 'Build your forms',
                  items: [
                    'Drag-and-drop form builder. No code needed',
                    'Text fields, checkboxes, dropdowns, date pickers',
                    'Conditional logic: show questions based on answers',
                    'Attach to specific services, not all bookings',
                    'Pre-built templates for clinics, beauty, and fitness',
                  ],
                },
                {
                  icon: BadgeCheck,
                  title: 'Signatures & consent',
                  items: [
                    'Legally binding e-signatures on any form',
                    'Custom consent declarations you write yourself',
                    'Re-consent prompts when forms are updated',
                    'Timestamp and IP logged on every signature',
                    'PDF export for records or audits',
                  ],
                },
                {
                  icon: ShieldCheck,
                  title: 'GDPR & compliance',
                  items: [
                    'Client data encrypted at rest and in transit',
                    'Right to erasure: delete a client’s data in one click',
                    'Data retention policies configurable per form',
                    'Audit trail of who viewed or downloaded form data',
                    'UK & EU GDPR compliant out of the box',
                  ],
                },
              ].map((g) => (
                <div key={g.title} className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-sm transition-all">
                  <div className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
                    <g.icon className="h-[18px] w-[18px] text-rose-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">{g.title}</h3>
                  <FeatureList items={g.items} />
                </div>
              ))}
            </div>
          </section>

          {/* ── CRM ── */}
          <section>
            <SectionHeader
              id="crm"
              icon={BarChart}
              color="bg-cyan-50 text-cyan-600"
              plan="Pro & Business"
              eyebrow="Client management"
              title="A CRM built into your booking system"
              description="Every client who books becomes a profile, complete with appointment history, notes, intake data, spend, and rebooking patterns. No separate CRM to sync or pay for."
            />
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Client profiles</h3>
                  <FeatureList items={[
                    'Full appointment history at a glance',
                    'Staff notes, visible only to your team',
                    'Preferred services, staff, and time preferences',
                    'Lifetime spend and average visit frequency',
                    'Tags: VIP, new client, lapsed, at-risk, etc.',
                    'Linked intake forms and signed consent documents',
                  ]} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Retention tools</h3>
                  <FeatureList items={[
                    "Auto-flag clients who haven't booked in X days",
                    'Automated re-engagement emails to lapsed clients',
                    'Post-visit review requests sent at the right time',
                    'Birthday messages with optional discount codes',
                    'Bulk message clients by tag or service history',
                  ]} />
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-7">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Example client profile</p>
                <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">SR</div>
                    <div>
                      <p className="font-semibold text-gray-900">Sarah R.</p>
                      <p className="text-xs text-gray-400">Client since March 2024 · VIP</p>
                    </div>
                  </div>
                  {[
                    { label: 'Total visits',      value: '14 appointments' },
                    { label: 'Lifetime spend',    value: '£1,240' },
                    { label: 'Last visit',        value: '3 weeks ago' },
                    { label: 'Preferred staff',   value: 'Priya' },
                    { label: 'Next appointment',  value: 'This Friday, 2pm' },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-gray-400">{r.label}</span>
                      <span className="font-medium text-gray-900">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Payments ── */}
          <section>
            <SectionHeader
              id="payments"
              icon={CreditCard}
              color="bg-indigo-50 text-indigo-600"
              plan="All plans"
              eyebrow="Revenue"
              title="Take payments before clients even walk in"
              description="Stripe-powered checkout built directly into your booking flow. Take full payment, deposits, or nothing. You decide per service. No extra merchant fees from Inboker."
            />
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Payment options</h3>
                  <FeatureList items={[
                    'Full payment at booking to reduce no-shows to near zero',
                    'Deposit collection: partial upfront, remainder on the day',
                    'Pay on the day. No payment required to book',
                    'Stripe Link, Apple Pay, and Google Pay supported',
                    'Send invoices after sessions with one click',
                  ]} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Promotions & vouchers</h3>
                  <FeatureList items={[
                    'Promo codes: percentage or fixed amount off',
                    'Gift vouchers clients can buy and redeem online',
                    'Referral discounts for new client bookings',
                    'Service bundles: sell packages of sessions upfront',
                    'Automatic refunds for cancellations within your policy',
                  ]} />
                </div>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-7">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Inboker fees</p>
                <div className="space-y-3">
                  {[
                    { plan: 'Starter', fee: '0% Inboker fee', note: 'Stripe processing applies' },
                    { plan: 'Pro',     fee: '0% Inboker fee', note: 'Stripe processing applies' },
                    { plan: 'Business',fee: '0% Inboker fee', note: 'Stripe processing applies' },
                  ].map((r) => (
                    <div key={r.plan} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{r.plan}</p>
                        <p className="text-xs text-gray-400">{r.note}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{r.fee}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                  Inboker takes no cut of your revenue. Standard Stripe processing fees (1.4% + 20p for EU cards) apply.
                </p>
              </div>
            </div>
          </section>

          {/* ── Analytics ── */}
          <section>
            <SectionHeader
              id="analytics"
              icon={TrendingUp}
              color="bg-pink-50 text-pink-600"
              plan="All plans"
              eyebrow="Business intelligence"
              title="Know your numbers without opening a spreadsheet"
              description="Your booking dashboard surfaces the metrics that actually matter: revenue, no-show rate, occupancy, and top performers. Make decisions based on data, not gut feel."
            />
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Revenue & bookings',
                  items: [
                    'Daily, weekly, and monthly revenue at a glance',
                    'Booking count vs. capacity utilisation rate',
                    'Average booking value by service and staff member',
                    'Revenue per client to identify your highest-value regulars',
                    'Month-on-month and year-on-year comparison',
                  ],
                },
                {
                  title: 'No-shows & cancellations',
                  items: [
                    'No-show rate broken down by service and staff',
                    'Cancellation patterns: when and by whom',
                    'Late cancellation vs. same-day no-show tracking',
                    'Impact of reminders on no-show reduction',
                    'Waitlist conversion rate',
                  ],
                },
                {
                  title: 'Client & staff insights',
                  items: [
                    'New vs. returning client ratio over time',
                    'Client lifetime value and churn risk scoring',
                    'Individual staff occupancy and booking rate',
                    'Top services by booking volume and revenue',
                    'Peak hours heatmap showing when clients prefer to book',
                  ],
                },
              ].map((g) => (
                <div key={g.title} className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-sm transition-all">
                  <h3 className="font-bold text-gray-900 mb-4">{g.title}</h3>
                  <FeatureList items={g.items} />
                </div>
              ))}
            </div>
          </section>

          {/* ── White-label ── */}
          <section>
            <SectionHeader
              id="white-label"
              icon={Palette}
              color="bg-orange-50 text-orange-600"
              plan="Pro & Business"
              eyebrow="Branding"
              title="Your brand on everything, not ours"
              description="Remove all Inboker branding. Use your own logo, colours, and domain. Clients see a seamless experience that looks and feels like your business, not a third-party tool."
            />
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Booking page branding</h3>
                  <FeatureList items={[
                    'Upload your logo: appears on booking page, confirmations, and invoices',
                    'Set your primary brand colour, used across all client-facing pages',
                    'Custom headline and welcome message on your booking page',
                    'Remove "Powered by Inboker" badge entirely (Pro+)',
                    'Your business name in all automated email subjects',
                  ]} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Custom domain (Business plan)</h3>
                  <FeatureList items={[
                    'Map book.yourbusiness.com to your Inboker booking page',
                    'Full SSL certificate included. No extra setup',
                    'Appears in confirmation emails and calendar invites',
                    'Your domain in the browser address bar, fully white-label',
                    'DNS setup guide with one-click verification',
                  ]} />
                </div>
              </div>
              <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-7">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">What clients see vs. what you set</p>
                <div className="space-y-3">
                  {[
                    { label: 'Booking URL',     yours: 'book.yoursalon.com',       inboker: 'inboker.com/book/slug' },
                    { label: 'Email sender',    yours: 'hello@yoursalon.com',      inboker: 'noreply@inboker.com' },
                    { label: 'Email logo',      yours: 'Your logo',                inboker: 'Inboker logo' },
                    { label: 'Footer credit',   yours: 'None',                     inboker: '"Powered by Inboker"' },
                    { label: 'Invoice header',  yours: 'Your brand',               inboker: 'Inboker branding' },
                  ].map((r) => (
                    <div key={r.label} className="bg-white rounded-xl border border-gray-100 px-4 py-2.5">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{r.label}</p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-emerald-600 font-semibold">{r.yours}</span>
                        <span className="text-gray-300">→</span>
                        <span className="text-gray-400 line-through">{r.inboker}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Security ── */}
          <section>
            <SectionHeader
              id="security"
              icon={ShieldCheck}
              color="bg-teal-50 text-teal-600"
              plan="All plans"
              eyebrow="Security & compliance"
              title="Bank-grade security. GDPR-compliant by default."
              description="Your clients' data is protected at every layer, from the booking form to the server. Inboker is built on infrastructure that meets UK and EU data protection requirements."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Lock,        title: 'Encryption',       items: ['TLS 1.3 in transit', 'AES-256 at rest', 'Encrypted backups daily'] },
                { icon: ShieldCheck, title: 'GDPR compliance',  items: ['Data processor agreement', 'Right to erasure', 'Consent audit trail'] },
                { icon: UserCheck,   title: 'Access control',   items: ['Role-based permissions', 'Session idle timeout', 'IP-based admin lock'] },
                { icon: Webhook,     title: 'Infrastructure',   items: ['SOC 2 hosting (Supabase)', 'Payments via Stripe (PCI DSS L1)', 'Daily automated backups'] },
              ].map((g) => (
                <div key={g.title} className="rounded-2xl border border-gray-100 bg-white p-5 hover:shadow-sm transition-all">
                  <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                    <g.icon className="h-[18px] w-[18px] text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">{g.title}</h3>
                  <FeatureList items={g.items} />
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Industry links */}
        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-14">
            <p className="text-center text-[13px] font-semibold text-gray-400 uppercase tracking-widest mb-8">
              Built for your industry
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Hair Salons',      href: '/for/salons' },
                { label: 'Clinics',          href: '/for/clinics' },
                { label: 'Barbershops',      href: '/for/barbershops' },
                { label: 'Physiotherapy',    href: '/for/physiotherapy' },
                { label: 'Personal Trainers',href: '/for/personal-trainers' },
                { label: 'Yoga Studios',     href: '/for/yoga-studios' },
                { label: 'Aesthetics',       href: '/for/aesthetics' },
                { label: 'Consultants',      href: '/for/consultants' },
                { label: 'Dental',           href: '/for/dental' },
                { label: 'Pilates',          href: '/for/pilates' },
                { label: 'Nail Studios',     href: '/for/nail-studios' },
                { label: 'Lawyers',          href: '/for/lawyers' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#070c18]">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-20 text-center">
            <p className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest mb-4">14-day free trial</p>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-white mb-4">
              Every feature, free for 14 days
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              No credit card. No setup fee. Full Pro access from day one.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://app.inboker.com/signup"
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 text-sm transition-colors shadow-lg shadow-blue-600/20"
              >
                Start free trial
              </a>
              <Link
                href="/pricing"
                className="rounded-xl border border-white/[0.12] text-white/70 font-semibold px-8 py-3.5 text-sm hover:border-white/25 hover:text-white transition-colors"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
