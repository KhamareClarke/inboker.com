export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  avatar: string; // initials fallback
  twitter?: string;
  linkedin?: string;
  articleSlugs: string[];
}

export const authors: Record<string, Author> = {
  'inboker-team': {
    slug: 'inboker-team',
    name: 'Inboker Editorial Team',
    role: 'Inboker',
    bio: 'The Inboker editorial team publishes practical guides on booking technology, no-show reduction, and growing appointment-based businesses across the UK.',
    expertise: [
      'Appointment scheduling software',
      'No-show reduction strategies',
      'AI in service businesses',
      'UK small business operations',
      'SaaS product development',
    ],
    avatar: 'IB',
    twitter: 'https://twitter.com/inboker',
    linkedin: 'https://linkedin.com/company/inboker',
    articleSlugs: [
      'how-to-reduce-no-shows',
      'online-booking-for-salons',
      'ai-scheduling-explained',
      'intake-forms-for-clinics',
      'booking-software-comparison',
      'white-label-booking-page',
    ],
  },
};

export function getAuthor(slug: string): Author | null {
  return authors[slug] ?? null;
}

export function getAllAuthorSlugs(): string[] {
  return Object.keys(authors);
}
