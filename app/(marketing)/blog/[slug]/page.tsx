import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Clock, Tag, ChevronRight, AlertTriangle, Lightbulb, BarChart2, Quote } from 'lucide-react';
import { ArticleSchema, FAQSchema, BreadcrumbSchema } from '@/components/seo/json-ld';
import { getArticle, getAllArticleSlugs, getAllArticles, type ContentBlock } from './article-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getArticle(params.slug);
  if (!article) return { title: 'Article Not Found' };

  const url = `${siteUrl}/blog/${article.slug}`;
  const image = `${siteUrl}/og-image.png`;

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url,
      type: 'article',
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      authors: [article.author],
      section: article.category,
      tags: article.tags,
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
      images: [image],
    },
  };
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 key={index} className="text-2xl font-bold text-gray-900 mt-10 mb-4 leading-tight">
          {block.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={index} className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          {block.text}
        </h3>
      );
    case 'p':
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4">
          {block.text}
        </p>
      );
    case 'ul':
      return (
        <ul key={index} className="mb-4 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={index} className="mb-4 space-y-2 list-none">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-700">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      );
    case 'callout': {
      const variants = {
        tip: {
          bg: 'bg-blue-50 border-blue-200',
          icon: <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />,
          title: 'text-blue-800',
          text: 'text-blue-700',
        },
        stat: {
          bg: 'bg-emerald-50 border-emerald-200',
          icon: <BarChart2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />,
          title: 'text-emerald-800',
          text: 'text-emerald-700',
        },
        warning: {
          bg: 'bg-amber-50 border-amber-200',
          icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />,
          title: 'text-amber-800',
          text: 'text-amber-700',
        },
      };
      const v = variants[block.variant];
      return (
        <div key={index} className={`border rounded-xl p-4 mb-6 flex gap-3 ${v.bg}`}>
          {v.icon}
          <div>
            <p className={`font-semibold text-sm mb-1 ${v.title}`}>{block.title}</p>
            <p className={`text-sm leading-relaxed ${v.text}`}>{block.text}</p>
          </div>
        </div>
      );
    }
    case 'stat-row':
      return (
        <div key={index} className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
          {block.stats.map((stat, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <div key={index} className="overflow-x-auto my-6 rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-gray-700 border-b border-gray-100">
                      {typeof cell === 'boolean' ? (
                        cell ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">✓</span>
                        ) : (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-500 text-xs font-bold">✕</span>
                        )
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'quote':
      return (
        <blockquote key={index} className="relative my-8 pl-6 border-l-4 border-blue-500">
          <Quote className="absolute -top-1 -left-1 h-4 w-4 text-blue-300" />
          <p className="text-lg italic text-gray-700 leading-relaxed mb-3">{block.text}</p>
          <footer className="text-sm">
            <span className="font-semibold text-gray-900">{block.author}</span>
            {block.role && <span className="text-gray-500">, {block.role}</span>}
          </footer>
        </blockquote>
      );
    default:
      return null;
  }
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const url = `${siteUrl}/blog/${article.slug}`;
  const relatedArticles = getAllArticles().filter((a) => article.relatedSlugs.includes(a.slug));

  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Blog', url: `${siteUrl}/blog` },
    { name: article.title, url },
  ];

  return (
    <>
      <ArticleSchema
        headline={article.title}
        description={article.description}
        datePublished={article.datePublished}
        dateModified={article.dateModified}
        url={url}
        authorName={article.author}
        category={article.category}
      />
      <FAQSchema faqs={article.faqs} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-16">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-8 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-gray-600 font-medium truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Category */}
          <div className="mb-4">
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 leading-relaxed mb-6">{article.description}</p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-100 mb-8">
            <div className="flex items-center gap-1.5">
              <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="font-medium text-gray-700 text-xs leading-tight">Inboker Editorial Team</p>
                <p className="text-gray-400 text-xs">Inboker</p>
              </div>
            </div>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <time dateTime={article.datePublished}>{article.dateDisplay}</time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTime}
            </div>
            {article.dateModified !== article.datePublished && (
              <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">
                Updated <time dateTime={article.dateModified}>{article.dateModified}</time>
              </span>
            )}
          </div>

          {/* Article body */}
          <article className="prose-sm sm:prose max-w-none">
            {article.content.map((block, i) => renderBlock(block, i))}
          </article>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
              <Tag className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              {article.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* FAQ section */}
          {article.faqs.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
              <div className="space-y-4">
                {article.faqs.map((faq, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/50 p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">{faq.question}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Author bio */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-start gap-4 rounded-2xl bg-blue-50 border border-blue-100 p-5">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Inboker Editorial Team</p>
                <p className="text-xs text-blue-600 font-medium mb-1">Inboker</p>
                <p className="text-sm text-gray-500">
                  Inboker publishes practical guides on booking technology, no-show reduction, and growing appointment-based businesses in the UK.
                </p>
              </div>
            </div>
          </div>

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Related articles</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedArticles.slice(0, 4).map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group rounded-xl border border-gray-100 bg-white p-4 hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
                      {related.category}
                    </span>
                    <p className="mt-1 font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                      {related.title}
                    </p>
                    <p className="mt-1.5 text-xs text-gray-400">{related.readTime}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-[#070c18] border border-white/[0.06] p-8 text-center">
            <h2 className="font-display text-xl font-bold text-white mb-2">Ready to fill your calendar?</h2>
            <p className="text-white/45 text-sm mb-5">
              Inboker handles online booking, SMS reminders, and no-show reduction so you can focus on clients.
            </p>
            <a
              href="https://app.inboker.com/signup"
              className="inline-block rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 text-sm transition-colors"
            >
              Start free trial
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
