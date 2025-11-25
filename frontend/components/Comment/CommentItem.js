"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { isAuthenticated, getUser } from '@/utils/auth';
import CommentForm from './CommentForm';

export default function CommentItem({ comment, onReply, onDelete, isReply = false }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const currentUser = getUser();

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
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
        <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-sm">
          {comment.userDisplayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0 border border-brand-muted/10 rounded-md p-4 bg-white ">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link
              href={`/user/${comment.userDisplayName.split(' ').join('')}`}
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
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
