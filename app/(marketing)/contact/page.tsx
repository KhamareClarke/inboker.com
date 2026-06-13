import type { Metadata } from 'next';
import { Mail, MessageSquare, Clock, BookOpen } from 'lucide-react';
import { BreadcrumbSchema } from '@/components/seo/json-ld';
import { ContactForm } from './contact-form';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export const metadata: Metadata = {
  title: 'Contact Us | Inboker',
  description:
    'Get in touch with the Inboker team. Whether you have a question about pricing, features, or need help getting started, we respond within one business day.',
  alternates: { canonical: `${siteUrl}/contact` },
  openGraph: {
    title: 'Contact Inboker',
    description: 'Reach the Inboker team. We respond within one business day.',
    url: `${siteUrl}/contact`,
    type: 'website',
  },
};

const channels = [
  {
    icon: Mail,
    title: 'Email support',
    description: 'hello@inboker.com',
    sub: 'For general enquiries and support',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'Live chat',
    description: 'Available in the app',
    sub: "Fastest way to reach us when you're logged in",
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Clock,
    title: 'Response time',
    description: 'Within 1 business day',
    sub: 'Mon – Fri, 9 am – 6 pm GMT',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: BookOpen,
    title: 'Help centre',
    description: 'Self-serve docs',
    sub: 'Step-by-step guides and video walkthroughs',
    color: 'bg-amber-50 text-amber-600',
  },
];

export default function ContactPage() {
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Contact', url: `${siteUrl}/contact` },
  ];

  return (
    <>
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
            <p className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest mb-4">
              Contact us
            </p>
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold tracking-tight text-white leading-tight mb-5">
              Let's talk
            </h1>
            <p className="text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
              Questions about pricing, features, or getting started? Drop us a message and we'll get back to you within one business day.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-14 sm:py-20">
          <div className="grid lg:grid-cols-[1fr_420px] gap-12 xl:gap-20">

            {/* Left: form */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] p-7 sm:p-10">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Send us a message</h2>
                <p className="text-sm text-gray-500 mb-7">We'll reply to your email within one business day.</p>
                <ContactForm />
              </div>
            </div>

            {/* Right: info */}
            <div className="space-y-6">
              {/* Contact channels */}
              <div className="space-y-4">
                {channels.map((c) => (
                  <div
                    key={c.title}
                    className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                        {c.title}
                      </p>
                      <p className="font-semibold text-gray-900 text-sm">{c.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ teaser */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-[#1a2d6b] to-indigo-900 border border-white/[0.06] p-7 text-white">
                <h3 className="font-display font-bold text-base mb-1 text-white">Already have an account?</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-4">
                  Use the in-app chat for the fastest support. Our team can access your account details and resolve issues in real time.
                </p>
                <a
                  href="https://app.inboker.com/login"
                  className="inline-block rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 text-sm transition-colors"
                >
                  Sign in to the app
                </a>
              </div>

              {/* Social */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Follow us</p>
                <div className="flex gap-3">
                  <a
                    href="https://twitter.com/inboker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center rounded-xl border border-gray-100 py-2.5 text-sm font-medium text-gray-600 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    Twitter / X
                  </a>
                  <a
                    href="https://linkedin.com/company/inboker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center rounded-xl border border-gray-100 py-2.5 text-sm font-medium text-gray-600 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
