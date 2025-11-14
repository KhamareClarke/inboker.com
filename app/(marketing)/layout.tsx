import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';
import { CookieBanner } from '@/components/site/cookie-banner';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      <CookieBanner />
    </>
  );
}
