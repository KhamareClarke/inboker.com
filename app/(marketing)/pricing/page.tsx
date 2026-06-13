import type { Metadata } from 'next';
import Link from 'next/link';
import { Star, Shield, Zap, Users, ArrowRight } from 'lucide-react';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/json-ld';
import { PricingPlans } from './pricing-plans';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export const metadata: Metadata = {
  title: 'Pricing: Simple, Transparent Plans | Inboker',
  description:
    'Inboker starts at £29/month for solo practitioners. No hidden fees, no setup costs. All plans include a 14-day free trial with no credit card required.',
  alternates: { canonical: `${siteUrl}/pricing` },
  openGraph: {
    title: 'Inboker Pricing: Simple, Transparent Plans',
    description: 'Starter £29/mo · Pro £69/mo · Business £149/mo. 14-day free trial, no credit card required.',
    url: `${siteUrl}/pricing`,
    type: 'website',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inboker Pricing: Plans from £29/month',
    description: '14-day free trial. No credit card required.',
    images: [`${siteUrl}/og-image.png`],
  },
};

const faqs = [
  {
    question: 'Is there really no credit card required for the free trial?',
    answer:
      'Correct. Sign up in under 30 seconds, explore every Pro feature for 14 days, and only enter payment details when you decide to subscribe. No charges until you choose a plan.',
  },
  {
    question: 'What happens when my trial ends?',
    answer:
      'Your account moves to a free read-only mode. Your data, clients, and settings are preserved. You can upgrade to a paid plan at any time without losing anything.',
  },
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Yes. Upgrade or downgrade any time from your billing dashboard. Upgrades take effect immediately with a prorated charge. Downgrades take effect at the next billing cycle.',
  },
  {
    question: 'Do you offer annual billing?',
    answer:
      "Yes. Annual billing saves you 20% compared to monthly. You're billed once per year. Starter drops from £29 to £23/mo, Pro from £69 to £55/mo, and Business from £149 to £119/mo.",
  },
  {
    question: 'Can I use Inboker across multiple locations?',
    answer:
      'The Business plan supports unlimited locations under a single account with a unified dashboard, cross-location reporting, and centralised client management.',
  },
  {
    question: 'Are there any setup fees or hidden costs?',
    answer:
      'No setup fees, no onboarding fees, no contracts. You pay your plan price and nothing else. Stripe payment processing fees (charged by Stripe, not Inboker) apply when you take payments from clients.',
  },
  {
    question: 'Do you offer a discount for charities or non-profits?',
    answer:
      'Yes. We offer 30% off for registered charities, NHS-affiliated practices, and non-profits. Contact us at hello@inboker.com with proof of status.',
  },
  {
    question: 'Can I migrate from my current booking software?',
    answer:
      'Yes. Pro and Business plans include free data migration. Send us your export file from any platform and our team will import your clients, services, and history.',
  },
];

const trustSignals = [
  { icon: Star, label: '4.8 / 5 rating', sub: 'Across 312 reviews' },
  { icon: Users, label: '2,000+ businesses', sub: 'Use Inboker every day' },
  { icon: Shield, label: 'GDPR compliant', sub: 'UK & EU data protection' },
  { icon: Zap, label: '5-minute setup', sub: 'Live in under an hour' },
];

export default function PricingPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Pricing', url: `${siteUrl}/pricing` },
  ];

  return (
    <>
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-blue-900 via-[#1a2d6b] to-indigo-900 overflow-hidden -mt-[68px]">
          <div className="absolute inset-0 hero-grid" />
          <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.22),transparent)]" />
          <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-cyan-400/25 rounded-full blur-[80px]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[70px]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 pt-[148px] sm:pt-[180px] pb-16 sm:pb-20 text-center">
            <p className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest mb-4">Pricing</p>
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold tracking-tight text-white leading-tight mb-5">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-white/70 max-w-xl mx-auto leading-relaxed mb-8">
              No hidden fees. No long-term contracts. Start free, upgrade when you're ready.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25">
                Start free trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white/40 hover:text-white transition-colors">
                Contact sales
              </Link>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-5">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {trustSignals.map((t) => (
                <div key={t.label} className="flex items-center gap-2.5 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <t.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{t.label}</span>
                    <span className="text-gray-400 ml-1.5 text-xs">{t.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plans + comparison */}
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-20">
          <PricingPlans />
        </div>

        {/* Social proof */}
        <div className="border-t border-gray-100 bg-gray-50/60">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16">
            <p className="text-center text-[13px] font-semibold text-gray-400 uppercase tracking-widest mb-10">
              Loved by appointment businesses
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  quote: 'Switching to Inboker cut our no-shows nearly in half. Clients rebook themselves and our front desk finally breathes.',
                  author: 'Aisha R.',
                  role: 'Salon owner, London',
                  rating: 5,
                },
                {
                  quote: 'The WhatsApp booking link converts like crazy. Bookings straight from our bio. Absolute game changer.',
                  author: 'Marco P.',
                  role: 'Barbershop owner, Manchester',
                  rating: 5,
                },
                {
                  quote: 'Multi-staff scheduling was a nightmare before Inboker. Now everyone sees their shifts and we're fully booked.',
                  author: 'James K.',
                  role: 'Physio clinic manager, Bristol',
                  rating: 5,
                },
              ].map((t) => (
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

        {/* FAQ */}
        <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-10">Pricing FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-br from-blue-900 via-[#1a2d6b] to-indigo-900">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-20 text-center">
            <p className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest mb-4">Get started</p>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-white mb-4">
              Start your free 14-day trial today
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              No credit card. No contracts. Just online bookings, automated reminders, and a calmer working day.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 text-sm transition-colors shadow-lg shadow-blue-600/20"
              >
                Get started free
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-white/[0.12] text-white/70 font-semibold px-8 py-3.5 text-sm hover:border-white/25 hover:text-white transition-colors"
              >
                Talk to sales
              </Link>
            </div>
            <p className="mt-6 text-white/30 text-xs">
              Questions? Email us at{' '}
              <a href="mailto:hello@inboker.com" className="underline hover:text-white/60">
                hello@inboker.com
              </a>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
