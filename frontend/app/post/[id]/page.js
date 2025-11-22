"use client";

import { use, useState, useEffect } from 'react';
import PostDetailSidebar from '@/components/Post/PostDetailSidebar';
import PostContent from '@/components/Post/PostContent';
import PostAuthorCard from '@/components/Post/PostAuthorCard';
import { getPostBySlug, toggleLike } from '@/utils/api/postApi';

export default function PostDetailPage({ params }) {
  const { id } = use(params); // This is actually slug from URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getPostBySlug(id);
        if (result.success && result.data) {
          setPost(result.data);
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
    
    console.log('Reaction:', reactionType);
    // For now, only handle like
    if (reactionType === 'heart') {
      const result = await toggleLike(post.id);
      if (result.success) {
        // Refresh post data
        const updatedPost = await getPostBySlug(id);
        if (updatedPost.success && updatedPost.data) {
          setPost(updatedPost.data);
        }
      }
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
              onReact={handleReaction}
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
            />
          </div>
        </div>
      </main>
    </div>
  );
}

