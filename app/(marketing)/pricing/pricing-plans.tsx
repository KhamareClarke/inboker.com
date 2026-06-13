'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Minus } from 'lucide-react';

type Interval = 'monthly' | 'annual';

const plans = [
  {
    name: 'Starter',
    monthly: 29,
    annual: 23,
    annualBilled: 276,
    description: 'Everything you need to start taking online bookings.',
    cta: 'Start free trial',
    ctaHref: '/signup',
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
  },
  {
    name: 'Pro',
    monthly: 69,
    annual: 55,
    annualBilled: 660,
    description: 'Automation and team tools for growing practices.',
    cta: 'Start free trial',
    ctaHref: '/signup',
    popular: true,
    features: [
      'Up to 5 staff members',
      'Unlimited bookings',
      'SMS + email reminders',
      'Intake forms & e-signatures',
      'Client CRM & history',
      'Advanced analytics',
      'White-label booking page',
      'Priority support',
    ],
  },
  {
    name: 'Business',
    monthly: 149,
    annual: 119,
    annualBilled: 1428,
    description: 'Enterprise-grade tools for multi-location businesses.',
    cta: 'Contact sales',
    ctaHref: '/contact',
    popular: false,
    features: [
      'Unlimited staff members',
      'Unlimited bookings',
      'Full white-label branding',
      'Custom domain',
      'API access & webhooks',
      'Multi-location support',
      'Dedicated account manager',
      'SLA & uptime guarantee',
    ],
  },
];

type CellValue = boolean | string | null;

const comparisonRows: { category: string; rows: { feature: string; starter: CellValue; pro: CellValue; business: CellValue }[] }[] = [
  {
    category: 'Core booking',
    rows: [
      { feature: 'Online booking page', starter: true, pro: true, business: true },
      { feature: 'Booking widget (embed)', starter: true, pro: true, business: true },
      { feature: 'QR code booking', starter: true, pro: true, business: true },
      { feature: 'Real-time availability', starter: true, pro: true, business: true },
      { feature: 'Monthly bookings', starter: '200', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Services', starter: '10', pro: 'Unlimited', business: 'Unlimited' },
    ],
  },
  {
    category: 'Team & staff',
    rows: [
      { feature: 'Staff members', starter: '1', pro: 'Up to 5', business: 'Unlimited' },
      { feature: 'Individual staff calendars', starter: false, pro: true, business: true },
      { feature: 'Role-based permissions', starter: false, pro: true, business: true },
      { feature: 'Multi-location support', starter: false, pro: false, business: true },
    ],
  },
  {
    category: 'Reminders & communication',
    rows: [
      { feature: 'Email reminders', starter: true, pro: true, business: true },
      { feature: 'SMS reminders', starter: false, pro: true, business: true },
      { feature: 'WhatsApp reminders', starter: false, pro: true, business: true },
      { feature: 'Two-way messaging', starter: false, pro: true, business: true },
    ],
  },
  {
    category: 'Payments',
    rows: [
      { feature: 'Stripe payment processing', starter: true, pro: true, business: true },
      { feature: 'Deposits & upfront payment', starter: true, pro: true, business: true },
      { feature: 'Gift vouchers', starter: false, pro: true, business: true },
      { feature: 'Promo codes', starter: false, pro: true, business: true },
      { feature: 'Invoice generation', starter: false, pro: true, business: true },
    ],
  },
  {
    category: 'Client management',
    rows: [
      { feature: 'Client profiles', starter: true, pro: true, business: true },
      { feature: 'Intake forms & e-signatures', starter: false, pro: true, business: true },
      { feature: 'Built-in CRM', starter: false, pro: true, business: true },
      { feature: 'Client history & notes', starter: false, pro: true, business: true },
      { feature: 'Review requests', starter: false, pro: true, business: true },
    ],
  },
  {
    category: 'Branding',
    rows: [
      { feature: 'Custom booking page', starter: true, pro: true, business: true },
      { feature: 'White-label branding', starter: false, pro: true, business: true },
      { feature: 'Custom domain', starter: false, pro: false, business: true },
      { feature: 'Remove Inboker branding', starter: false, pro: true, business: true },
    ],
  },
  {
    category: 'Analytics & integrations',
    rows: [
      { feature: 'Basic analytics', starter: true, pro: true, business: true },
      { feature: 'Advanced analytics', starter: false, pro: true, business: true },
      { feature: 'API access', starter: false, pro: false, business: true },
      { feature: 'Webhooks', starter: false, pro: false, business: true },
      { feature: 'Zapier integration', starter: false, pro: true, business: true },
    ],
  },
  {
    category: 'Support',
    rows: [
      { feature: 'Email support', starter: true, pro: true, business: true },
      { feature: 'Priority support', starter: false, pro: true, business: true },
      { feature: 'Dedicated account manager', starter: false, pro: false, business: true },
      { feature: 'SLA & uptime guarantee', starter: false, pro: false, business: true },
      { feature: 'Free data migration', starter: false, pro: true, business: true },
    ],
  },
];

function Cell({ value }: { value: CellValue }) {
  if (value === true) return <Check className="h-4 w-4 text-emerald-500 mx-auto" />;
  if (value === false) return <Minus className="h-4 w-4 text-gray-300 mx-auto" />;
  return <span className="text-sm text-gray-700 font-medium">{value}</span>;
}

export function PricingPlans() {
  const [interval, setInterval] = useState<Interval>('monthly');
  const isAnnual = interval === 'annual';

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
        <button
          onClick={() => setInterval(isAnnual ? 'monthly' : 'annual')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isAnnual ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          aria-pressed={isAnnual}
          aria-label="Toggle annual billing"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              isAnnual ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>
          Annual
          <span className="ml-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            Save 20%
          </span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {plans.map((plan) => {
          const price = isAnnual ? plan.annual : plan.monthly;
          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl flex flex-col ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white ring-2 ring-blue-500 shadow-[0_20px_60px_-10px_rgba(59,130,246,0.4)]'
                  : 'bg-white border border-gray-100 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 px-4 py-1 text-[11px] font-bold text-white uppercase tracking-wide shadow">
                    Most popular
                  </span>
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 ${plan.popular ? 'text-blue-200' : 'text-gray-400'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-[clamp(2.75rem,5vw,3.5rem)] font-extrabold leading-none tracking-tight ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    £{price}
                  </span>
                  <span className={`text-base mb-2 ${plan.popular ? 'text-blue-300' : 'text-gray-400'}`}>/mo</span>
                </div>
                {isAnnual && (
                  <p className={`text-xs mb-2 ${plan.popular ? 'text-blue-300' : 'text-gray-400'}`}>
                    Billed annually (£{plan.annualBilled}/yr)
                  </p>
                )}
                <p className={`text-sm leading-relaxed mb-6 ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>

                <ul className="space-y-3 flex-1 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${plan.popular ? 'bg-white/20' : 'bg-emerald-50'}`}>
                        <Check className={`h-2.5 w-2.5 ${plan.popular ? 'text-cyan-300' : 'text-emerald-500'}`} />
                      </span>
                      <span className={`text-sm leading-snug ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    plan.popular
                      ? 'bg-white text-blue-700 hover:bg-blue-50 focus:ring-blue-300'
                      : 'bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-400">
        All plans include a 14-day free trial. No credit card required.{' '}
        <Link href="/contact" className="text-blue-600 hover:underline font-medium">Need a custom plan?</Link>
      </p>

      {/* Feature comparison table */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Full feature comparison</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-500 w-[40%]">Feature</th>
                {plans.map((p) => (
                  <th key={p.name} className={`px-4 py-4 text-center text-sm font-bold ${p.popular ? 'text-blue-600' : 'text-gray-700'}`}>
                    {p.name}
                    {p.popular && <span className="ml-1 text-[10px] font-semibold text-blue-400 uppercase">★</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((group) => (
                <>
                  <tr key={group.category} className="bg-gray-50/60">
                    <td colSpan={4} className="px-5 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {group.category}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.feature} className="border-t border-gray-50 hover:bg-blue-50/20 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-700">{row.feature}</td>
                      <td className="px-4 py-3 text-center"><Cell value={row.starter} /></td>
                      <td className="px-4 py-3 text-center bg-blue-50/30"><Cell value={row.pro} /></td>
                      <td className="px-4 py-3 text-center"><Cell value={row.business} /></td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
