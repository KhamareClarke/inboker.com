import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Section as="footer" className="border-t border-gray-200 bg-white py-ds-6">
      <Container size="main">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-ds-4 lg:gap-ds-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-3 mb-ds-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-ds bg-blue-600">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 ds-heading-3">
                Inboker
              </span>
            </div>
            <p className="ds-body-sm text-gray-600 mb-ds-4 max-w-xs">
              The comprehensive booking platform for appointment-based businesses
            </p>
            <div className="flex items-center gap-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-ds-2 text-sm text-gray-900 ds-heading-3">Product</h4>
            <ul className="space-y-ds-1 ds-body-sm">
              <li><Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link></li>
              <li><Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Templates</Link></li>
              <li><Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-ds-2 text-sm text-gray-900 ds-heading-3">Company</h4>
            <ul className="space-y-ds-1 ds-body-sm">
              <li><Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link></li>
              <li><a href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Careers</a></li>
              <li><Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-ds-2 text-sm text-gray-900 ds-heading-3">Resources</h4>
            <ul className="space-y-ds-1 ds-body-sm">
              <li><Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</Link></li>
              <li><Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">Guides</Link></li>
              <li><a href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">API Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-ds-2 text-sm text-gray-900 ds-heading-3">Legal</h4>
            <ul className="space-y-ds-1 ds-body-sm">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-ds-6 pt-ds-4 text-center">
          <p className="ds-body-sm text-gray-500">&copy; {currentYear} Inboker. All rights reserved.</p>
        </div>
      </Container>
    </Section>
  );
}
