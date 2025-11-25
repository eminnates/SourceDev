"use client";

import { useState, useRef, useEffect } from 'react';
import TagLink from './TagLink';
import { getAllTags } from '@/utils/api/tagApi';

export default function PopularTags() {
  const [isScrolling, setIsScrolling] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const response = await getAllTags();
        if (response.success && response.data) {
          // Sort tags by post count (descending)
          const sortedTags = [...response.data].sort((a, b) => {
            const countA = a.postCount || 0;
            const countB = b.postCount || 0;
            return countB - countA;
          });
          setTags(sortedTags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleScroll = () => {
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  // Show top 10 tags by default, all when "All Tags" is clicked
  const displayedTags = showAll ? tags : tags.slice(0, 7);

  if (loading) {
    return (
      <div className="mt-6">
        <h3 className="px-3 text-base font-bold text-brand-dark mb-2">Popular Tags</h3>
        <div className="px-3 py-4 text-center text-brand-muted">
          Loading tags...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="px-3 text-base font-bold text-brand-dark mb-2">Popular Tags</h3>
      <div
        className={`max-h-80 overflow-y-auto transition-all ${isScrolling ? 'scrollbar-default' : 'scrollbar-hide'
          }`}
        onScroll={handleScroll}
      >
        <div className="space-y-1">
          {displayedTags.map((tag) => (
            <TagLink
              key={tag.id}
              name={tag.displayName || tag.name}
              href={`/tag/${tag.name}`}
            />
          ))}
        </div>
      </div>

      {/* All Tags Button */}
      {tags.length > 7 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full px-3 py-2 mt-2 text-sm font-medium text-brand-primary hover:text-brand-primary-dark hover:bg-brand-primary/10 rounded-md transition-colors"
        >
          {showAll ? 'Show Less' : `All Tags (${tags.length})`}
        </button>
      )}
    </div>
  );
}


