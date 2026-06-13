import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/integrations`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
  ];

  // Author pages
  const authorPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog/authors/inboker-team`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // City × industry pages
  const cityPages: MetadataRoute.Sitemap = [
    { industry: 'salons', city: 'london' },
    { industry: 'salons', city: 'manchester' },
    { industry: 'salons', city: 'birmingham' },
    { industry: 'clinics', city: 'london' },
    { industry: 'clinics', city: 'manchester' },
    { industry: 'clinics', city: 'birmingham' },
    { industry: 'personal-trainers', city: 'london' },
    { industry: 'personal-trainers', city: 'manchester' },
    { industry: 'personal-trainers', city: 'birmingham' },
    { industry: 'barbershops', city: 'london' },
  ].map(({ industry, city }) => ({
    url: `${baseUrl}/for/${industry}/${city}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // Blog article pages
  const blogPages: MetadataRoute.Sitemap = [
    'how-to-reduce-no-shows',
    'online-booking-for-salons',
    'ai-scheduling-explained',
    'intake-forms-for-clinics',
    'booking-software-comparison',
    'white-label-booking-page',
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Programmatic industry landing pages
  const industryPages: MetadataRoute.Sitemap = [
    'salons',
    'barbershops',
    'clinics',
    'physiotherapy',
    'dental',
    'wellness',
    'personal-trainers',
    'yoga-studios',
    'pilates',
    'consultants',
    'lawyers',
    'accountants',
    'aesthetics',
    'nail-studios',
    'sports-coaching',
  ].map((industry) => ({
    url: `${baseUrl}/for/${industry}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Programmatic comparison pages
  const comparisonPages: MetadataRoute.Sitemap = [
    'calendly',
    'acuity-scheduling',
    'fresha',
    'treatwell',
    'square-appointments',
    'setmore',
    'booksy',
  ].map((competitor) => ({
    url: `${baseUrl}/vs/${competitor}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [...staticPages, ...authorPages, ...cityPages, ...blogPages, ...industryPages, ...comparisonPages];
}
