import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Zap } from 'lucide-react';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/json-ld';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export const metadata: Metadata = {
  title: 'Integrations: Connect Inboker to Your Existing Tools',
  description:
    'Inboker integrates with Stripe, Google Calendar, WhatsApp, Twilio, Zapier, and more. Connect your booking system to the tools you already use.',
  alternates: { canonical: `${siteUrl}/integrations` },
  openGraph: {
    title: 'Inboker Integrations',
    description: 'Connect Inboker to Stripe, Google Calendar, WhatsApp, Twilio, Zapier and more.',
    url: `${siteUrl}/integrations`,
    type: 'website',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
  },
};

const integrations = [
  {
    name: 'Stripe',
    category: 'Payments',
    description:
      'Accept card payments, deposits, and refunds directly through your booking flow. Stripe powers all payment processing. PCI DSS Level 1 compliant, Apple Pay and Google Pay supported.',
    features: [
      'Full payment at booking or deposit only',
      'Apple Pay, Google Pay, and Stripe Link',
      'Automatic refunds on cancellation',
      'Invoice generation and PDF download',
      '0% Inboker transaction fee',
    ],
    badge: 'Built-in',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    logo: (
      <svg viewBox="0 0 60 25" fill="none" className="h-7 w-auto">
        <path d="M5.996 10.222c0-.834.684-1.154 1.818-1.154 1.625 0 3.678.493 5.303 1.373V5.605c-1.776-.703-3.53-1.032-5.303-1.032C3.136 4.573 0 7.092 0 10.948c0 5.976 8.226 5.022 8.226 7.604 0 .988-.858 1.307-2.06 1.307-1.776 0-4.053-.73-5.856-1.712v4.905c1.992.856 4.009 1.22 5.856 1.22 4.558 0 7.694-2.247 7.694-6.16-.022-6.448-8.264-5.306-8.264-7.89zm14.89-6.225l-4.35.925v4.25l4.35-.925V3.997zm-4.35 5.475V24.11h4.35V9.472h-4.35zm10.04 0l-.272-1.667h-3.823v16.306h4.35V13.345c1.028-1.343 2.77-1.096 3.314-.904V9.472c-.566-.214-2.637-.61-3.57 1.001zm8.09-3.565l-4.304.916-.012 14.925c0 2.758 2.07 4.792 4.828 4.792 1.527 0 2.646-.28 3.262-.614v-3.531c-.594.24-3.524 1.095-3.524-1.65v-6.594h3.524V9.472h-3.524l-.25-2.564zm11.71 3.16c-1.557 0-2.558.73-3.114 1.24l-.206-1.307h-3.836v16.11h4.35v-10.95c1.028-1.316 2.762-.997 3.292-.831V9.472a4.365 4.365 0 00-.486-.405zm5.28 15.547h4.35V4.573h-4.35v20.036z" fill="#635BFF" />
      </svg>
    ),
  },
  {
    name: 'Google Calendar',
    category: 'Calendar sync',
    description:
      "Two-way sync between Inboker and Google Calendar. When a client books, it appears in your Google Calendar instantly. Block personal appointments in Google Calendar and they'll show as unavailable in Inboker.",
    features: [
      'Two-way real-time sync',
      'Supports multiple Google accounts per staff member',
      'Personal blocks automatically mark you as unavailable',
      'Client booking confirmations include Google Calendar invite',
      'Works across Google Workspace and personal accounts',
    ],
    badge: 'Built-in',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    logo: (
      <svg viewBox="0 0 200 200" className="h-8 w-8">
        <path d="M152.637 43.363H47.363C45.161 43.363 43.363 45.161 43.363 47.363v105.273c0 2.203 1.798 4 4 4h105.274c2.202 0 4-1.797 4-4V47.363c0-2.202-1.798-4-4-4" fill="#FFF" />
        <path d="M152.637 200H47.363C21.2 200 0 178.8 0 152.637V47.363C0 21.2 21.2 0 47.363 0h105.274C178.8 0 200 21.2 200 47.363v105.274C200 178.8 178.8 200 152.637 200" fill="#4285F4" />
        <path d="M152.637 43.363H47.363C45.161 43.363 43.363 45.161 43.363 47.363v105.273c0 2.203 1.798 4 4 4h105.274c2.202 0 4-1.797 4-4V47.363c0-2.202-1.798-4-4-4" fill="#FFF" />
        <text x="100" y="128" textAnchor="middle" fill="#4285F4" fontSize="42" fontWeight="bold" fontFamily="Arial">17</text>
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    category: 'Messaging',
    description:
      'Send booking confirmations, reminders, and follow-ups via WhatsApp. Generate a WhatsApp booking link that lets clients start a booking directly from your bio, stories, or messages.',
    features: [
      'WhatsApp booking link: straight to your page from any conversation',
      'Automated booking confirmations via WhatsApp',
      'Reminder messages at your chosen intervals',
      'Two-way messaging: clients can reply to confirm or cancel',
      'Works with WhatsApp Business and regular accounts',
    ],
    badge: 'Pro & Business',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    logo: (
      <svg viewBox="0 0 24 24" className="h-8 w-8">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366" />
      </svg>
    ),
  },
  {
    name: 'Twilio',
    category: 'SMS',
    description:
      "Inboker uses Twilio to deliver SMS reminders worldwide. Every text message, including confirmations, reminders, and follow-ups, routes through Twilio's carrier network for near-100% delivery rates.",
    features: [
      'UK and international SMS delivery',
      'Dedicated sender number or shared pool',
      'Delivery receipts logged per message',
      'Two-way SMS: clients reply to confirm or cancel',
      'Opt-out handling compliant with UK SMS regulations',
    ],
    badge: 'Pro & Business',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    logo: (
      <svg viewBox="0 0 30 30" className="h-8 w-8">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15zm0 26.25c-6.213 0-11.25-5.037-11.25-11.25S8.787 3.75 15 3.75 26.25 8.787 26.25 15 21.213 26.25 15 26.25zm-2.25-9.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm9 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-9-6.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm9 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" fill="#F22F46" />
      </svg>
    ),
  },
  {
    name: 'Zapier',
    category: 'Automation',
    description:
      'Connect Inboker to 6,000+ apps via Zapier. Trigger workflows when a booking is created, cancelled, or completed. Sync data to your CRM, send Slack notifications, update spreadsheets, or anything else.',
    features: [
      'Trigger on: booking created, cancelled, completed, no-show',
      'Send booking data to any CRM (HubSpot, Salesforce, etc.)',
      'Slack or Teams notifications for new bookings',
      'Add clients to email marketing lists automatically',
      'Update Google Sheets or Airtable on every booking',
    ],
    badge: 'Pro & Business',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    logo: (
      <svg viewBox="0 0 244.4 66" className="h-6 w-auto">
        <path d="M57.8 27.2L34.5 50.5h30.6l-3.2 8.4H19.1l3.2-8.4L45.6 27H16.8l3.2-8.4h41l-3.2 8.6zm46.6-8.5h10l-21 40.2h-10.6l-21-40.2h10.7l15.8 32 16.1-32zm36.6 0c14 0 23.1 8.6 23.1 20.5 0 12-9.1 20.5-23.1 20.5-14 0-23.1-8.5-23.1-20.5.1-11.9 9.2-20.5 23.1-20.5zm0 8.2c-8 0-13.3 5.2-13.3 12.3s5.3 12.3 13.3 12.3c8 0 13.3-5.2 13.3-12.3s-5.3-12.3-13.3-12.3zm59.2-8.2c13.5 0 21.3 8.5 21.3 20 0 .8-.1 2.2-.2 3.1h-33c1.3 6.3 6.4 9.8 14 9.8 5.2 0 10-1.6 14.1-4.7l4.7 6.7c-5.4 4.1-12 6.1-19.3 6.1-15 0-23.4-9.1-23.4-20.6 0-12.2 9-20.4 21.8-20.4zm11.6 16.6c-.5-5.7-4.9-9-11.4-9s-11.3 3.4-12.7 9h24.1zm32.2 23.6h-9.5V18.7H244l-.3 6.1c3.4-4.2 8.7-6.9 14.8-6.9l-1.2 9c-5.5 0-10.5 2.6-13.3 7.6v25.4z" fill="#FF4A00" />
      </svg>
    ),
  },
  {
    name: 'Webhooks & API',
    category: 'Developer',
    description:
      'Build custom integrations using the Inboker REST API or receive real-time event notifications via webhooks. Connect Inboker to any internal system, data warehouse, or custom application.',
    features: [
      'REST API with full CRUD for bookings, clients, and services',
      'Webhook events: booking.created, booking.cancelled, client.created',
      'HMAC signature verification for webhook security',
      'API keys per workspace with scoped permissions',
      'OpenAPI documentation and Postman collection available',
    ],
    badge: 'Business',
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    logo: (
      <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center">
        <span className="text-white text-[10px] font-bold font-mono">API</span>
      </div>
    ),
  },
];

const categories = ['All', 'Payments', 'Calendar sync', 'Messaging', 'SMS', 'Automation', 'Developer'];

export default function IntegrationsPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Integrations', url: `${siteUrl}/integrations` },
  ];

  const integrationFaqs = [
    { question: 'What payment processors does Inboker support?', answer: 'Inboker uses Stripe for all payment processing. This gives you access to card payments, Apple Pay, Google Pay, and Stripe Link. Inboker charges zero transaction fees. Only standard Stripe processing fees apply.' },
    { question: 'Does Inboker integrate with Google Calendar?', answer: 'Yes. Inboker has two-way Google Calendar sync. When a client books an appointment, it appears in your Google Calendar instantly. Personal events or blocks you add in Google Calendar automatically mark you as unavailable in Inboker.' },
    { question: 'Can I connect Inboker to my CRM or email marketing tool?', answer: 'Yes, via Zapier (Pro and Business plans). Inboker connects to 6,000+ apps including HubSpot, Mailchimp, Salesforce, ActiveCampaign, and more. When a booking is created or completed, you can trigger workflows in any connected tool automatically.' },
    { question: 'Does Inboker support WhatsApp booking?', answer: 'Yes. Inboker generates a WhatsApp-optimised booking link that clients can tap in any conversation to open your booking page directly. You can also send booking confirmations and reminders via WhatsApp on Pro and Business plans.' },
    { question: 'Is there an API available for custom integrations?', answer: 'Yes. The Business plan includes full REST API access and webhook support. The API supports CRUD operations for bookings, clients, services, and staff. Webhooks can trigger on booking.created, booking.cancelled, booking.completed, and client.created events.' },
  ];

  return (
    <>
      <FAQSchema faqs={integrationFaqs} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <div className="bg-[#070c18]">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest mb-3">Integrations</p>
              <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold tracking-tight text-white leading-tight mb-5">
                Connect Inboker to the tools you already use
              </h1>
              <p className="text-xl text-white/55 leading-relaxed mb-8 max-w-2xl">
                Inboker works with Stripe, Google Calendar, WhatsApp, Twilio, Zapier, and more, so your booking system fits into your existing workflow, not the other way round.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://app.inboker.com/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Start free trial <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white/40 hover:text-white transition-colors"
                >
                  See all features
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-5">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>6 native integrations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>No extra setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>6,000+ apps via Zapier</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>REST API on Business plan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration cards */}
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="rounded-2xl border border-gray-100 bg-white p-7 hover:border-blue-100 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.1)] transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 shrink-0">
                      {integration.logo}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">{integration.name}</h2>
                      <p className="text-xs text-gray-400">{integration.category}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${integration.badgeColor}`}>
                    {integration.badge}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-5">{integration.description}</p>

                <ul className="space-y-2">
                  {integration.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                        <Check className="h-2.5 w-2.5 text-emerald-500" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Zapier CTA */}
        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-14">
            <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Need to connect something else?
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  With Zapier, you can connect Inboker to over 6,000 apps, including HubSpot, Mailchimp, Slack, Salesforce, Notion, Google Sheets, and more. No code required.
                </p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                  Request an integration
                </Link>
                <a
                  href="https://app.inboker.com/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap"
                >
                  Start free trial <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-[#070c18]">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-14 sm:py-16 text-center">
            <p className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest mb-4">Included in every plan</p>
            <h2 className="font-display text-2xl font-extrabold text-white mb-3">
              All integrations included in your plan
            </h2>
            <p className="text-white/45 mb-7 max-w-lg mx-auto text-sm leading-relaxed">
              No per-integration fees, no marketplace markups. Every integration is part of the plan.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://app.inboker.com/signup"
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3 text-sm transition-colors shadow-lg shadow-blue-600/20"
              >
                Start free trial
              </a>
              <Link
                href="/pricing"
                className="rounded-xl border border-white/[0.12] text-white/70 font-semibold px-7 py-3 text-sm hover:border-white/25 hover:text-white transition-colors"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
