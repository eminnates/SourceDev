"use client";

import React, { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '@/utils/api/postApi';
import { isAuthenticated, getUser } from '@/utils/auth';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

export default function CommentsSection({ postId, commentCount, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = getUser();

  const scrollToComments = () => {
    const commentsSection = document.getElementById('comments');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const result = await getComments(postId);
      if (result.success) {
        setComments(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content, parentCommentId = null) => {
    try {
      const result = await addComment(postId, content, parentCommentId);
      if (result.success) {
        // Refresh comments
        await fetchComments();
        // Update comment count
        if (onCommentCountChange) {
          onCommentCountChange(prev => prev + 1);
        }
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: 'Failed to add comment' };
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        // Remove comment from local state
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        // Update comment count
        if (onCommentCountChange) {
          onCommentCountChange(prev => prev - 1);
        }
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: 'Failed to delete comment' };
    }
  };

  return (
    <div id="comments" className="bg-white border border-brand-muted/20 rounded-lg p-6 mt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-brand-dark">Comments</h3>
            <span className="text-brand-muted text-lg">({commentCount || 0})</span>
          </div>
          <div className="text-sm text-brand-muted flex items-center gap-2">
            <span className="font-medium">Top comments</span>
            <span className="text-xs">•</span>
            <span>Newest first</span>
          </div>
        </div>
      </div>

      {/* Add comment inline */}
      <div className="mb-6">
        <CommentForm
          postId={postId}
          onSubmit={handleAddComment}
          placeholder="Add to the discussion"
          showAvatar={true}
        />
      </div>

      <div className="border-t border-brand-muted/20 pt-6 space-y-5">
        {loading && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="text-sm text-brand-muted mt-2">Loading comments...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <p className="text-brand-muted text-center py-4">No comments yet. Start the conversation!</p>
        )}

        {!loading && !error && (() => {
          // Build comment tree structure
          const buildCommentTree = (parentId = null, depth = 0) => {
            return comments
              .filter(comment => comment.parentCommentId === parentId)
              .map(comment => ({
                ...comment,
                depth,
                replies: buildCommentTree(comment.id, depth + 1)
              }));
          };

          const commentTree = buildCommentTree();

          const renderComment = (comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onReply={handleAddComment}
                onDelete={handleDeleteComment}
                isReply={comment.depth > 0}
              />
              {/* Render nested replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-4" style={{ marginLeft: comment.depth < 3 ? '2rem' : '0' }}>
                  {comment.replies.map(renderComment)}
                </div>
              )}
            </div>
          );

          return commentTree.map(renderComment);
        })()}
      </div>
    </div>
  );
}
