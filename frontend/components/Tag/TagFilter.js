"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TagFilter({ onFilterChange }) {
  const [selectedFilter, setSelectedFilter] = useState('latest');
  const router = useRouter();

  const filterOptions = [
    { id: 'latest', label: 'Latest' },
  ];

  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
    if (onFilterChange) {
      onFilterChange({ filter: filterId });
    }
  };

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  return (
    <div className="space-y-4">
      {/* Create Post Button */}
      <button
        onClick={handleCreatePost}
        className="w-full px-4 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold rounded-lg transition-colors cursor-pointer"
      >
        Create Post
      </button>


      {/* Filter Options */}
      <div className="bg-white rounded-lg border border-brand-muted/20 p-6">
        <h3 className="font-bold text-brand-dark mb-3">Posts</h3>
        <div className="space-y-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleFilterChange(option.id)}
              className={`w-full px-4 py-2 rounded-lg transition-colors text-left ${selectedFilter === option.id
                ? 'bg-brand-primary text-white font-bold'
                : 'bg-transparent text-brand-dark hover:bg-brand-primary/10'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


