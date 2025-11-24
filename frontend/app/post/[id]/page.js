"use client";

import { use, useState, useEffect } from 'react';
import PostDetailSidebar from '@/components/Post/PostDetailSidebar';
import PostContent from '@/components/Post/PostContent';
import PostAuthorCard from '@/components/Post/PostAuthorCard';
import { getPostById, toggleLike, toggleReaction, getReactionSummary, toggleBookmark } from '@/utils/api/postApi';

export default function PostDetailPage({ params }) {
  const { id } = use(params); // This is the post ID from URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReactions, setUserReactions] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Convert id to number
        const postId = parseInt(id, 10);
        if (isNaN(postId)) {
          setError('Invalid post ID');
          setLoading(false);
          return;
        }

        const result = await getPostById(postId);
        if (result.success && result.data) {
          setPost(result.data);
          // Set user's current reactions
          setUserReactions(result.data.userReactions || []);
          // Set bookmark state
          setIsBookmarked(result.data.bookmarkedByCurrentUser || false);
        } else {
          setError(result.message || 'Post not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);
  
  const handleReaction = async (reactionType) => {
    if (!post) return;

    const hasCurrentReaction = userReactions.length > 0;
    const currentReaction = userReactions[0];
    const isSameReaction = currentReaction === reactionType;

    let result;

    if (isSameReaction) {
      // Same reaction clicked - toggle it off
      result = await toggleReaction(post.id, reactionType);
    } else {
      // Different reaction clicked - remove current and add new one
      if (hasCurrentReaction) {
        // First remove current reaction
        await toggleReaction(post.id, currentReaction);
      }
      // Then add new reaction
      result = await toggleReaction(post.id, reactionType);
    }

    if (result.success) {
      // Update user's current reactions - only one reaction allowed at a time
      setUserReactions(prev => {
        if (isSameReaction) {
          // Remove reaction if it's the same one
          return [];
        } else {
          // Set new reaction
          return [reactionType];
        }
      });

      // Refresh post data to get updated reaction counts
      const postId = parseInt(id, 10);
      const updatedPost = await getPostById(postId);
      if (updatedPost.success && updatedPost.data) {
        setPost(updatedPost.data);
      }
    }
  };

  const handleBookmark = async () => {
    if (!post) return;

    try {
      const result = await toggleBookmark(post.id);
      if (result.success) {
        // Toggle bookmark state locally
        setIsBookmarked(prev => !prev);
        // Update post bookmark count
        setPost(prev => prev ? {
          ...prev,
          bookmarksCount: prev.bookmarksCount + (isBookmarked ? -1 : 1)
        } : null);
      }
    } catch (error) {
      console.error('Bookmark toggle failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-brand-dark">Loading post...</p>
        </div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Post Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const totalReactions = post.reactionTypes ? Object.values(post.reactionTypes).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="min-h-screen bg-brand-background">
      <main className="mx-16 px-3 py-4">
        <div className="flex gap-6">
          {/* Left Sidebar - Reactions */}
          <div className="hidden lg:block">
            <PostDetailSidebar
              reactions={totalReactions}
              comments={post.comments}
              userReactions={userReactions}
              onReact={handleReaction}
              bookmarks={post.bookmarksCount || 0}
              isBookmarked={isBookmarked}
              onBookmark={handleBookmark}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <PostContent post={post} />
          </div>

          {/* Right Sidebar - Author & Trending */}
          <div className="hidden xl:block w-80 flex-shrink-0 space-y-4">
            <PostAuthorCard
              author={post.author}
              authorId={post.authorId}
              joinDate={post.joinDate}
              postId={post.id}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

