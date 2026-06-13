import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight, MapPin, Star } from 'lucide-react';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/json-ld';
import { getIndustryData } from '../industry-data';
import { getCityData, cityIndustryCombinations } from './city-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export function generateStaticParams() {
  return cityIndustryCombinations;
}

export function generateMetadata({
  params,
}: {
  params: { industry: string; city: string };
}): Metadata {
  const industry = getIndustryData(params.industry);
  const city = getCityData(params.city);
  if (!industry || !city) return {};

  const title = `Booking Software for ${industry.name} in ${city.name} | Inboker`;
  const description = `The best online booking system for ${industry.name.toLowerCase()} in ${city.name}. AI scheduling, SMS reminders, and no-show reduction built for ${city.name} businesses. 14-day free trial.`;
  const url = `${siteUrl}/for/${industry.slug}/${city.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function CityIndustryPage({
  params,
}: {
  params: { industry: string; city: string };
}) {
  const industry = getIndustryData(params.industry);
  const city = getCityData(params.city);
  if (!industry || !city) notFound();

  const url = `${siteUrl}/for/${industry.slug}/${city.slug}`;

  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: industry.name, url: `${siteUrl}/for/${industry.slug}` },
    { name: city.name, url },
  ];

  const cityFaqs = [
    {
      question: `Is Inboker available for ${industry.name.toLowerCase()} in ${city.name}?`,
      answer: `Yes. Inboker is a cloud-based booking platform available to any ${industry.name.toLowerCase()} in ${city.name} or anywhere in the UK. Setup takes under 5 minutes and you can start taking online bookings the same day.`,
    },
    {
      question: `How much does booking software cost for ${industry.name.toLowerCase()} in ${city.name}?`,
      answer: `Inboker starts at £29/month for solo practitioners and £69/month for growing teams. There are no setup fees, no contracts, and a 14-day free trial with no credit card required. Most ${city.name} businesses are live within an hour.`,
    },
    ...industry.faqs.slice(0, 3),
  ];

  return (
    <>
      <FAQSchema faqs={cityFaqs} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <div className="bg-[#070c18]">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-20">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[13px] text-white/30 mb-6 flex-wrap">
              <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
              <span>/</span>
              <Link href={`/for/${industry.slug}`} className="hover:text-white/60 transition-colors">{industry.name}</Link>
              <span>/</span>
              <span className="text-white/50 font-medium">{city.name}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest">
                  {city.name}, {city.region}
                </span>
              </div>

              <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold tracking-tight text-white leading-tight mb-5">
                Booking software for {industry.name.toLowerCase()} in {city.name}
              </h1>

              <p className="text-xl text-white/55 leading-relaxed mb-4 max-w-2xl">
                {industry.description.replace('across the UK', `in ${city.name}`)}
              </p>

              <p className="text-base text-white/35 leading-relaxed mb-8 max-w-2xl">
                {city.context}
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://app.inboker.com/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Start free trial. No credit card.
                  <ArrowRight className="h-4 w-4" />
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

        {/* City market stats */}
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-8">
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4 text-sm text-gray-500">
              <div>
                <span className="font-bold text-gray-900">{city.population}</span>
                <span className="ml-1.5">people in {city.name}</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{city.marketSize}</span>
                <span className="ml-1.5">in {city.region}</span>
              </div>
              {industry.stats.map((s) => (
                <div key={s.label}>
                  <span className="font-bold text-blue-600">{s.value}</span>
                  <span className="ml-1.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Pain points */}
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                What {industry.name.toLowerCase()} in {city.name} struggle with
              </h2>
              <div className="space-y-3">
                {industry.painPoints.map((p) => (
                  <div key={p} className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-400 font-bold text-xs">✕</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                What Inboker gives {city.name} {industry.name.toLowerCase()}
              </h2>
              <div className="space-y-4">
                {industry.features.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                      <Check className="h-3 w-3 text-emerald-500" />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                      <p className="text-gray-500 text-sm">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-16 rounded-2xl bg-[#070c18] border border-white/[0.06] p-8 sm:p-10 text-white">
            <div className="flex gap-0.5 mb-5">
              {[1,2,3,4,5].map((s) => <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
            </div>
            <blockquote className="font-display text-lg sm:text-xl font-semibold leading-relaxed mb-6 max-w-2xl text-white/85">
              "{industry.testimonial.quote}"
            </blockquote>
            <div>
              <p className="font-semibold text-white">{industry.testimonial.author}</p>
              <p className="text-white/40 text-sm">{industry.testimonial.role}, {industry.testimonial.business}</p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {cityFaqs.map((faq) => (
                <div key={faq.question} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">{faq.question}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related cities */}
          <div className="mt-14 pt-10 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {industry.name} booking software by city
            </h3>
            <div className="flex flex-wrap gap-2">
              {cityIndustryCombinations
                .filter((c) => c.industry === params.industry && c.city !== params.city)
                .map((c) => (
                  <Link
                    key={c.city}
                    href={`/for/${c.industry}/${c.city}`}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    {getCityData(c.city)?.name ?? c.city}
                  </Link>
                ))}
              <Link
                href={`/for/${industry.slug}`}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                All {industry.name} →
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#070c18]">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-14 sm:py-16 text-center">
            <p className="text-[13px] font-semibold text-blue-400 uppercase tracking-widest mb-4">14-day free trial</p>
            <h2 className="font-display text-2xl font-extrabold text-white mb-3">
              Start taking bookings in {city.name} today
            </h2>
            <p className="text-white/45 mb-7 max-w-lg mx-auto text-sm leading-relaxed">
              14-day free trial. No credit card. Live in under 5 minutes.
            </p>
            <a
              href="https://app.inboker.com/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3 text-sm transition-colors shadow-lg shadow-blue-600/20"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

      </div>
    </>
  );
}
