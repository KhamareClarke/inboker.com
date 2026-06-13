import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, X, ArrowRight, Minus } from 'lucide-react';
import { getCompetitorData, getAllCompetitorSlugs } from './competitor-data';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/json-ld';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export function generateStaticParams() {
  return getAllCompetitorSlugs().map((slug) => ({ competitor: slug }));
}

export function generateMetadata({
  params,
}: {
  params: { competitor: string };
}): Metadata {
  const data = getCompetitorData(params.competitor);
  if (!data) return {};

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: `${siteUrl}/vs/${data.slug}` },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      type: 'website',
      url: `${siteUrl}/vs/${data.slug}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
    },
  };
}

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="h-5 w-5 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="h-5 w-5 text-red-400 mx-auto" />;
  return <span className="text-[13px] text-gray-600 text-center block">{value}</span>;
}

export default function ComparisonPage({ params }: { params: { competitor: string } }) {
  const data = getCompetitorData(params.competitor);
  if (!data) notFound();

  return (
    <>
      <FAQSchema faqs={data.faqs} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Comparisons', url: `${siteUrl}/vs` },
          { name: `Inboker vs ${data.name}`, url: `${siteUrl}/vs/${data.slug}` },
        ]}
      />

      <div className="flex flex-col">
        {/* HERO */}
        <section className="bg-[#070c18] pt-16 pb-16 sm:pt-24 sm:pb-24">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <nav className="flex items-center gap-2 text-[13px] text-white/30 mb-8" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white/50">Inboker vs {data.name}</span>
            </nav>

            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight text-white mb-6">
                {data.headline}
              </h1>
              <p className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
                {data.subheadline}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[15px] font-semibold h-12 px-7 rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
                >
                  Try Inboker free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="max-w-3xl mx-auto">
              <p className="text-[16px] text-gray-600 leading-relaxed">{data.intro}</p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold tracking-tight text-gray-900 mb-4">
                Inboker vs {data.name}: feature comparison
              </h2>
            </div>

            <div className="max-w-4xl mx-auto overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-[13px] font-semibold text-gray-500 uppercase tracking-wider w-1/2">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-4 py-1.5 bg-blue-600 rounded-lg">
                        <span className="text-white text-[14px] font-bold">Inboker</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <span className="text-[14px] font-semibold text-gray-600">{data.name}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.comparisonTable.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-6 py-4 text-[14px] text-gray-700 font-medium">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        <FeatureCell value={row.inboker} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <FeatureCell value={row.competitor} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* INBOKER ADVANTAGES */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold tracking-tight text-gray-900 mb-8">
                Why businesses choose Inboker over {data.name}
              </h2>
              <div className="space-y-4">
                {data.inbokerAdvantages.map((advantage, i) => (
                  <div key={i} className="flex items-start gap-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed">{advantage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white">
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

        {/* CTA */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="bg-[#070c18] rounded-3xl px-8 py-16 sm:px-16 sm:py-20 text-center border border-white/[0.06]">
              <p className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest mb-4">14-day free trial</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-white mb-4">
                Try Inboker free for 14 days
              </h2>
              <p className="text-lg text-white/45 mb-10 max-w-xl mx-auto leading-relaxed">
                See why businesses switch from {data.name} to Inboker. No credit card required.
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
                  Talk to sales
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
