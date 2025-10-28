"use client";

import Link from 'next/link';

export default function SearchSidebar({ query = '', currentCategory = 'posts' }) {
  const categories = [
    { id: 'posts', label: 'Posts' },
    { id: 'people', label: 'People' },
    { id: 'organizations', label: 'Organizations' },
    { id: 'tags', label: 'Tags' },
    { id: 'comments', label: 'Comments' },
  ];

  return (
    <div className="space-y-6">
      {/* Category Links */}
      <nav className="space-y-2">
        {categories.map((category) => {
          const isActive = currentCategory === category.id;
          const isTag = category.id === 'tags';
          
          return (
            <Link
              key={category.id}
              href={`/search?q=${query}&category=${category.id}`}
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

      {/* Powered by Algolia */}
      <div>
        <Link
          href="https://www.algolia.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary hover:text-brand-primary-dark text-base font-medium"
        >
          Powered by Algolia
        </Link>
      </div>
    </div>
  );
}

