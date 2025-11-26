"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUser } from '@/utils/auth';
import { checkIfFollowing, followUser, unfollowUser } from '@/utils/api/followApi';
import { searchUsers, getUserById } from '@/utils/api/userApi';
import { isAuthenticated } from '@/utils/auth';
import { getUsernameFromDisplayName } from '@/utils/userUtils';

export default function PostAuthorCard({ author, authorId, joinDate, bio, postId }) {
  console.log('PostAuthorCard props:', { author, authorId, joinDate, bio, postId });

  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [authorProfileImage, setAuthorProfileImage] = useState(null);
  const [authorUsername, setAuthorUsername] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);

    if (user && authorId) {
      const isOwn = user.id === parseInt(authorId);
      setIsOwnProfile(isOwn);
    } else {
      console.log('Cannot check isOwnProfile - user or authorId missing');
    }

    // Check follow status if not own profile and user is authenticated
    const checkFollowStatus = async () => {
      if (user && authorId && isAuthenticated() && user.id !== parseInt(authorId)) {
        try {
          console.log('Checking follow status for authorId:', authorId, 'currentUser:', user);
          const result = await checkIfFollowing(parseInt(authorId));
          console.log('Follow status result:', result);
          if (result.success) {
            console.log('Setting isFollowing to:', result.isFollowing);
            setIsFollowing(result.isFollowing);
          }
        } catch (error) {
          console.error('Failed to check follow status:', error);
        }
      } else {
        console.log('Not checking follow status:', { user: !!user, authorId, isAuthenticated: isAuthenticated(), userId: user?.id, comparison: user?.id !== parseInt(authorId) });
      }
    };

    // Fetch author profile image
    const fetchAuthorProfileImage = async () => {
      if (!authorId && !author) return;

      // Check localStorage first (use authorId if available, otherwise author name)
      const cacheKey = authorId ? `user_profile_id_${authorId}` : `user_profile_${author}`;
      const cachedImage = localStorage.getItem(cacheKey);
      if (cachedImage) {
        setAuthorProfileImage(cachedImage);
        return;
      }

      try {
        let user = null;

        console.log('Fetching author profile image for:', { authorId, author });

        // First try to get user by ID if we have authorId
        if (authorId) {
          console.log('Trying to get user by ID:', authorId);
          const result = await getUserById(parseInt(authorId));
          console.log('getUserById result:', result);
          if (result.success && result.data) {
            user = result.data;
          }
        }

        // If we couldn't get user by ID, try search by name
        if (!user && author) {
          console.log('Trying to search user by name:', author);
          const result = await searchUsers(author);
          console.log('searchUsers result:', result);
          if (result.success && result.data && result.data.length > 0) {
            // Find the user with matching display name
            user = result.data.find(u => u.displayName === author);
            console.log('Found user by name:', user);
          }
        }

        if (user && user.profileImageUrl) {
          console.log('Setting author profile image:', user.profileImageUrl);
          setAuthorProfileImage(user.profileImageUrl);
          // Cache the result
          localStorage.setItem(cacheKey, user.profileImageUrl);
        } else {
          console.log('No profile image found for user:', user);
        }
      } catch (error) {
        console.error('Failed to fetch author profile image:', error);
      }
    };

    // Run API calls if we have either authorId or author
    if (authorId || author) {
      checkFollowStatus();
      fetchAuthorProfileImage();
    } else {
      console.log('Both authorId and author are missing, skipping API calls');
    }
  }, [authorId, author]); // Run when authorId or author changes

  // Fetch username from display name
  useEffect(() => {
    const fetchUsername = async () => {
      if (author) {
        const username = await getUsernameFromDisplayName(author);
        if (username) {
          setAuthorUsername(username);
        }
      }
    };
    fetchUsername();
  }, [author]);

  // Get author initials safely
  const getAuthorInitials = (authorName) => {
    if (!authorName) return 'A';
    return authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    console.log('handleFollowToggle called', { authorId, isAuthenticated: isAuthenticated(), currentUser });
    if (!authorId || !isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      let result;
      if (isFollowing) {
        console.log('Unfollowing user:', authorId);
        result = await unfollowUser(authorId);
      } else {
        console.log('Following user:', authorId);
        result = await followUser(authorId);
      }

      console.log('Follow/unfollow result:', result);
      if (result.success) {
        setIsFollowing(!isFollowing);
      } else {
        console.error('Follow/unfollow failed:', result.message);
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-brand-muted/20 p-5">
      <Link href={authorUsername ? `/user/${authorUsername}` : '#'} className="flex items-center gap-3 mb-4">
        {authorProfileImage ? (
          <img
            src={authorProfileImage}
            alt={author}
            className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center text-white text-lg font-bold hover:opacity-80 transition-opacity">
            {getAuthorInitials(author)}
          </div>
        )}
        <div>
          <h3 className="font-bold text-brand-dark hover:text-brand-primary transition-colors">
            {author || 'Anonymous'}
          </h3>
        </div>
      </Link>

      {/* Show Edit button if own profile, otherwise show Follow button */}
      {isOwnProfile ? (
        <Link href={`/create-post?edit=${postId}`}>
          <button className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors mb-4 cursor-pointer">
            Edit Post
          </button>
        </Link>
      ) : (
        <button
          onClick={handleFollowToggle}
          disabled={loading}
          className={`w-full font-bold py-2 px-4 rounded-lg transition-colors mb-4 ${
            loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          } ${
            isFollowing
              ? 'bg-gray-200 hover:bg-gray-300 text-brand-dark'
              : 'bg-brand-primary hover:bg-brand-primary-dark text-white'
          }`}
        >
          {loading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
        </button>
      )}

    </div>
  );
}

