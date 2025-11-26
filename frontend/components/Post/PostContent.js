"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MarkdownContent from './MarkdownContent';
import { searchUsers, getUserById } from '@/utils/api/userApi';
import { getUsernameFromDisplayName } from '@/utils/userUtils';

export default function PostContent({ post }) {
  const [authorProfileImage, setAuthorProfileImage] = useState(null);
  const [authorUsername, setAuthorUsername] = useState(null);

  // Get author initials safely
  const getAuthorInitials = (authorName) => {
    if (!authorName) return 'A';
    return authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Fetch author profile image
  const fetchAuthorProfileImage = async () => {
    if (!post.authorId && !post.author) return;

    // Check localStorage first (use authorId if available, otherwise author name)
    const cacheKey = post.authorId ? `user_profile_id_${post.authorId}` : `user_profile_${post.author}`;
    const cachedImage = localStorage.getItem(cacheKey);
    if (cachedImage) {
      setAuthorProfileImage(cachedImage);
      return;
    }

    try {
      let user = null;

      // First try to get user by ID if we have authorId
      if (post.authorId) {
        const result = await getUserById(parseInt(post.authorId));
        if (result.success && result.data) {
          user = result.data;
        }
      }

      // If we couldn't get user by ID, try search by name
      if (!user && post.author) {
        const result = await searchUsers(post.author);
        if (result.success && result.data && result.data.length > 0) {
          // Find the user with matching display name
          user = result.data.find(u => u.displayName === post.author);
        }
      }

      if (user && user.profileImageUrl) {
        setAuthorProfileImage(user.profileImageUrl);
        // Cache the result
        localStorage.setItem(cacheKey, user.profileImageUrl);
      }
    } catch (error) {
      console.error('Failed to fetch author profile image:', error);
    }
  };

  // Fetch username from display name
  useEffect(() => {
    const fetchUsername = async () => {
      if (post.author) {
        const username = await getUsernameFromDisplayName(post.author);
        if (username) {
          setAuthorUsername(username);
        }
      }
    };
    fetchUsername();
  }, [post.author]);

  useEffect(() => {
    fetchAuthorProfileImage();
  }, [post.authorId, post.author]);
  return (
    <article className="bg-white rounded-lg border border-brand-muted/20 overflow-hidden">
      {/* Cover Image */}
      {post.coverImage && (
        <img 
          src={post.coverImage} 
          alt={post.title}
          className="w-full h-96 object-cover"
        />
      )}

      {/* Content */}
      <div className="p-4 md:p-12">
        {/* Author and Date */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={authorUsername ? `/user/${authorUsername}` : '#'}>
            {authorProfileImage ? (
              <img
                src={authorProfileImage}
                alt={post.author}
                className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer">
                {getAuthorInitials(post.author)}
              </div>
            )}
          </Link>
          <div>
            <Link 
              href={authorUsername ? `/user/${authorUsername}` : '#'} 
              className="font-bold text-brand-dark hover:text-brand-primary transition-colors"
            >
              {post.author}
            </Link>
            <p className="text-sm text-brand-muted">Posted on {post.date}</p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-brand-dark mb-6">
          {post.title}
        </h1>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-8">
          {post.tags.map((tag, idx) => {
            const tagColors = [
              { bg: 'bg-yellow-50', text: 'text-yellow-700', hover: 'hover:bg-yellow-100/50' },
              { bg: 'bg-green-50', text: 'text-green-700', hover: 'hover:bg-green-100/50' },
              { bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-100/50' },
            ];
            const colorIndex = idx % tagColors.length;
            const colors = tagColors[colorIndex];
            
            return (
              <Link
                key={idx}
                href={`/tag/${tag}`}
                className={`px-3 py-1.5 ${colors.bg} ${colors.text} ${colors.hover} text-sm rounded-lg cursor-pointer transition-all font-medium`}
              >
                #{tag}
              </Link>
            );
          })}
        </div>

        {/* Content Body - Markdown */}
        <div className="prose max-w-none">
          <MarkdownContent content={post.content} />
        </div>
      </div>
    </article>
  );
}

