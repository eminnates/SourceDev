"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated, getUser } from '@/utils/auth';
import CommentForm from './CommentForm';
import { searchUsers, getUserById } from '@/utils/api/userApi';
import { getUsernameFromDisplayName } from '@/utils/userUtils';

export default function CommentItem({ comment, onReply, onDelete, isReply = false }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [authorProfileImage, setAuthorProfileImage] = useState(null);
  const [authorUsername, setAuthorUsername] = useState(null);
  const currentUser = getUser();

  // Get author initials safely
  const getAuthorInitials = (authorName) => {
    if (!authorName) return 'A';
    return authorName.charAt(0).toUpperCase();
  };

  // Fetch author profile image
  const fetchAuthorProfileImage = async () => {
    if (!comment.userId && !comment.userDisplayName) return;

    // Check localStorage first (use userId if available, otherwise display name)
    const cacheKey = comment.userId ? `user_profile_id_${comment.userId}` : `user_profile_${comment.userDisplayName}`;
    const cachedImage = localStorage.getItem(cacheKey);
    if (cachedImage) {
      setAuthorProfileImage(cachedImage);
      return;
    }

    try {
      let user = null;

      // First try to get user by ID if we have userId
      if (comment.userId) {
        const result = await getUserById(parseInt(comment.userId));
        if (result.success && result.data) {
          user = result.data;
        }
      }

      // If we couldn't get user by ID, try search by name
      if (!user && comment.userDisplayName) {
        const result = await searchUsers(comment.userDisplayName);
        if (result.success && result.data && result.data.length > 0) {
          // Find the user with matching display name
          user = result.data.find(u => u.displayName === comment.userDisplayName);
        }
      }

      if (user && user.profileImageUrl) {
        setAuthorProfileImage(user.profileImageUrl);
        // Cache the result
        localStorage.setItem(cacheKey, user.profileImageUrl);
      }
    } catch (error) {
      console.error('Failed to fetch comment author profile image:', error);
    }
  };

  // Fetch username from display name
  useEffect(() => {
    const fetchUsername = async () => {
      if (comment.userDisplayName) {
        const username = await getUsernameFromDisplayName(comment.userDisplayName);
        if (username) {
          setAuthorUsername(username);
        }
      }
    };
    fetchUsername();
  }, [comment.userDisplayName]);

  useEffect(() => {
    fetchAuthorProfileImage();
  }, [comment.userId, comment.userDisplayName]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${Math.max(0, diffInSeconds)}s ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleReply = async (content) => {
    const result = await onReply(content, comment.id);
    if (result.success) {
      setShowReplyForm(false);
    }
    return result;
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsDeleting(true);
    try {
      const result = await onDelete(comment.id);
      if (!result.success) {
        alert(result.message || 'Failed to delete comment');
      }
    } catch (error) {
      alert('Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = currentUser && currentUser.id === comment.userId;

  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={authorUsername ? `/user/${authorUsername}` : '#'}>
          {authorProfileImage ? (
            <img
              src={authorProfileImage}
              alt={comment.userDisplayName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm hover:opacity-80 transition-opacity cursor-pointer"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-sm hover:opacity-80 transition-opacity cursor-pointer">
              {getAuthorInitials(comment.userDisplayName)}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0 border border-brand-muted/10 rounded-md p-4 bg-white ">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link
              href={authorUsername ? `/user/${authorUsername}` : '#'}
              className="font-semibold text-brand-dark hover:text-brand-primary transition-colors"
            >
              {comment.userDisplayName}
            </Link>
            <span className="text-xs text-brand-muted">
              {formatDate(comment.createdAt)}
            </span>
            {!isReply && comment.repliesCount > 0 && (
              <span className="text-xs text-brand-muted">
                • {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>

          <div className="text-brand-dark mb-3 whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm text-brand-muted">
            {isAuthenticated() && (
              <>
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="hover:text-brand-primary font-medium transition-colors"
                >
                  Reply
                </button>

                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 font-medium"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                postId={comment.postId}
                onSubmit={handleReply}
                placeholder={`Reply to ${comment.userDisplayName}...`}
                parentCommentId={comment.id}
                showAvatar={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
