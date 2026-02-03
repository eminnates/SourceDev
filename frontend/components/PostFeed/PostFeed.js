'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '../Post/PostCard';
import { getRelevantPosts, getLatestPosts, getHotPosts, getForYouPosts, toggleBookmark } from '@/utils/api/postApi';
import { isAuthenticated } from '@/utils/auth';

const PAGE_SIZE = 20;

export default function PostFeed({ defaultTab = 'home', defaultSubTab = 'feed', initialPosts = null }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [homeSubTab, setHomeSubTab] = useState(defaultSubTab); // 'feed' or 'foryou'
    const [posts, setPosts] = useState(initialPosts || []);
    const [loading, setLoading] = useState(!initialPosts);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialPosts ? initialPosts.length >= PAGE_SIZE : true);
    const router = useRouter();
    
    // Ref to skip initial fetch if initialPosts are provided
    const shouldFetchRef = useRef(!initialPosts);

    useEffect(() => {
        setActiveTab(defaultTab);
        setHomeSubTab(defaultSubTab);
    }, [defaultTab, defaultSubTab]);

    // Handle bookmark toggle
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

    // Fetch posts based on active tab
    const fetchPosts = useCallback(
        async (pageToLoad = 1, append = false) => {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            try {
                let result;

                // Determine which API to call
                if (activeTab === 'home') {
                    if (homeSubTab === 'foryou') {
                        result = await getForYouPosts(pageToLoad, PAGE_SIZE);
                    } else {
                        result = await getRelevantPosts(pageToLoad, PAGE_SIZE);
                    }
                } else if (activeTab === 'hot') {
                    result = await getHotPosts(pageToLoad, PAGE_SIZE);
                } else if (activeTab === 'latest') {
                    result = await getLatestPosts(pageToLoad, PAGE_SIZE);
                } else {
                    result = await getRelevantPosts(pageToLoad, PAGE_SIZE);
                }

                if (result.success && result.data) {
                    const fetchedPosts = Array.isArray(result.data) ? result.data : [];

                    if (append) {
                        setPosts((prev) => [...prev, ...fetchedPosts]);
                    } else {
                        setPosts(fetchedPosts);
                    }

                    setPage(pageToLoad);
                    setHasMore(fetchedPosts.length === PAGE_SIZE);
                } else {
                    setError(result.message || 'Failed to load posts');
                    if (!append) {
                        setPosts([]);
                    }
                }
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to load posts');
                if (!append) {
                    setPosts([]);
                }
            } finally {
                if (append) {
                    setIsLoadingMore(false);
                } else {
                    setLoading(false);
                }
            }
        },
        [activeTab, homeSubTab]
    );

    useEffect(() => {
        if (!shouldFetchRef.current) {
            shouldFetchRef.current = true;
            return;
        }
        setPosts([]);
        setPage(1);
        setHasMore(true);
        fetchPosts(1, false);
    }, [activeTab, homeSubTab, fetchPosts]);

    const handleLoadMore = () => {
        if (isLoadingMore || !hasMore) return;
        const nextPage = page + 1;
        fetchPosts(nextPage, true);
    };

    const tabs = [
        { id: 'home', label: 'Home', path: '/' },
        { id: 'hot', label: 'Hot', path: '/hot' },
        { id: 'latest', label: 'Latest', path: '/latest' },
    ];

    const handleTabClick = (tab) => {
        setActiveTab(tab.id);
        if (tab.id === 'home') {
            setHomeSubTab('feed');
        }
        router.push(tab.path);
    };

    const handleSubTabClick = (subTab) => {
        setHomeSubTab(subTab);
        if (subTab === 'foryou') {
            router.push('/for-you');
        } else {
            router.push('/');
        }
    };

    // Navigation component shared across states
    const Navigation = () => (
        <div className="mb-3">
            {/* Main tabs */}
            <nav className="flex gap-1 sm:gap-2 mb-2 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        className={`px-2 sm:px-3 py-1 rounded-md text-sm sm:text-base md:text-lg whitespace-nowrap transition-colors cursor-pointer hover:bg-white ${
                            activeTab === tab.id
                                ? 'text-black font-bold'
                                : 'text-brand-muted hover:text-brand-primary'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            
            {/* Home sub-tabs (Feed / For You) */}
            {activeTab === 'home' && (
                <div className="flex gap-1 ml-1">
                    <button
                        onClick={() => handleSubTabClick('feed')}
                        className={`px-2 py-0.5 rounded text-xs sm:text-sm transition-colors cursor-pointer ${
                            homeSubTab === 'feed'
                                ? 'bg-brand-primary text-white'
                                : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
                        }`}
                    >
                        Feed
                    </button>
                    <button
                        onClick={() => handleSubTabClick('foryou')}
                        className={`px-2 py-0.5 rounded text-xs sm:text-sm transition-colors cursor-pointer ${
                            homeSubTab === 'foryou'
                                ? 'bg-brand-primary text-white'
                                : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
                        }`}
                    >
                        For You
                    </button>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="w-full">
                <Navigation />
                <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                        <p className="text-brand-muted">Loading posts...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full">
                <Navigation />
                <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-red-600 mb-2">Error loading posts</p>
                    <p className="text-brand-muted">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full m-0 p-0">
            <Navigation />

            {/* Posts List */}
            {posts.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-brand-muted text-lg">No posts found</p>
                    <p className="text-sm text-brand-muted mt-2">Be the first to create a post!</p>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {posts.map((post, index) => (
                            <PostCard
                                key={`${post.id}-${index}`}
                                post={post}
                                showCover={index === 0}
                                onBookmarkToggle={handleBookmarkToggle}
                            />
                        ))}
                    </div>
                    {posts.length > 0 && (
                        <div className="flex justify-center mt-6">
                            {hasMore ? (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="px-6 py-2 rounded-md border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition disabled:opacity-50"
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load more'}
                                </button>
                            ) : (
                                <p className="text-sm text-brand-muted">No more posts</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
