import Link from 'next/link';
import { Calendar, ArrowRight, Check, Shield, Globe } from 'lucide-react';

const cols = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'For Salons', href: '/for/salons' },
      { label: 'For Clinics', href: '/for/clinics' },
      { label: 'For Personal Trainers', href: '/for/personal-trainers' },
    ],
  },
  {
    heading: 'Compare',
    links: [
      { label: 'vs Calendly', href: '/vs/calendly' },
      { label: 'vs Acuity Scheduling', href: '/vs/acuity-scheduling' },
      { label: 'vs Fresha', href: '/vs/fresha' },
      { label: 'vs Booksy', href: '/vs/booksy' },
      { label: 'vs Setmore', href: '/vs/setmore' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

const socialLinks = [
  {
    label: 'X (Twitter)',
    href: 'https://twitter.com/inboker',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/inboker',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
  },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#09092c] text-white">

      {/* ── Top CTA bar ── */}
      <div className="border-b border-white/[0.07]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-display text-[1.35rem] font-bold text-white mb-2">
              Ready to fill your calendar?
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {['14-day free trial', 'No credit card', 'Live in 5 minutes'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[13px] text-white/55">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[14px] h-11 px-6 rounded-xl transition-colors shrink-0 shadow-lg shadow-blue-600/20"
          >
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Main footer body ── */}
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 group-hover:bg-blue-500 transition-colors">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-[16px] font-bold text-white">Inboker</span>
            </Link>

            <p className="text-[13px] text-white/60 leading-relaxed mb-6 max-w-[220px]">
              AI-powered booking for UK clinics, salons, and appointment businesses. Set up in minutes.
            </p>

            {/* Trust badges */}
            <div className="flex flex-col gap-2 mb-6">
              {[
                { icon: Shield, label: 'GDPR compliant' },
                { icon: Globe, label: 'UK-based support' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-[12px] text-white/45">
                  <Icon className="h-3.5 w-3.5 text-white/30 shrink-0" />
                  {label}
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-white/[0.07] hover:bg-white/[0.14] flex items-center justify-center text-white/50 hover:text-white transition-all"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.14em] mb-5">
                {col.heading}
              </h4>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/65 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/[0.07]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/40">
            &copy; {currentYear} Inboker Ltd. All rights reserved. Registered in England &amp; Wales.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Terms</Link>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[12px] text-white/40">All systems operational</p>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
