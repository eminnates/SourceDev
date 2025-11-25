"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DiscussionItem from './DiscussionItem';
import { getPostsByTag } from '@/utils/api/postApi';
import { getCommentCount } from '@/utils/api/commentApi';

export default function DiscussSection() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscussions = async () => {
      setLoading(true);
      try {
        const response = await getPostsByTag('discuss', 1, 5); // Get first 5 posts

        if (response.success) {
          const postsData = response.data;

          // Extract posts from response
          let posts = [];
          if (postsData.items) {
            posts = postsData.items;
          } else if (Array.isArray(postsData)) {
            posts = postsData;
          }

          // Fetch comment counts for each post
          const postsWithComments = await Promise.all(posts.map(async (post) => {
            const commentResponse = await getCommentCount(post.Id || post.id);
            return {
              ...post,
              realCommentCount: commentResponse.success ? commentResponse.count : 0
            };
          }));

          // Transform posts to discussion format
          const transformedDiscussions = postsWithComments.map(post => ({
            id: post.Id || post.id,
            slug: post.Slug || post.slug,
            title: post.Title || post.title,
            comments: post.realCommentCount,
            badge: (post.Status === 'Published' || post.status === 'Published') && isNewPost(post.PublishedAt || post.publishedAt) ? 'New' : null,
            badgeColor: 'bg-yellow-400 text-yellow-900'
          }));

          setDiscussions(transformedDiscussions);
        }
      } catch (error) {
        console.error('Error fetching discussions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  // Check if post is new (published within last 24 hours)
  const isNewPost = (publishedAt) => {
    if (!publishedAt) return false;
    const postDate = new Date(publishedAt);
    const now = new Date();
    const hoursDiff = (now - postDate) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-brand-muted/20 p-4">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-brand-dark mb-1">#discuss</h3>
          <p className="text-sm text-brand-muted">Discussion threads targeting the whole community</p>
        </div>
        <div className="text-center py-4 text-brand-muted">
          Loading discussions...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-brand-muted/20 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-dark mb-1">#discuss</h3>
        <p className="text-sm text-brand-muted">Discussion threads targeting the whole community</p>
      </div>

      {discussions.length === 0 ? (
        <div className="text-center py-4 text-brand-muted text-sm">
          No discussions yet. Be the first to start one!
        </div>
      ) : (
        <>
          <div className="divide-y divide-brand-muted/20">
            {discussions.map((item) => (
              <DiscussionItem
                key={item.id}
                id={item.id}
                slug={item.slug}
                title={item.title}
                badge={item.badge}
                badgeColor={item.badgeColor}
                comments={item.comments}
              />
            ))}
          </div>

          {/* See all link */}
          <Link
            href="/tag/discuss"
            className="block mt-4 text-center text-sm font-medium text-brand-primary hover:text-brand-primary-dark hover:underline"
          >
            See all discussions
          </Link>
        </>
      )}
    </div>
  );
}


