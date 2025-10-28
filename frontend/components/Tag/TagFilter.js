"use client";

import { useState } from 'react';

export default function TagFilter({ onFilterChange }) {
  const [selectedFilter, setSelectedFilter] = useState('latest');

  const filterOptions = [
    { id: 'latest', label: 'Latest' },
    { id: 'top', label: 'Top' },
    { id: 'most_reactions', label: 'Most Reactions' },
    { id: 'most_comments', label: 'Most Comments' },
  ];

  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
    if (onFilterChange) {
      onFilterChange({ filter: filterId });
    }
  };

  return (
    <div className="space-y-4">
      {/* Create Post Button */}
      <button className="w-full px-4 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold rounded-lg transition-colors">
        Create Post
      </button>


      {/* Filter Options */}
      <div className="bg-white rounded-lg border border-brand-muted/20 p-6">
        <h3 className="font-bold text-brand-dark mb-3">Filter Posts</h3>
        <div className="space-y-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleFilterChange(option.id)}
              className={`w-full px-4 py-2 rounded-lg transition-colors text-left ${
                selectedFilter === option.id
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

