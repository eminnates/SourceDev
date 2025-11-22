'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '../Post/PostCard';
import { getRelevantPosts, getLatestPosts, getTopPosts } from '@/utils/api/postApi';

export default function PostFeed({ defaultTab = 'relevant' }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    // Fetch posts based on active tab
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);

            try {
                let result;
                switch (activeTab) {
                    case 'latest':
                        result = await getLatestPosts(1, 20);
                        break;
                    case 'top':
                        result = await getTopPosts(20);
                        break;
                    case 'relevant':
                    default:
                        result = await getRelevantPosts(1, 20);
                        break;
                }

                if (result.success && result.data) {
                    // Backend data is already in the correct format (PostListDto)
                    // PostCard will normalize it internally
                    setPosts(result.data);
                } else {
                    setError(result.message || 'Failed to load posts');
                    setPosts([]);
                }
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to load posts');
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [activeTab]);

    const tabs = [
        { id: 'relevant', label: 'Relevant', path: '/' },
        { id: 'latest', label: 'Latest', path: '/latest' },
        { id: 'top', label: 'Top', path: '/top' },
    ];

    const handleTabClick = (tab) => {
        setActiveTab(tab.id);
        router.push(tab.path);
    };

    if (loading) {
        return (
            <div className="w-full">
                <nav className="flex gap-2 mb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab)}
                            className={`px-3 py-1 rounded-md text-lg transition-colors cursor-pointer hover:bg-white ${
                                activeTab === tab.id
                                    ? 'text-black font-bold'
                                    : 'text-brand-muted hover:text-brand-primary'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
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
                <nav className="flex gap-2 mb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab)}
                            className={`px-3 py-1 rounded-md text-lg transition-colors cursor-pointer hover:bg-white ${
                                activeTab === tab.id
                                    ? 'text-black font-bold'
                                    : 'text-brand-muted hover:text-brand-primary'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
                <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-red-600 mb-2">Error loading posts</p>
                    <p className="text-brand-muted">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Page Header */}
            <nav className="flex gap-2 mb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        className={`px-3 py-1 rounded-md text-lg transition-colors cursor-pointer hover:bg-white ${
                            activeTab === tab.id
                                ? 'text-black font-bold'
                                : 'text-brand-muted hover:text-brand-primary'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Posts List */}
            {posts.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-brand-muted text-lg">No posts found</p>
                    <p className="text-sm text-brand-muted mt-2">Be the first to create a post!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {posts.map((post, index) => (
                        <PostCard key={post.id} post={post} showCover={index === 0} />
                    ))}
                </div>
            )}
        </div>
    );
}
