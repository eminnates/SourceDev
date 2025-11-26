"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated, getUser } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { searchUsers, getUserById } from '@/utils/api/userApi';

export default function CommentForm({ postId, onSubmit, placeholder = "Write a comment...", parentCommentId = null, showAvatar = true }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null);
  const router = useRouter();
  const currentUser = getUser();

  // Get author initials safely
  const getAuthorInitials = (authorName) => {
    if (!authorName) return 'A';
    return authorName.charAt(0).toUpperCase();
  };

  // Fetch current user profile image
  const fetchCurrentUserProfileImage = async () => {
    if (!currentUser) return;

    // Check localStorage first
    const cacheKey = `user_profile_id_${currentUser.id}`;
    const cachedImage = localStorage.getItem(cacheKey);
    if (cachedImage) {
      setCurrentUserProfileImage(cachedImage);
      return;
    }

    try {
      // Try to get user by ID
      const result = await getUserById(currentUser.id);
      if (result.success && result.data && result.data.profileImageUrl) {
        setCurrentUserProfileImage(result.data.profileImageUrl);
        // Cache the result
        localStorage.setItem(cacheKey, result.data.profileImageUrl);
      }
    } catch (error) {
      console.error('Failed to fetch current user profile image:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCurrentUserProfileImage();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await onSubmit(content.trim(), parentCommentId);
      if (result.success) {
        setContent('');
      } else {
        alert(result.message || 'Failed to add comment');
      }
    } catch (error) {
      alert('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className={`w-full ${showAvatar ? 'flex gap-3' : ''}`}>
      {/* Avatar - only show if showAvatar is true */}
      {showAvatar && isAuthenticated() && (
        <Link href={`/user/${currentUser?.username || 'anonymous'}`}>
          {currentUserProfileImage ? (
            <img
              src={currentUserProfileImage}
              alt={currentUser?.username || 'User'}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 hover:opacity-80 transition-opacity cursor-pointer"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1 hover:opacity-80 transition-opacity cursor-pointer">
              {getAuthorInitials(currentUser?.username)}
            </div>
          )}
        </Link>
      )}

      <form onSubmit={handleSubmit} className={`space-y-3 ${showAvatar ? 'flex-1' : 'w-full'}`}>
        <div className="border border-brand-muted/30 rounded-lg px-4 py-3 bg-white focus-within:border-brand-primary transition-colors">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAuthenticated() ? placeholder : "Login to comment..."}
            disabled={!isAuthenticated() || isSubmitting}
            className="w-full text-brand-dark placeholder:text-brand-muted bg-transparent border-none resize-none focus:outline-none"
            maxLength={3000}
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-brand-muted">
            {content.length}/3000 • Press Ctrl + Enter to submit
          </p>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setContent('')}
              disabled={!content.length || isSubmitting}
              className="px-4 py-2 border border-brand-muted/60 rounded-lg text-sm font-medium text-brand-dark hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={!content.trim() || !isAuthenticated() || isSubmitting}
              className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : (parentCommentId ? 'Reply' : 'Comment')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
