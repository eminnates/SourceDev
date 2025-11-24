"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import ProfileSidebar from '@/components/Profile/ProfileSidebar';
import PostCard from '@/components/Post/PostCard';
import { searchUsers, getUserById, getUserPosts } from '@/utils/api/userApi';
import { isAuthenticated, getUser as getCurrentUser } from '@/utils/auth';
import { toggleBookmark } from '@/utils/api/postApi';

export default function UserProfilePage({ params }) {
  const { username } = use(params);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if viewing own profile
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.username === username) {
          // Use current user data
          setUser(currentUser);
          
          // Fetch user posts
          const postsResult = await getUserPosts(currentUser.id);
          if (postsResult.success) {
            setPosts(postsResult.data || []);
          }
        } else {
          // Search for user by username
          const searchResult = await searchUsers(username);
          if (searchResult.success && searchResult.data.length > 0) {
            // Find exact match
            const foundUser = searchResult.data.find(u => u.username.toLowerCase() === username.toLowerCase());
            if (foundUser) {
              setUser(foundUser);
              
              // Fetch user posts
              const postsResult = await getUserPosts(foundUser.id);
              if (postsResult.success) {
                setPosts(postsResult.data || []);
              }
            } else {
              setError('User not found');
            }
          } else {
            setError('User not found');
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user data:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          <p className="mt-4 text-brand-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Profile not found</h2>
          <p className="text-brand-muted mb-4">{error || 'User does not exist'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats from user data
  const stats = {
    posts: posts.length || 0,
    comments: user.commentsCount || 0,
    tags: user.tagsCount || 0
  };

  const badges = [
    { emoji: "🥚", name: "New User" },
    { emoji: "📝", name: "Writer" }
  ];

  const skills = user.skills || "";
  const learning = user.learning || "";
  const availableFor = user.availableFor || "";

  const handleBookmarkToggle = async (postId) => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    try {
      const result = await toggleBookmark(postId);
      if (result.success) {
        // Update local posts state
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  bookmarkedByCurrentUser: !post.bookmarkedByCurrentUser,
                  bookmarksCount: post.bookmarksCount + (post.bookmarkedByCurrentUser ? -1 : 1)
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Bookmark toggle failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background">
      <main className="mx-16 px-3 py-4">
        <div className="max-w-[1280px] mx-auto">
          {/* Profile Header - Full Width within container */}
          <ProfileHeader user={user} />
          
          {/* Content Grid - Sidebar + Posts */}
          <div className="flex gap-6 mt-6">
            {/* Left Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <ProfileSidebar 
                stats={stats}
                badges={badges}
                skills={skills}
                learning={learning}
                availableFor={availableFor}
              />
            </div>

            {/* Posts Section */}
            <div className="flex-1 min-w-0 space-y-2">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  showCover={false}
                  onBookmarkToggle={handleBookmarkToggle}
                  userReactions={post.userReactions || []}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

