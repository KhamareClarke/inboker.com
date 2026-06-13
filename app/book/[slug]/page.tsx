import type { Metadata } from 'next';
import BookingClient from './booking-client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const businessName = params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `Book an appointment at ${businessName}`,
    description: `Book your appointment online with ${businessName}. Choose your preferred team member, date, and time. Instant confirmation.`,
    robots: { index: false, follow: false },
  };
}

export default function PublicBookingPage() {
  return <BookingClient />;
}
