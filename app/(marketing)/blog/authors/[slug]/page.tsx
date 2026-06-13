import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Twitter, Linkedin, ArrowRight, BookOpen } from 'lucide-react';
import { BreadcrumbSchema } from '@/components/seo/json-ld';
import { getAuthor, getAllAuthorSlugs } from '../author-data';
import { getAllArticles } from '../../[slug]/article-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export function generateStaticParams() {
  return getAllAuthorSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const author = getAuthor(params.slug);
  if (!author) return { title: 'Author Not Found' };

  const url = `${siteUrl}/blog/authors/${author.slug}`;
  return {
    title: `${author.name}: ${author.role} | Inboker Blog`,
    description: author.bio,
    alternates: { canonical: url },
    openGraph: {
      title: `${author.name} | Inboker Blog`,
      description: author.bio,
      url,
      type: 'profile',
    },
  };
}

export default function AuthorPage({ params }: { params: { slug: string } }) {
  const author = getAuthor(params.slug);
  if (!author) notFound();

  const authorUrl = `${siteUrl}/blog/authors/${author.slug}`;
  const allArticles = getAllArticles();
  const authorArticles = allArticles.filter((a) => author.articleSlugs.includes(a.slug));

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': authorUrl,
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    url: authorUrl,
    worksFor: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Inboker',
    },
    ...(author.twitter ? { sameAs: [author.twitter, author.linkedin].filter(Boolean) } : {}),
    knowsAbout: author.expertise,
  };

  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Blog', url: `${siteUrl}/blog` },
    { name: author.name, url: authorUrl },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-14 sm:py-20">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-10 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">{author.name}</span>
          </nav>

          {/* Author header */}
          <div className="flex items-start gap-6 mb-10 pb-10 border-b border-gray-100">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-blue-500/20">
              {author.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{author.name}</h1>
              <p className="text-blue-600 font-semibold text-sm mb-3">{author.role}</p>
              <p className="text-gray-500 leading-relaxed text-sm mb-4">{author.bio}</p>
              <div className="flex gap-3">
                {author.twitter && (
                  <a
                    href={author.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    Twitter
                  </a>
                )}
                {author.linkedin && (
                  <a
                    href={author.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Expertise */}
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Writes about</h2>
            <div className="flex flex-wrap gap-2">
              {author.expertise.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Articles */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Articles by {author.name.split(' ')[0]}
            </h2>
            <div className="space-y-4">
              {authorArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
                        {article.category}
                      </span>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className="text-xs text-gray-400">{article.readTime}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
