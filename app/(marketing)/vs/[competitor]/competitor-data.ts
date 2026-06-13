export interface ComparisonFeature {
  feature: string;
  inboker: string | boolean;
  competitor: string | boolean;
}

export interface CompetitorData {
  slug: string;
  name: string;
  headline: string;
  subheadline: string;
  intro: string;
  comparisonTable: ComparisonFeature[];
  inbokerAdvantages: string[];
  faqs: { question: string; answer: string }[];
  metaTitle: string;
  metaDescription: string;
}

export const competitorData: Record<string, CompetitorData> = {
  calendly: {
    slug: 'calendly',
    name: 'Calendly',
    headline: 'Inboker vs Calendly — which booking tool is right for you?',
    subheadline: 'Calendly is built for individual meeting scheduling. Inboker is built for appointment-based service businesses.',
    intro:
      'Both Inboker and Calendly let people book time with you online. But they serve very different needs. Calendly excels at scheduling 1-to-1 meetings for knowledge workers and sales teams. Inboker is purpose-built for service businesses — clinics, salons, barbers, trainers — where multi-staff scheduling, client management, payments, and no-show reduction matter most.',
    comparisonTable: [
      { feature: 'Multi-staff scheduling', inboker: true, competitor: 'Limited (team plan only)' },
      { feature: 'SMS reminders', inboker: true, competitor: false },
      { feature: 'Payment collection at booking', inboker: true, competitor: 'Limited' },
      { feature: 'Digital intake forms', inboker: true, competitor: false },
      { feature: 'Built-in client CRM', inboker: true, competitor: false },
      { feature: 'White-label branding', inboker: true, competitor: false },
      { feature: 'AI scheduling optimisation', inboker: true, competitor: false },
      { feature: 'No-show deposit collection', inboker: true, competitor: false },
      { feature: 'Service-based booking (not just meetings)', inboker: true, competitor: 'Limited' },
      { feature: 'Free plan available', inboker: '14-day free trial', competitor: true },
      { feature: 'Starting price (monthly)', inboker: '£29/mo', competitor: '$10/mo (basic)' },
      { feature: 'UK-based pricing (GBP)', inboker: true, competitor: false },
    ],
    inbokerAdvantages: [
      'Built for service businesses, not just meeting scheduling',
      'SMS reminders that actually reduce no-shows by up to 92%',
      'Collect deposits at booking to protect your revenue',
      'Digital intake forms — no paper, no manual data entry',
      'Full client CRM and appointment history built in',
      'White-label branding so your booking page looks like yours',
      'Multi-staff coordination from one dashboard',
    ],
    faqs: [
      {
        question: 'Is Inboker better than Calendly for salons and clinics?',
        answer:
          'Yes. Calendly is designed for individual meeting scheduling — great for sales calls and interviews. Inboker is purpose-built for appointment-based service businesses with features like SMS reminders, deposit collection, intake forms, multi-staff scheduling, and a built-in CRM that Calendly does not offer.',
      },
      {
        question: 'Does Inboker cost more than Calendly?',
        answer:
          'Inboker starts at £29/month which is comparable to Calendly\'s paid plans when you include features like SMS reminders and payment collection — features that require paid add-ons or are unavailable on Calendly. Inboker offers a 14-day free trial with no credit card required.',
      },
      {
        question: 'Can I migrate from Calendly to Inboker?',
        answer:
          'Yes. We offer free data migration from Calendly. Contact our team and we\'ll handle the transition for you.',
      },
      {
        question: 'Does Inboker have a free plan like Calendly?',
        answer:
          'Inboker offers a 14-day free trial with full access to all features — no credit card required. We do not have a permanently free tier because our feature set is significantly more comprehensive than Calendly\'s free plan.',
      },
    ],
    metaTitle: 'Inboker vs Calendly — Comparison for Service Businesses | Inboker',
    metaDescription:
      'Inboker vs Calendly: which is better for clinics, salons, and service businesses? Compare features, pricing, SMS reminders, and intake forms. See why Inboker wins.',
  },

  'acuity-scheduling': {
    slug: 'acuity-scheduling',
    name: 'Acuity Scheduling',
    headline: 'Inboker vs Acuity Scheduling — a detailed comparison',
    subheadline: 'Both are service-business scheduling tools. Here\'s how they compare on features, price, and ease of use.',
    intro:
      'Acuity Scheduling (now part of Squarespace) and Inboker both serve appointment-based businesses. Acuity is an established platform with solid core features. Inboker adds AI-powered scheduling, a built-in CRM, and SMS reminders designed to drive revenue — not just manage it.',
    comparisonTable: [
      { feature: 'Multi-staff scheduling', inboker: true, competitor: true },
      { feature: 'SMS reminders', inboker: true, competitor: 'Paid add-on' },
      { feature: 'Payment collection at booking', inboker: true, competitor: true },
      { feature: 'Digital intake forms', inboker: true, competitor: true },
      { feature: 'Built-in client CRM', inboker: true, competitor: 'Basic' },
      { feature: 'AI scheduling optimisation', inboker: true, competitor: false },
      { feature: 'White-label branding', inboker: true, competitor: 'Paid plan only' },
      { feature: 'No-show deposit collection', inboker: true, competitor: true },
      { feature: 'Waitlist management', inboker: true, competitor: true },
      { feature: 'Starting price (monthly)', inboker: '£29/mo', competitor: '$20/mo' },
      { feature: 'AI-powered slot optimisation', inboker: true, competitor: false },
      { feature: 'Free trial', inboker: '14 days, no card', competitor: '7 days' },
    ],
    inbokerAdvantages: [
      'AI-powered scheduling that fills gaps and maximises revenue automatically',
      'Built-in client CRM with full appointment history, not just basic records',
      'SMS reminders included in all plans (not a paid add-on)',
      'More intuitive setup — live in 5 minutes',
      'UK-based pricing in GBP',
      'Longer free trial — 14 days vs 7 days',
    ],
    faqs: [
      {
        question: 'What does Inboker offer that Acuity Scheduling does not?',
        answer:
          'The key differentiators are AI-powered scheduling optimisation, a full built-in CRM (not just basic client records), SMS reminders included in all plans (not a paid add-on on Acuity), and a 14-day free trial. Inboker is also more focused on revenue-driving features like no-show reduction.',
      },
      {
        question: 'Is Inboker cheaper than Acuity Scheduling?',
        answer:
          'Inboker\'s Starter plan at £29/month is comparable to Acuity\'s entry plan. When you factor in that SMS reminders are an add-on on Acuity, Inboker delivers more value at a similar price point.',
      },
      {
        question: 'Can I switch from Acuity Scheduling to Inboker?',
        answer:
          'Yes. We offer free data migration from Acuity Scheduling. Our team handles the import of your services, staff, and client data.',
      },
    ],
    metaTitle: 'Inboker vs Acuity Scheduling — Feature Comparison | Inboker',
    metaDescription:
      'Compare Inboker vs Acuity Scheduling on features, pricing, and ease of use. See which appointment booking software is best for your service business.',
  },

  fresha: {
    slug: 'fresha',
    name: 'Fresha',
    headline: 'Inboker vs Fresha — comparing booking platforms for salons and beauty',
    subheadline: 'Fresha is free but charges commission on every booking. Inboker is subscription-based with zero transaction fees on your revenue.',
    intro:
      'Fresha has become popular in the beauty industry partly because of its free tier. But free often has a hidden cost: Fresha charges a commission on new client bookings made through their marketplace. Inboker is a flat monthly subscription — no commission, no surprises, no marketplace dependency.',
    comparisonTable: [
      { feature: 'Monthly subscription cost', inboker: 'From £29/mo', competitor: 'Free (marketplace commissions apply)' },
      { feature: 'Commission on bookings', inboker: false, competitor: '20% on new marketplace clients' },
      { feature: 'SMS reminders', inboker: true, competitor: true },
      { feature: 'Multi-staff scheduling', inboker: true, competitor: true },
      { feature: 'White-label branding', inboker: true, competitor: 'Limited' },
      { feature: 'AI scheduling optimisation', inboker: true, competitor: false },
      { feature: 'Custom domain', inboker: 'Business plan', competitor: false },
      { feature: 'Built-in client CRM', inboker: true, competitor: 'Basic' },
      { feature: 'Marketplace listing', inboker: false, competitor: true },
      { feature: 'No commission on existing clients', inboker: true, competitor: true },
      { feature: 'Free trial', inboker: '14 days, no card', competitor: 'Free (with commissions)' },
    ],
    inbokerAdvantages: [
      'Zero commission on any booking — ever',
      'You own your client relationships, not a marketplace',
      'White-label branding so clients book through your brand',
      'AI scheduling that maximises your existing appointment slots',
      'Predictable flat monthly cost — easier to budget',
      'No dependency on Fresha\'s marketplace for new clients',
    ],
    faqs: [
      {
        question: 'Is Inboker more expensive than Fresha?',
        answer:
          'Fresha is free but charges up to 20% commission on new clients booked via their marketplace. For a busy salon doing £5,000/month in marketplace revenue, that\'s £1,000/month in commission vs Inboker\'s £29–£149/month flat fee. Most businesses save significantly by switching to a subscription model.',
      },
      {
        question: 'Will I lose clients if I leave Fresha\'s marketplace?',
        answer:
          'Your existing clients are yours — they book through your link, not just Fresha\'s marketplace. With Inboker, you own your booking link, client data, and relationships. You\'d only potentially lose new clients who discover you through Fresha\'s directory.',
      },
      {
        question: 'Does Inboker help me get new clients without a marketplace?',
        answer:
          'Inboker gives you a shareable booking link for your website, Instagram bio, Google Business Profile, and WhatsApp. Combined with SMS reminders that drive rebooking, most businesses grow their client base without needing a third-party marketplace.',
      },
    ],
    metaTitle: 'Inboker vs Fresha — Which Booking Platform Is Better? | Inboker',
    metaDescription:
      'Inboker vs Fresha: flat subscription vs commission-based. Compare features, true costs, and which is better for salons, barbershops, and beauty businesses.',
  },

  treatwell: {
    slug: 'treatwell',
    name: 'Treatwell',
    headline: 'Inboker vs Treatwell — booking software vs marketplace',
    subheadline: 'Treatwell is a consumer marketplace. Inboker is your own booking system. Different tools for different goals.',
    intro:
      'Treatwell is a consumer-facing marketplace where clients discover new salons and beauty services. Inboker is your own branded booking system. Some businesses benefit from both — using Treatwell for discovery and Inboker for managing their existing client base and direct bookings.',
    comparisonTable: [
      { feature: 'Your own branded booking page', inboker: true, competitor: false },
      { feature: 'Commission on bookings', inboker: false, competitor: 'Up to 30%+' },
      { feature: 'New client discovery', inboker: 'Via your own marketing', competitor: true },
      { feature: 'Multi-staff management', inboker: true, competitor: 'Limited' },
      { feature: 'SMS reminders', inboker: true, competitor: true },
      { feature: 'AI scheduling', inboker: true, competitor: false },
      { feature: 'Digital intake forms', inboker: true, competitor: false },
      { feature: 'Built-in CRM', inboker: true, competitor: false },
      { feature: 'White-label branding', inboker: true, competitor: false },
      { feature: 'Monthly flat fee', inboker: 'From £29/mo', competitor: 'Commission-based' },
    ],
    inbokerAdvantages: [
      'No commission — keep 100% of every booking',
      'Your brand, your client relationships, your data',
      'More powerful management tools for your existing client base',
      'AI scheduling to maximise your appointment slots',
      'Digital intake forms and client history',
      'Predictable, flat monthly cost',
    ],
    faqs: [
      {
        question: 'Should I use Inboker instead of Treatwell?',
        answer:
          'They serve different purposes. Treatwell helps new clients discover you. Inboker manages your booking process, existing client relationships, and operations. Many businesses use both — Treatwell for discovery and Inboker for everything else.',
      },
      {
        question: 'How much does Treatwell charge in commission?',
        answer:
          'Treatwell charges commission on bookings made through their platform. Rates vary but can be 20–30% or more. Inboker charges a flat monthly subscription with zero commission on any booking.',
      },
    ],
    metaTitle: 'Inboker vs Treatwell — Booking System vs Marketplace | Inboker',
    metaDescription:
      'Inboker vs Treatwell: booking system vs marketplace. Compare commission costs, features, and which is right for salons and beauty businesses.',
  },

  'square-appointments': {
    slug: 'square-appointments',
    name: 'Square Appointments',
    headline: 'Inboker vs Square Appointments — feature comparison',
    subheadline: 'Both handle bookings and payments. Here\'s where they differ for service businesses.',
    intro:
      'Square Appointments is part of the broader Square ecosystem — payments first, scheduling second. Inboker is scheduling-first, with deeper appointment management features including AI scheduling, SMS reminders, digital intake forms, and a full CRM built in.',
    comparisonTable: [
      { feature: 'SMS reminders', inboker: true, competitor: 'Paid plan only' },
      { feature: 'Digital intake forms', inboker: true, competitor: 'Limited' },
      { feature: 'Built-in CRM', inboker: true, competitor: 'Basic' },
      { feature: 'AI scheduling', inboker: true, competitor: false },
      { feature: 'White-label branding', inboker: true, competitor: 'Limited' },
      { feature: 'Multi-staff scheduling', inboker: true, competitor: true },
      { feature: 'Payment processing', inboker: 'Via Stripe', competitor: 'Via Square (Square rates)' },
      { feature: 'Hardware required', inboker: false, competitor: 'For in-person payments' },
      { feature: 'Free plan', inboker: '14-day trial', competitor: true },
      { feature: 'Starting price', inboker: '£29/mo', competitor: '$29/mo (Plus)' },
    ],
    inbokerAdvantages: [
      'AI-powered scheduling included — no equivalent in Square Appointments',
      'SMS reminders included in all plans',
      'More powerful intake forms and client profiling',
      'No hardware dependency — works fully browser-based',
      'UK-focused with GBP pricing',
    ],
    faqs: [
      {
        question: 'Is Inboker better than Square Appointments for UK businesses?',
        answer:
          'For UK-based service businesses, Inboker offers GBP pricing, UK-focused support, and deeper appointment management features. Square Appointments is USD-priced and more hardware-centric, designed around Square\'s payment ecosystem.',
      },
      {
        question: 'Does Inboker integrate with Stripe like Square integrates with Square payments?',
        answer:
          'Yes. Inboker uses Stripe for all payment processing — the most widely used payment processor globally, with competitive rates and no hardware required.',
      },
    ],
    metaTitle: 'Inboker vs Square Appointments — Comparison | Inboker',
    metaDescription:
      'Inboker vs Square Appointments: compare features, pricing, SMS reminders, and intake forms. Which is better for your service business?',
  },

  setmore: {
    slug: 'setmore',
    name: 'Setmore',
    headline: 'Inboker vs Setmore — which booking app is better?',
    subheadline: 'Setmore offers a free tier. Inboker offers more powerful tools for growing service businesses.',
    intro:
      'Setmore is a widely used scheduling tool with a generous free plan. Inboker is built for businesses that are serious about reducing no-shows, managing staff, and growing revenue — with AI scheduling, SMS reminders, and client CRM included from day one.',
    comparisonTable: [
      { feature: 'Free plan', inboker: '14-day trial, all features', competitor: true },
      { feature: 'SMS reminders', inboker: true, competitor: 'Paid plan' },
      { feature: 'AI scheduling', inboker: true, competitor: false },
      { feature: 'Digital intake forms', inboker: true, competitor: 'Limited' },
      { feature: 'Built-in CRM', inboker: true, competitor: 'Basic' },
      { feature: 'White-label branding', inboker: true, competitor: false },
      { feature: 'Stripe payments', inboker: true, competitor: true },
      { feature: 'Multi-staff scheduling', inboker: true, competitor: true },
      { feature: 'Waitlist management', inboker: true, competitor: false },
      { feature: 'Starting price (paid)', inboker: '£29/mo', competitor: '$12/mo' },
    ],
    inbokerAdvantages: [
      'AI scheduling optimisation built in',
      'SMS reminders included (not a paid add-on)',
      'Full client CRM with booking history and preferences',
      'White-label branding on all paid plans',
      'Waitlist management',
      'More powerful intake forms',
    ],
    faqs: [
      {
        question: 'Does Inboker have a free plan like Setmore?',
        answer:
          'Inboker offers a 14-day free trial with access to all features — no credit card required. We do not offer a permanent free tier because Inboker includes significantly more powerful features than Setmore\'s free plan.',
      },
      {
        question: 'What does Inboker do that Setmore cannot?',
        answer:
          'AI-powered scheduling, SMS reminders included from the base plan, a full built-in CRM, white-label branding, and waitlist management are key features Inboker offers that Setmore does not match.',
      },
    ],
    metaTitle: 'Inboker vs Setmore — Booking App Comparison | Inboker',
    metaDescription:
      'Inboker vs Setmore: compare features, SMS reminders, AI scheduling, and pricing. Which appointment booking app is right for your service business?',
  },

  booksy: {
    slug: 'booksy',
    name: 'Booksy',
    headline: 'Inboker vs Booksy — booking software comparison',
    subheadline: 'Both serve salons and service businesses. Here\'s the honest feature-by-feature breakdown.',
    intro:
      'Booksy is a popular booking platform for beauty and wellness businesses with a consumer marketplace. Inboker focuses on giving you a powerful, white-label booking system for your own brand — with AI scheduling and deeper client management tools.',
    comparisonTable: [
      { feature: 'Consumer marketplace', inboker: false, competitor: true },
      { feature: 'White-label branding', inboker: true, competitor: 'Limited' },
      { feature: 'AI scheduling', inboker: true, competitor: false },
      { feature: 'SMS reminders', inboker: true, competitor: true },
      { feature: 'Digital intake forms', inboker: true, competitor: 'Limited' },
      { feature: 'Built-in CRM', inboker: true, competitor: 'Basic' },
      { feature: 'Marketplace commission', inboker: false, competitor: 'Yes (marketplace clients)' },
      { feature: 'Multi-staff scheduling', inboker: true, competitor: true },
      { feature: 'Deposit collection', inboker: true, competitor: true },
      { feature: 'Starting price', inboker: '£29/mo', competitor: '$29.99/mo' },
    ],
    inbokerAdvantages: [
      'AI-powered scheduling optimisation not available on Booksy',
      'True white-label — your brand, not Booksy\'s',
      'No marketplace dependency — own your client relationships',
      'More comprehensive client CRM',
      'UK-based pricing in GBP',
    ],
    faqs: [
      {
        question: 'Is Inboker better than Booksy for independent salons?',
        answer:
          'For independent salons that want to own their brand and client relationships, Inboker offers stronger white-label tools, AI scheduling, and a more comprehensive CRM. Booksy\'s marketplace can help new client discovery but at the cost of brand independence.',
      },
      {
        question: 'Does Inboker help me get new clients without Booksy\'s marketplace?',
        answer:
          'Inboker provides a shareable booking link for Instagram, Google Business Profile, your website, and QR codes. Combined with SMS rebooking reminders, most businesses grow their client base without a third-party marketplace.',
      },
    ],
    metaTitle: 'Inboker vs Booksy — Booking Software Comparison | Inboker',
    metaDescription:
      'Inboker vs Booksy: compare features, pricing, white-label branding, and AI scheduling. Which is better for salons and beauty businesses?',
  },
};

export function getCompetitorData(slug: string): CompetitorData | null {
  return competitorData[slug] ?? null;
}

export function getAllCompetitorSlugs(): string[] {
  return Object.keys(competitorData);
}
