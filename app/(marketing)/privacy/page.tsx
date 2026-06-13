import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Inboker collects, uses, and protects your personal data. GDPR compliant. Your privacy is our priority.',
  alternates: { canonical: `${siteUrl}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20">
      <div className="mb-12">
        <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Legal</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500">Last updated: January 2025</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">1. Who we are</h2>
          <p className="text-gray-600 leading-relaxed">
            Inboker (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the Inboker booking platform at inboker.com. We are committed to protecting your personal data and complying with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">2. What data we collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li><strong>Account data:</strong> Name, email address, and password when you register.</li>
            <li><strong>Business data:</strong> Business name, logo, services, staff information, and booking history.</li>
            <li><strong>Client data:</strong> Names, email addresses, and phone numbers of your clients who book through your Inboker page.</li>
            <li><strong>Usage data:</strong> Pages visited, features used, and device information for product improvement.</li>
            <li><strong>Payment data:</strong> Billing details processed securely by Stripe. We never store card numbers.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">3. How we use your data</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>To provide and improve the Inboker platform</li>
            <li>To send booking confirmations and reminders on your behalf</li>
            <li>To process payments and manage your subscription</li>
            <li>To send product updates and transactional emails</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">4. Data retention</h2>
          <p className="text-gray-600 leading-relaxed">
            We retain your account data for as long as your account is active. If you close your account, we delete your data within 30 days, except where retention is required by law. You can request a full data export or deletion at any time via your account settings or by emailing privacy@inboker.com.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">5. Your rights</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Under UK GDPR, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing</li>
            <li>Data portability</li>
            <li>Lodge a complaint with the ICO (ico.org.uk)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            We use essential cookies for authentication and session management. We also use analytics cookies (with your consent) to understand how the platform is used. You can manage cookie preferences via our cookie banner.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">7. Contact us</h2>
          <p className="text-gray-600 leading-relaxed">
            For any privacy-related queries, contact us at <a href="mailto:privacy@inboker.com" className="text-blue-600 hover:underline">privacy@inboker.com</a> or through our <a href="/contact" className="text-blue-600 hover:underline">contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
