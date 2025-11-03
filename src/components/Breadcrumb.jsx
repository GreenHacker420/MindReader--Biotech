'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Breadcrumb({ items }) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if items not provided
  const breadcrumbs = items || generateBreadcrumbs(pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link
        href="/"
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

function generateBreadcrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  const labels = {
    'food-for-thought': 'Food for Thought',
    'investing-insight': 'Investing Insight',
    'mindreader-science-desk': 'Science Desk',
    'articles': 'Articles',
    'resources': 'Resources',
    'datasets': 'Datasets',
    'pricing': 'Pricing',
    'contact': 'Contact',
    'about': 'About',
    'team': 'Team',
    'admin': 'Admin',
    'dashboard': 'Dashboard',
    'users': 'Users',
    'settings': 'Settings',
    'leads': 'Contact Leads',
  };

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    breadcrumbs.push({
      label,
      href: isLast ? null : href,
    });
  });

  return breadcrumbs;
}
