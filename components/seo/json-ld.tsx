const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'Inboker',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
      width: 512,
      height: 512,
    },
    description:
      'AI-powered booking engine for appointment-based businesses including clinics, salons, barbershops, and freelancers.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/inboker',
      'https://linkedin.com/company/inboker',
      'https://instagram.com/inboker',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${siteUrl}/contact`,
      availableLanguage: 'English',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl}/#software`,
    name: 'Inboker',
    url: siteUrl,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Appointment Scheduling Software',
    operatingSystem: 'Web, iOS, Android',
    description:
      'Inboker is an AI-powered booking engine that fills your calendar and reduces no-shows. Features include smart scheduling, SMS reminders, multi-staff management, intake forms, and a built-in CRM.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '29',
        priceCurrency: 'GBP',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '29',
          priceCurrency: 'GBP',
          billingDuration: 'P1M',
        },
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '69',
        priceCurrency: 'GBP',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '69',
          priceCurrency: 'GBP',
          billingDuration: 'P1M',
        },
      },
      {
        '@type': 'Offer',
        name: 'Business',
        price: '149',
        priceCurrency: 'GBP',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '149',
          priceCurrency: 'GBP',
          billingDuration: 'P1M',
        },
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '312',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'AI-powered scheduling',
      'Automated SMS and email reminders',
      'Multi-staff management',
      'Digital intake forms with e-signatures',
      'Built-in CRM and client history',
      'White-label branding',
      'Stripe payment processing',
      'Real-time availability calendar',
      'No-show reduction',
      'Custom booking page',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

export function FAQSchema({ faqs }: { faqs: FaqItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ReviewSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Inboker',
    description: 'AI-powered booking engine for appointment-based businesses.',
    url: siteUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '312',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Aisha R.' },
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody:
          'Switching to Inboker cut our no-shows nearly in half. Clients rebook themselves and our front desk finally breathes.',
        datePublished: '2025-11-01',
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Marco P.' },
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody:
          'The WhatsApp link converts like crazy. Bookings straight from the bio. Game changer for us.',
        datePublished: '2025-10-15',
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'James K.' },
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody:
          'Multi-staff scheduling was a nightmare before Inboker. Now everyone sees their shifts and we are fully booked.',
        datePublished: '2025-09-20',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  url: string;
  image?: string;
  authorName?: string;
  category?: string;
}

export function ArticleSchema({
  headline,
  description,
  datePublished,
  dateModified,
  url,
  image,
  authorName = 'Inboker Editorial Team',
  category,
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url,
    headline,
    description,
    url,
    datePublished,
    dateModified,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: image
      ? { '@type': 'ImageObject', url: image, width: 1200, height: 630 }
      : { '@type': 'ImageObject', url: `${siteUrl}/og-image.png`, width: 1200, height: 630 },
    author: {
      '@type': 'Person',
      name: authorName,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Inboker',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    ...(category ? { articleSection: category } : {}),
    inLanguage: 'en-GB',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface HowToStep {
  name: string;
  text: string;
}

export function HowToSchema({ name, description, steps }: { name: string; description: string; steps: HowToStep[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
