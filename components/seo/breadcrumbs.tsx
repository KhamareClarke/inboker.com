import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { BreadcrumbSchema } from './json-ld';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

export function Breadcrumbs({ items, baseUrl = 'https://inboker.com' }: BreadcrumbsProps) {
  const schemaItems = items.map((item, i) => ({
    name: item.name,
    url: item.href ? `${baseUrl}${item.href}` : baseUrl,
  }));

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-gray-400 flex-wrap">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />}
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-blue-600 transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className={i === items.length - 1 ? 'text-gray-600 font-medium' : ''}>
                {item.name}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
