import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inboker.com';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Inboker Terms of Service. Read our terms for using the Inboker booking platform.',
  alternates: { canonical: `${siteUrl}/terms` },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20">
      <div className="mb-12">
        <p className="text-[13px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Legal</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500">Last updated: January 2025</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">1. Acceptance of terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using the Inboker platform (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms constitute a binding legal agreement between you and Inboker.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">2. Description of service</h2>
          <p className="text-gray-600 leading-relaxed">
            Inboker provides an AI-powered online booking and appointment management platform for businesses. Features include scheduling, staff management, client communications, payment processing, and analytics.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">3. Account responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must provide accurate and complete information when registering.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must not share your account with others or allow unauthorised access.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">4. Acceptable use</h2>
          <p className="text-gray-600 leading-relaxed mb-3">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorised access to any part of the Service</li>
            <li>Transmit spam, viruses, or malicious code</li>
            <li>Impersonate another person or business</li>
            <li>Scrape or harvest data from the platform without authorisation</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">5. Payments and billing</h2>
          <p className="text-gray-600 leading-relaxed">
            Paid plans are billed monthly in advance. All fees are in GBP and inclusive of applicable taxes. Subscriptions renew automatically unless cancelled before the renewal date. We offer a 14-day free trial with no credit card required. After the trial, you must provide payment details to continue using paid features.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">6. Limitation of liability</h2>
          <p className="text-gray-600 leading-relaxed">
            To the maximum extent permitted by law, Inboker shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability to you for any claims arising from these terms or your use of the Service shall not exceed the amounts paid by you in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">7. Termination</h2>
          <p className="text-gray-600 leading-relaxed">
            You may cancel your account at any time through your account settings. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, your data is retained for 30 days before deletion.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">8. Governing law</h2>
          <p className="text-gray-600 leading-relaxed">
            These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            For questions about these terms, contact us at <a href="mailto:legal@inboker.com" className="text-blue-600 hover:underline">legal@inboker.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
