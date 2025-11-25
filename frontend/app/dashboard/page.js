"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUser } from '@/utils/auth';
import { getUserPosts } from '@/utils/api/userApi';
import { deletePost } from '@/utils/api/postApi';
import { getCommentCount } from '@/utils/api/commentApi';

export default function DashboardPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    // Check authentication and fetch posts
    const user = getUser();
    console.log('Dashboard: user from getUser():', user);
    setCurrentUser(user);

    if (user) {
      fetchUserPostsWithUser(user); // Pass user directly instead of using state
    } else {
      console.log('Dashboard: No user found, stopping loading');
      setLoading(false);
    }
  }, []);

  const fetchUserPostsWithUser = async (user) => {
    console.log('Dashboard: Fetching posts for user:', user.id, 'user object:', user);
    try {
      setLoading(true);
      setError(null);

      console.log('Dashboard: Calling getUserPosts API...');
      const response = await getUserPosts(user.id);
      console.log('Dashboard: getUserPosts raw response:', response);

      if (response.success) {
        const postsData = response.data || [];
        console.log('Dashboard: Posts data received:', postsData);
        setPosts(postsData);
        console.log('Dashboard: Posts loaded:', postsData.length);

        // Fetch stats for each post
        if (postsData.length > 0) {
          await fetchPostsStats(postsData);
        }
      } else {
        console.error('Dashboard: getUserPosts failed:', response.message);
        setError(response.message || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Dashboard: Error in fetchUserPosts:', err);
      setError('Failed to fetch posts');
    } finally {
      console.log('Dashboard: Setting loading to false');
      setLoading(false);
    }
  };

  const fetchPostsStats = async (postsData) => {
    console.log('Dashboard: Fetching stats for', postsData.length, 'posts');
    setStatsLoading(true);

    try {
      const updatedPosts = await Promise.all(
        postsData.map(async (post) => {
          try {
            // Calculate total reactions from reactionTypes
            const likesCount = post.reactionTypes ? Object.values(post.reactionTypes).reduce((sum, count) => sum + count, 0) : 0;

            // Fetch comment count
            const commentResult = await getCommentCount(post.id);
            const commentsCount = commentResult.success ? commentResult.count : 0;

            console.log(`Dashboard: Stats for post ${post.id}:`, {
              likes: likesCount,
              comments: commentsCount,
              views: post.viewCount || post.views || 0,
              reactionTypes: post.reactionTypes
            });

            return {
              ...post,
              likesCount: likesCount,
              commentsCount: commentsCount,
              // viewCount should already be in post data
            };
          } catch (error) {
            console.error(`Error fetching stats for post ${post.id}:`, error);
            return {
              ...post,
              likesCount: post.reactionTypes ? Object.values(post.reactionTypes).reduce((sum, count) => sum + count, 0) : 0,
              commentsCount: 0,
            };
          }
        })
      );

      setPosts(updatedPosts);
      console.log('Dashboard: All post stats updated');
    } catch (error) {
      console.error('Error fetching posts stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingPostId(postId);
      const response = await deletePost(postId);

      if (response.success) {
        // Remove post from local state
        setPosts(prev => prev.filter(post => post.id !== postId));
      } else {
        alert(response.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setDeletingPostId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!currentUser) {
    console.log('Dashboard: No currentUser, showing access denied');
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-dark mb-4">Access Denied</h2>
          <p className="text-brand-muted mb-6">You need to be logged in to view your dashboard.</p>
          <Link href="/login" className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background">
        <main className="mx-16 px-3 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-brand-text-secondary">Loading your posts...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-background">
        <main className="mx-16 px-3 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchUserPosts}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <main className="mx-16 px-3 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-brand-dark mb-2">Dashboard</h1>
            <p className="text-brand-muted text-lg">Manage your posts and view their performance</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-brand-muted/20 p-6">
              <div className="text-3xl font-bold text-brand-dark">{posts.length}</div>
              <div className="text-brand-muted">Total Posts</div>
            </div>
            <div className="bg-white rounded-lg border border-brand-muted/20 p-6">
              <div className={`text-3xl font-bold ${statsLoading ? 'animate-pulse text-gray-400' : 'text-brand-dark'}`}>
                {statsLoading ? '...' : posts.reduce((sum, post) => sum + (post.views || 0), 0)}
              </div>
              <div className="text-brand-muted">Total Views</div>
            </div>
            <div className="bg-white rounded-lg border border-brand-muted/20 p-6">
              <div className={`text-3xl font-bold ${statsLoading ? 'animate-pulse text-gray-400' : 'text-brand-dark'}`}>
                {statsLoading ? '...' : posts.reduce((sum, post) => sum + (post.likesCount || 0), 0)}
              </div>
              <div className="text-brand-muted">Total Likes</div>
            </div>
            <div className="bg-white rounded-lg border border-brand-muted/20 p-6">
              <div className={`text-3xl font-bold ${statsLoading ? 'animate-pulse text-gray-400' : 'text-brand-dark'}`}>
                {statsLoading ? '...' : posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0)}
              </div>
              <div className="text-brand-muted">Total Comments</div>
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-lg border border-brand-muted/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-muted/20">
              <h2 className="text-xl font-semibold text-brand-dark">Your Posts</h2>
            </div>

            {posts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-brand-muted mb-4">You haven't published any posts yet.</p>
                <Link
                  href="/create-post"
                  className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors"
                >
                  Create Your First Post
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-brand-muted/20">
                {posts.map((post) => (
                  <div key={post.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <Link href={`/post/${post.id}`}>
                          <h3 className="text-xl font-semibold text-brand-dark hover:text-brand-primary transition-colors mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-4 text-sm text-brand-muted mb-4">
                          <span>Published {formatDate(post.publishedAt || post.createdAt)}</span>
                          {post.status && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Published
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-brand-muted">👁️</span>
                            <span className={`text-sm font-medium ${statsLoading ? 'animate-pulse text-gray-400' : ''}`}>
                              {statsLoading ? '...' : (post.views || 0)} views
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-brand-muted">❤️</span>
                            <span className={`text-sm font-medium ${statsLoading ? 'animate-pulse text-gray-400' : ''}`}>
                              {statsLoading ? '...' : (post.likesCount || 0)} likes
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-brand-muted">🔖</span>
                            <span className={`text-sm font-medium ${statsLoading ? 'animate-pulse text-gray-400' : ''}`}>
                              {statsLoading ? '...' : (post.bookmarks || 0)} bookmarks
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-brand-muted">💬</span>
                            <span className={`text-sm font-medium ${statsLoading ? 'animate-pulse text-gray-400' : ''}`}>
                              {statsLoading ? '...' : (post.commentsCount || 0)} comments
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-6">
                        <Link
                          href={`/create-post?edit=${post.id}`}
                          className="px-4 py-2 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingPostId === post.id}
                          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingPostId === post.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
