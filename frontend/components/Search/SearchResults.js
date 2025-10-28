"use client";

import PostCard from '@/components/Post/PostCard';

export default function SearchResults({ results, sortBy, onSortChange }) {
  const sortOptions = [
    { id: 'relevant', label: 'Most Relevant' },
    { id: 'newest', label: 'Newest' },
    { id: 'oldest', label: 'Oldest' },
  ];

  return (
    <div className="space-y-4">
      {/* Sort Options */}
      <div className="flex justify-end gap-4">
        {sortOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSortChange && onSortChange(option.id)}
            className={`text-lg transition-colors ${
              sortBy === option.id
                ? 'text-brand-dark font-bold'
                : 'text-brand-muted hover:text-brand-primary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="space-y-2">
        {results && results.length > 0 ? (
          results.map((post) => (
            <PostCard key={post.id} post={post} showCover={false} />
          ))
        ) : (
          <div className="bg-white rounded-lg border border-brand-muted/20 p-12 text-center">
            <p className="text-brand-muted text-lg">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
}

