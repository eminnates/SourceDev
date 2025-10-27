'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '../Post/PostCard';

export default function PostFeed({ defaultTab = 'relevant' }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const router = useRouter();

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    const posts = [
        {
            id: 1,
            title: "Getting Started with React Hooks",
            author: "Sarah Johnson",
            date: "Oct 25",
            excerpt: "Learn the fundamentals of React Hooks and how they can simplify your component logic. Perfect for beginners!",
            tags: ["react", "javascript", "tutorial"],
            reactionTypes: { heart: 25, party: 12, wow: 5 },
            comments: 8,
            readTime: 5,
            coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop"
        },
        {
            id: 2,
            title: "Building Scalable APIs with Node.js",
            author: "Michael Chen",
            date: "Oct 24",
            excerpt: "Discover best practices for creating robust and maintainable REST APIs using Express and modern Node.js patterns.",
            tags: ["nodejs", "backend", "api"],
            reactionTypes: { heart: 20, party: 18 },
            comments: 0,
            readTime: 8,
            coverImage: null
        },
        {
            id: 3,
            title: "CSS Grid vs Flexbox: When to Use Each",
            author: "Emma Davis",
            date: "Oct 24",
            excerpt: "A comprehensive guide to understanding the differences between CSS Grid and Flexbox, with practical examples.",
            tags: ["css", "webdesign", "frontend"],
            reactionTypes: { wow: 30, heart: 15, party: 10 },
            comments: 15,
            readTime: 6,
            coverImage: null
        },
        {
            id: 4,
            title: "Introduction to TypeScript for JavaScript Devs",
            author: "Alex Kumar",
            date: "Oct 23",
            excerpt: "Make the transition from JavaScript to TypeScript easier with this beginner-friendly introduction.",
            tags: ["typescript", "javascript"],
            reactionTypes: { party: 40, heart: 27 },
            comments: 20,
            readTime: 7,
            coverImage: null
        },
        {
            id: 5,
            title: "Docker Best Practices for 2024",
            author: "David Miller",
            date: "Oct 23",
            excerpt: "Optimize your Docker workflow with these essential tips and tricks used by industry professionals.",
            tags: ["docker", "devops", "containers"],
            reactionTypes: { heart: 48 },
            comments: 0,
            readTime: 10,
            coverImage: null
        },
    ];

    const tabs = [
        { id: 'relevant', label: 'Relevant', path: '/' },
        { id: 'latest', label: 'Latest', path: '/latest' },
        { id: 'top', label: 'Top', path: '/top' },
    ];

    const handleTabClick = (tab) => {
        setActiveTab(tab.id);
        router.push(tab.path);
    };

    // Sort posts based on active tab
    const getSortedPosts = () => {
        const sortedPosts = [...posts];
        
        if (activeTab === 'latest') {
            // Sort by date (most recent first)
            return sortedPosts.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });
        } else if (activeTab === 'top') {
            // Sort by total reactions (most popular first)
            return sortedPosts.sort((a, b) => {
                const reactionsA = Object.values(a.reactionTypes).reduce((sum, count) => sum + count, 0);
                const reactionsB = Object.values(b.reactionTypes).reduce((sum, count) => sum + count, 0);
                return reactionsB - reactionsA;
            });
        }
        
        // Default: relevant (no sorting)
        return sortedPosts;
    };

    const displayPosts = getSortedPosts();

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
            <div className="space-y-2">
                {displayPosts.map((post, index) => (
                    <PostCard key={post.id} post={post} showCover={index === 0} />
                ))}
            </div>
        </div>
    );
}

