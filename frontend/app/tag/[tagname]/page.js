"use client";

import { use } from 'react';
import TagHeader from '@/components/Tag/TagHeader';
import TagFilter from '@/components/Tag/TagFilter';
import PostCard from '@/components/Post/PostCard';

export default function TagPage({ params }) {
  const { tagname } = use(params);

  const handleFilterChange = (filter) => {
    console.log('Filter changed:', filter);
    // API call will be implemented here
  };

  // Mock data - will be replaced with actual API call
  const posts = [
    {
      id: 1,
      author: "Matty Stratton",
      date: "Oct 28",
      title: "Marketing 101: Funnels, Campaigns, and What Marketing Actually Means",
      tags: ["devrel"],
      reactionTypes: { heart: 2, party: 1 },
      comments: 0,
      readTime: 10,
      coverImage: null
    },
    {
      id: 2,
      author: "Matty Stratton",
      date: "Oct 28",
      title: "Sales 101: What Your Sales Team Does (And How DevRel Fits In)",
      tags: ["devrel"],
      reactionTypes: { heart: 3, party: 1 },
      comments: 0,
      readTime: 9,
      coverImage: null
    },
    {
      id: 3,
      author: "Matty Stratton",
      date: "Oct 28",
      title: "Another DevRel Article About Community Building",
      tags: ["devrel", "community"],
      reactionTypes: { heart: 5, fire: 2 },
      comments: 3,
      readTime: 7,
      coverImage: null
    }
  ];

  return (
    <div className="min-h-screen bg-brand-background">
      <main className="mx-16 px-3 py-4">
        <div className="max-w-[1280px] mx-auto">
          {/* Tag Header */}
          <TagHeader tag={tagname} postCount={posts.length} />
          
          {/* Content Grid - Filter Sidebar + Posts */}
          <div className="flex gap-6">
            {/* Left Sidebar - Filters */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <TagFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Posts Section */}
            <div className="flex-1 min-w-0">
              {/* Posts List */}
              <div className="space-y-2">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} showCover={false} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

