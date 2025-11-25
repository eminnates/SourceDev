"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchSidebar from '@/components/Search/SearchSidebar';
import SearchResults from '@/components/Search/SearchResults';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'posts';
  const [sortBy, setSortBy] = useState('relevant');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data - will be replaced with actual API call
  const mockResults = [
    {
      id: 1,
      author: "Mert Cobanov",
      date: "Sep 15 '20",
      title: "Deneme",
      tags: [],
      reactionTypes: { heart: 1 },
      comments: 0,
      readTime: 1,
      coverImage: null
    },
    {
      id: 2,
      author: "koftebey",
      date: "Apr 28 '22",
      title: "leet deneme 1 two sums",
      tags: [],
      reactionTypes: { heart: 4, unicorn: 2 },
      comments: 0,
      readTime: 1,
      coverImage: null
    },
    {
      id: 3,
      author: "Gambit 🔥",
      date: "Mar 30 '18",
      title: "Selam",
      tags: ["deneme"],
      reactionTypes: { heart: 6 },
      comments: 0,
      readTime: 1,
      coverImage: null
    }
  ];

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    console.log('Sort changed to:', newSort);
    // API call will be implemented here
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <main className="mx-16 px-3 py-4">
        <div className="max-w-[1024px] mx-auto">
          {/* Search Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-brand-dark mb-2">
              Search results for <span className="italic">{query}</span>
            </h1>
          </div>
          
          {/* Content Grid - Sidebar + Results */}
          <div className="flex gap-12">
            {/* Left Sidebar - Categories */}
            <div className="hidden lg:block w-52 flex-shrink-0">
              <SearchSidebar query={query} currentCategory={category} />
            </div>

            {/* Search Results */}
            <div className="flex-1 min-w-0">
              <SearchResults 
                results={mockResults}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-brand-muted">Loading...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
