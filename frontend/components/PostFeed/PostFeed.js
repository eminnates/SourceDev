'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PostCard from '../Post/PostCard';
import { useLanguage } from '@/context/LanguageContext';

function PostCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-brand-muted/20 p-4 animate-pulse">
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded" />
                        <div className="h-6 w-20 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
import { getRelevantPosts, getLatestPosts, getHotPosts, getForYouPosts, toggleBookmark } from '@/utils/api/postApi';
import { isAuthenticated } from '@/utils/auth';

const PAGE_SIZE = 20;

export default function PostFeed({ defaultTab = 'home', defaultSubTab = 'feed', initialPosts = null }) {
    const { t } = useLanguage();
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
        { id: 'home', label: t('feed.home'), path: '/' },
        { id: 'hot', label: t('feed.hot'), path: '/hot' },
        { id: 'latest', label: t('feed.latest'), path: '/latest' },
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
                        className={`px-2 sm:px-3 py-1.5 text-sm sm:text-base md:text-lg whitespace-nowrap transition-colors cursor-pointer ${
                            activeTab === tab.id
                                ? 'text-brand-dark font-bold border-b-2 border-brand-primary'
                                : 'text-brand-muted hover:text-brand-primary rounded-md hover:bg-white'
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
                        {t('feed.feed')}
                    </button>
                    <button
                        onClick={() => handleSubTabClick('foryou')}
                        className={`px-2 py-0.5 rounded text-xs sm:text-sm transition-colors cursor-pointer ${
                            homeSubTab === 'foryou'
                                ? 'bg-brand-primary text-white'
                                : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
                        }`}
                    >
                        {t('feed.forYou')}
                    </button>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="w-full">
                <Navigation />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <PostCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full">
                <Navigation />
                <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-red-500 font-medium mb-1">{t('feed.error')}</p>
                    <p className="text-brand-muted text-sm mb-4">{error}</p>
                    <button
                        onClick={() => fetchPosts(1, false)}
                        className="px-4 py-2 text-sm text-brand-primary border border-brand-primary rounded-md hover:bg-brand-primary hover:text-white transition-colors"
                    >
                        {t('feed.retry')}
                    </button>
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
                    <p className="text-brand-muted text-lg">{t('feed.empty')}</p>
                    <p className="text-sm text-brand-muted mt-1 mb-4">{t('feed.emptySubtext')}</p>
                    <Link
                        href="/create-post"
                        className="inline-block px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-dark rounded-md transition-colors"
                    >
                        {t('feed.createPost')}
                    </Link>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {posts.map((post, index) => (
                            <PostCard
                                key={`${post.id}-${index}`}
                                post={post}
                                showCover={index === 0}
                                priority={index === 0}
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
                                    className="flex items-center gap-2 px-6 py-2 rounded-md border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition disabled:opacity-50"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                            {t('feed.loadingMore')}
                                        </>
                                    ) : t('feed.loadMore')}
                                </button>
                            ) : (
                                <p className="text-sm text-brand-muted">{t('feed.noMore')}</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
