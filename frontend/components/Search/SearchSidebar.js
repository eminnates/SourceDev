"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { buildLocalizedHref } from '@/utils/seo';

export default function SearchSidebar({ query = '', currentCategory = 'posts' }) {
  const { lang } = useLanguage();
  const categories = [
    { id: 'posts', label: 'Posts' },
    { id: 'users', label: 'Users' },
    { id: 'tags', label: 'Tags' },
    { id: 'comments', label: 'Comments' },
  ];

  return (
    <div className="space-y-6">
      {/* Category Links */}
      <nav className="space-y-2">
        {categories.map((category) => {
          const isActive = currentCategory === category.id;
          const isTag = category.id === 'posts';
          
          return (
            <Link
              key={category.id}
              href={buildLocalizedHref('/search', lang, { q: query, category: category.id })}
              className={`block text-base transition-colors ${
                isActive
                  ? 'font-bold text-brand-dark'
                  : isTag
                  ? 'text-brand-primary hover:text-brand-primary-dark'
                  : 'text-brand-dark hover:text-brand-primary'
              }`}
            >
              {category.label}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}

