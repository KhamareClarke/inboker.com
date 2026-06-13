import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight, Star } from 'lucide-react';
import { getIndustryData, getAllIndustrySlugs } from './industry-data';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/json-ld';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export function generateStaticParams() {
  return getAllIndustrySlugs().map((slug) => ({ industry: slug }));
}

export function generateMetadata({
  params,
}: {
  params: { industry: string };
}): Metadata {
  const data = getIndustryData(params.industry);
  if (!data) return {};

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: `${siteUrl}/for/${data.slug}` },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      type: 'website',
      url: `${siteUrl}/for/${data.slug}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
    },
  };
}

export default function IndustryPage({ params }: { params: { industry: string } }) {
  const data = getIndustryData(params.industry);
  if (!data) notFound();

  return (
    <>
      <FAQSchema faqs={data.faqs} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Industries', url: `${siteUrl}/for` },
          { name: data.name, url: `${siteUrl}/for/${data.slug}` },
        ]}
      />

      <div className="flex flex-col">
        {/* HERO */}
        <section className="relative bg-gradient-to-br from-blue-900 via-[#1a2d6b] to-indigo-900 overflow-hidden -mt-[68px]">
          <div className="absolute inset-0 hero-grid" />
          <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.22),transparent)]" />
          <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-cyan-400/25 rounded-full blur-[80px]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[70px]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 pt-[148px] sm:pt-[180px] pb-16 sm:pb-20">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[13px] text-white/30 mb-8" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white/50">{data.name}</span>
            </nav>

            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/[0.15] border border-blue-400/20 text-[13px] font-medium text-blue-400 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Built specifically for {data.name.toLowerCase()}
              </div>

              <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-tight tracking-tight text-white mb-5">
                {data.headline}
              </h1>

              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
                {data.subheadline}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[15px] font-semibold h-12 px-7 rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
                >
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-white/20 text-white/80 hover:border-white/40 hover:text-white text-[15px] font-semibold h-12 px-7 rounded-xl transition-colors"
                >
                  Book a demo
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 text-[13px] text-white/35">
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" />14-day free trial</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" />No credit card required</span>
                <span className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" />Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {data.stats.map((stat, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-7 text-center">
                  <div className="font-display text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-tight text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <p className="text-[13px] text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PAIN POINTS */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold tracking-tight text-gray-900 mb-4">
                Sound familiar?
              </h2>
              <p className="text-lg text-gray-500">
                These are the scheduling headaches that cost {data.name.toLowerCase()} time and money every week.
              </p>
            </div>
            <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-4">
              {data.painPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-5">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-500 text-[11px] font-bold">✕</span>
                  </div>
                  <p className="text-[14px] text-gray-700 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-blue-50/20 to-white">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="text-center mb-12">
              <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Features</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold tracking-tight text-gray-900 mb-4">
                Everything {data.name.toLowerCase()} need, built in
              </h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                {data.description}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.features.map((feature, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-7 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[15px] font-semibold h-12 px-7 rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
              >
                Try all features free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-900 via-[#1a2d6b] to-indigo-900 border border-white/[0.06] rounded-3xl p-10 sm:p-14 text-center">
              <div className="flex gap-1 justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="font-display text-lg sm:text-xl text-white/80 leading-relaxed mb-8">
                &ldquo;{data.testimonial.quote}&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold text-white">{data.testimonial.author}</p>
                <p className="text-white/40 text-[14px]">{data.testimonial.role}, {data.testimonial.business}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-50/60">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold tracking-tight text-gray-900 mb-4">
                Frequently asked questions
              </h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {data.faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 p-7 transition-all">
                  <h3 className="text-[15px] font-bold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RELATED INDUSTRIES */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Inboker also works for:</h2>
            <div className="flex flex-wrap gap-3">
              {data.relatedIndustries.map((related) => (
                <Link
                  key={related.slug}
                  href={`/for/${related.slug}`}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  {related.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="bg-gradient-to-br from-blue-900 via-[#1a2d6b] to-indigo-900 border border-white/[0.06] rounded-3xl px-8 py-16 sm:px-16 sm:py-20 text-center">
              <p className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest mb-4">14-day free trial</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-white mb-4">
                Ready to fill your {data.name.toLowerCase()} calendar?
              </h2>
              <p className="text-lg text-white/45 mb-10 leading-relaxed max-w-xl mx-auto">
                Join thousands of {data.name.toLowerCase()} already using Inboker. Start your 14-day free trial. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[15px] font-semibold h-12 px-7 rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
                >
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-white/[0.12] text-white/70 hover:border-white/25 hover:text-white text-[15px] font-semibold h-12 px-7 rounded-xl transition-colors"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
