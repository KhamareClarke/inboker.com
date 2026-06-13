import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/lib/providers/auth-provider';
import { WorkspaceProvider } from '@/lib/providers/workspace-provider';
import { Toaster } from '@/components/ui/toaster';
import { ConditionalLayout } from '@/components/layout/conditional-layout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Inboker: AI-Powered Booking Engine for Appointment Businesses',
    template: '%s | Inboker',
  },
  description:
    'The white-label booking platform for clinics, salons, barbers, and freelancers. AI scheduling, SMS reminders, multi-staff support, and client CRM. Launch in 5 minutes.',
  keywords: [
    'booking software',
    'appointment scheduling',
    'online booking system',
    'salon booking software',
    'clinic booking system',
    'barbershop appointment app',
    'AI scheduling',
    'no-show reduction',
    'white-label booking',
  ],
  authors: [{ name: 'Inboker', url: siteUrl }],
  creator: 'Inboker',
  publisher: 'Inboker',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: siteUrl,
    siteName: 'Inboker',
    title: 'Inboker: AI-Powered Booking Engine',
    description:
      'Fill your calendar on autopilot. AI scheduling, SMS reminders, and client management for clinics, salons, barbers, and freelancers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Inboker: AI-Powered Booking Engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@inboker',
    creator: '@inboker',
    title: 'Inboker: AI-Powered Booking Engine',
    description:
      'Fill your calendar on autopilot. AI scheduling, SMS reminders, and client management for appointment businesses.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body className={`${inter.variable} ${display.variable} font-sans antialiased`}>
        <AuthProvider>
          <WorkspaceProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster />
          </WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
