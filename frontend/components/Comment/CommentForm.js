"use client";

import React, { useState } from 'react';
import { isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';

export default function CommentForm({ postId, onSubmit, placeholder = "Write a comment...", parentCommentId = null }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
    <form onSubmit={handleSubmit} className="space-y-3 w-full">
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

      <div className="flex items-center justify-between">
        <p className="text-xs text-brand-muted">
          {content.length}/3000 • Press Ctrl + Enter to submit
        </p>

        <div className="flex items-center gap-3">
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
  );
}
