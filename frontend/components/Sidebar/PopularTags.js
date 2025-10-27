"use client";

import { useState, useRef } from 'react';
import TagLink from './TagLink';

export default function PopularTags() {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const popularTags = [
    { name: 'webdev', count: 50234 },
    { name: 'javascript', count: 45123 },
    { name: 'programming', count: 42891 },
    { name: 'python', count: 38456 },
    { name: 'beginners', count: 35678 },
    { name: 'tutorial', count: 32145 },
    { name: 'react', count: 29834 },
    { name: 'css', count: 27456 },
    { name: 'devops', count: 24567 },
    { name: 'career', count: 22345 },
    { name: 'opensource', count: 21234 },
    { name: 'nodejs', count: 19876 },
    { name: 'typescript', count: 18543 },
    { name: 'productivity', count: 17234 },
    { name: 'aws', count: 16789 },
  ];

  const handleScroll = () => {
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  return (
    <div className="mt-6">
      <h3 className="px-3 text-base font-bold text-brand-dark mb-2">Popular Tags</h3>
      <div
        className={`max-h-80 overflow-y-auto transition-all ${
          isScrolling ? 'scrollbar-default' : 'scrollbar-hide'
        }`}
        onScroll={handleScroll}
      >
        <div className="space-y-1">
          {popularTags.map((tag, index) => (
            <TagLink
              key={index}
              name={tag.name}
              href={`/tag/${tag.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

