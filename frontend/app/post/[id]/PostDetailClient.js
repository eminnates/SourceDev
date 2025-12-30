"use client";

import { useState, useEffect } from 'react';
import PostDetailSidebar from '@/components/Post/PostDetailSidebar';
import PostContent from '@/components/Post/PostContent';
import PostAuthorCard from '@/components/Post/PostAuthorCard';
import CommentsSection from '@/components/Comment/CommentsSection';
import { getPostById, toggleReaction, toggleBookmark } from '@/utils/api/postApi';

export default function PostDetailClient({ initialPost }) {
  const [post, setPost] = useState(initialPost);
  const [userReactions, setUserReactions] = useState(initialPost?.userReactions || []);
  const [isBookmarked, setIsBookmarked] = useState(initialPost?.bookmarkedByCurrentUser || false);
  const [activeLanguage, setActiveLanguage] = useState('tr');

  // Update local state if initialPost changes (e.g. revalidation)
  useEffect(() => {
    if (initialPost) {
      setPost(initialPost);
      setUserReactions(initialPost.userReactions || []);
      setIsBookmarked(initialPost.bookmarkedByCurrentUser || false);
      
      // Set initial language based on what's available or default
      if (initialPost.translations && initialPost.translations.length > 0) {
        // Try to find TR, otherwise take the first one
        const hasTr = initialPost.translations.some(t => t.languageCode === 'tr');
        setActiveLanguage(hasTr ? 'tr' : initialPost.translations[0].languageCode);
      }
    }
  }, [initialPost]);

  const handleLanguageChange = (lang) => {
    setActiveLanguage(lang);
    const translation = post.translations?.find(t => t.languageCode === lang);
    
    if (translation) {
      setPost(prev => ({
        ...prev,
        title: translation.title,
        content: translation.contentMarkdown || translation.content,
        contentMarkdown: translation.contentMarkdown || translation.content
      }));
    }
  };

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
      // Note: In a real app, we might want to optimistically update the counts
      // or revalidate the server data. For now, we'll fetch client-side.
      const updatedPost = await getPostById(post.id);
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
        setIsBookmarked(result.isBookmarked);
        
        // Update bookmark count locally
        setPost(prev => ({
          ...prev,
          bookmarksCount: result.isBookmarked 
            ? (prev.bookmarksCount || 0) + 1 
            : Math.max((prev.bookmarksCount || 0) - 1, 0)
        }));
      }
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  if (!post) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 max-w-7xl mx-auto px-4 py-6">
      {/* Left Sidebar - Reactions & Actions */}
      <div className="hidden md:block">
        <PostDetailSidebar 
          reactions={Object.values(post.reactionTypes || {}).reduce((a, b) => a + b, 0)}
          comments={post.commentsCount}
          userReactions={userReactions}
          onReact={handleReaction}
          bookmarks={post.bookmarksCount}
          isBookmarked={isBookmarked}
          onBookmark={handleBookmark}
          onCommentClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
        />
      </div>

      {/* Main Content */}
      <main className="min-w-0 w-full">
        <PostContent 
            post={post} 
            activeLanguage={activeLanguage}
            onLanguageChange={handleLanguageChange}
        />
        
        {/* Comments Section */}
        <div id="comments-section" className="mt-12">
          <CommentsSection postId={post.id} />
        </div>
      </main>

      {/* Right Sidebar - Author Info & More */}
      <div className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-20 space-y-6">
          <PostAuthorCard author={post.author} authorId={post.authorId} postId={post.id} />
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-card border-t border-brand-border p-4 z-50">
        <PostDetailSidebar 
          reactions={Object.values(post.reactionTypes || {}).reduce((a, b) => a + b, 0)}
          comments={post.commentsCount}
          userReactions={userReactions}
          onReact={handleReaction}
          bookmarks={post.bookmarksCount}
          isBookmarked={isBookmarked}
          onBookmark={handleBookmark}
          onCommentClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
        />
      </div>
    </div>
  );
}
