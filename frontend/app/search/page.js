"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchSidebar from '@/components/Search/SearchSidebar';
import SearchResults from '@/components/Search/SearchResults';
import { searchPosts } from '@/utils/api/postApi';
import { searchTags } from '@/utils/api/tagApi';
import { searchComments } from '@/utils/api/commentApi';
import { searchUsers } from '@/utils/api/userApi';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'posts';
  const [sortBy, setSortBy] = useState('newest');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch results when query/category/sort changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (category === 'posts') {
          const response = await searchPosts(query, 1, 50);
          if (response.success && Array.isArray(response.data)) {
            let data = response.data;
            if (sortBy === 'newest') {
              data = [...data].sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
            } else if (sortBy === 'oldest') {
              data = [...data].sort((a, b) => new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt));
            }
            setResults(data);
          } else {
            setResults([]);
            setError(response.message || 'Failed to load search results');
          }
        } else if (category === 'tags') {
          const tagResponse = await searchTags(query, 20);
          if (tagResponse.success && Array.isArray(tagResponse.data)) {
            setResults(tagResponse.data);
          } else {
            setResults([]);
            setError(tagResponse.message || 'Failed to load tag results');
          }
        } else if (category === 'comments') {
          const commentResponse = await searchComments(query, 1, 20);
          if (commentResponse.success && Array.isArray(commentResponse.data)) {
            setResults(commentResponse.data);
          } else {
            setResults([]);
            setError(commentResponse.message || 'Failed to load comment results');
          }
        } else if (category === 'users') {
          const userResponse = await searchUsers(query);
          if (userResponse.success && Array.isArray(userResponse.data)) {
            setResults(userResponse.data);
          } else {
            setResults([]);
            setError(userResponse.message || 'Failed to load user results');
          }
        } else {
          // Diğer kategoriler için şimdilik sonuç yok
          setResults([]);
        }
      } catch (err) {
        console.error('Search fetch error:', err);
        setError('Failed to load search results');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category, sortBy]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <main className="mx-4 md:mx-8 lg:mx-16 px-3 py-4">
        <div className="max-w-[1024px] mx-auto">
          {/* Search Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-brand-dark mb-2">
              Search results for <span className="italic">{query}</span>
            </h1>
          </div>
          
          {/* Content Grid - Sidebar + Results */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Sidebar - Categories (visible on all screens, stacked on mobile) */}
            <div className="w-full lg:w-52 lg:flex-shrink-0 mb-4 lg:mb-0">
              <SearchSidebar query={query} currentCategory={category} />
            </div>

            {/* Search Results */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="bg-white rounded-lg border border-brand-muted/20 p-12 text-center">
                  <p className="text-brand-muted text-lg">Loading results...</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg border border-red-200 p-12 text-center">
                  <p className="text-red-600 text-lg">{error}</p>
                </div>
              ) : (
                <SearchResults 
                  results={results}
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                  category={category}
                />
              )}
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
