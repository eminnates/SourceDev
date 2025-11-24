"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/Post/PostCard';
import { getBookmarkedPosts, toggleBookmark } from '@/utils/api/postApi';
import { isAuthenticated } from '@/utils/auth';

export default function ReadingListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Check if user is authenticated (only on client)
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchBookmarkedPosts();
  }, [page]);

  const fetchBookmarkedPosts = async () => {
    try {
      setLoading(true);
      const result = await getBookmarkedPosts(page, 20);

      if (result.success && result.data) {
        if (page === 1) {
          setPosts(result.data);
        } else {
          setPosts(prev => [...prev, ...result.data]);
        }

        // If less than requested, no more posts
        setHasMore(result.data.length === 20);
      } else {
        setError(result.message || 'Failed to load reading list');
      }
    } catch (err) {
      setError('Failed to load reading list');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (postId) => {
    try {
      const result = await toggleBookmark(postId);
      if (result.success) {
        // Remove from local state after successful API call
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      } else {
        console.error('Bookmark toggle failed:', result.message);
        // Optionally show error to user
      }
    } catch (error) {
      console.error('Bookmark toggle error:', error);
      // Optionally show error to user
    }
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Reading List</h1>
          <p className="text-brand-muted">Your saved posts for later reading</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {posts.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-brand-dark mb-2">No saved posts yet</h3>
            <p className="text-brand-muted mb-4">Start saving posts to build your reading list</p>
            <button
              onClick={() => router.push('/')}
              className="bg-brand-primary hover:bg-brand-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
            >
              Explore Posts
            </button>
          </div>
        )}

        <div className="space-y-6">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              showCover={index === 0}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        )}

        {hasMore && posts.length > 0 && !loading && (
          <div className="text-center py-8">
            <button
              onClick={() => setPage(prev => prev + 1)}
              className="bg-brand-primary hover:bg-brand-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
