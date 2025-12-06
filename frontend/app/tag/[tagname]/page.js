"use client";

import { use, useState, useEffect } from 'react';
import TagHeader from '@/components/Tag/TagHeader';
import TagFilter from '@/components/Tag/TagFilter';
import PostCard from '@/components/Post/PostCard';
import { getTagByName } from '@/utils/api/tagApi';
import { getPostsByTag } from '@/utils/api/postApi';

export default function TagPage({ params }) {
  const { tagname } = use(params);

  const [tagData, setTagData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState('relevant'); // relevant, latest, top
  const pageSize = 20;

  // Fetch tag data
  useEffect(() => {
    const fetchTagData = async () => {
      try {
        const response = await getTagByName(tagname);
        if (response.success) {
          setTagData(response.data);
        } else {
          setError(response.message || 'Failed to fetch tag data');
        }
      } catch (err) {
        console.error('Error fetching tag data:', err);
        setError('Failed to fetch tag data');
      }
    };

    if (tagname) {
      fetchTagData();
    }
  }, [tagname]);

  // Fetch posts by tag
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getPostsByTag(tagname, currentPage, pageSize);

        if (response.success) {
          const postsData = response.data;

          // Check if response has pagination info
          if (postsData.items) {
            setPosts(postsData.items);
            setHasMore(postsData.hasNextPage || false);
          } else if (Array.isArray(postsData)) {
            setPosts(postsData);
            setHasMore(postsData.length === pageSize);
          } else {
            setPosts([]);
            setHasMore(false);
          }
        } else {
          setError(response.message || 'Failed to fetch posts');
          setPosts([]);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (tagname) {
      fetchPosts();
    }
  }, [tagname, currentPage, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-brand-background">
        <main className="mx-16 px-3 py-4">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-brand-text-secondary">Loading posts...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen bg-brand-background">
        <main className="mx-16 px-3 py-4">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover"
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
      <main className="mx-4 md:mx-8 lg:mx-16 px-3 py-4">
        <div className="max-w-[1280px] mx-auto">
          {/* Tag Header */}
          <TagHeader
            tag={tagData?.name || tagname}
            postCount={posts.length}
            description={tagData?.description}
            followersCount={tagData?.followersCount}
          />

          {/* Content Grid - Filter Sidebar + Posts */}
          <div className="flex gap-6">
            {/* Left Sidebar - Filters */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <TagFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Posts Section */}
            <div className="flex-1 min-w-0">
              {posts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-brand-text-secondary text-lg">
                    No posts found with this tag yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Posts List */}
                  <div className="space-y-2">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} showCover={false} />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-6 py-3 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

