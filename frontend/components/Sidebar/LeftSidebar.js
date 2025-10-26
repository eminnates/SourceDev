'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { AiOutlineHome } from 'react-icons/ai';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import { BsInfoCircle, BsEnvelope, BsCode, BsTwitter, BsFacebook, BsGithub, BsInstagram } from 'react-icons/bs';
import { FiThumbsUp } from 'react-icons/fi';
import { FaRss } from 'react-icons/fa';

export default function LeftSidebar() {
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef(null);

    const handleScroll = () => {
        setIsScrolling(true);

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 1000); // 1 saniye sonra scrollbar gizlenecek
    };
    const menuItems = [
        { icon: <AiOutlineHome className="w-5 h-5" />, label: 'Home', href: '/' },
        { icon: <MdOutlineEmojiEvents className="w-5 h-5" />, label: 'Challenges', href: '/challenges' },
        { icon: <BsCode className="w-5 h-5" />, label: 'DEV Showcase', href: '/showcase', emoji: '✨' },
        { icon: <BsInfoCircle className="w-5 h-5" />, label: 'About', href: '/about', emoji: '😎' },
        { icon: <BsEnvelope className="w-5 h-5" />, label: 'Contact', href: '/contact', emoji: '📬' },
    ];

    const otherItems = [
        { label: 'Code of Conduct', href: '/code-of-conduct', emoji: '👍' },
        { label: 'Privacy Policy', href: '/privacy', emoji: '🤓' },
        { label: 'Terms of Use', href: '/terms', emoji: '👀' },
    ];

    const popularTags = [
        { name: 'webdev', count: 50234 },
        { name: 'javascript', count: 45123 },
        { name: 'programming', count: 42891 },
        { name: 'python', count: 38456 },
        { name: 'beginners', count: 35678 },
        { name: 'tutorial', count: 32145 },
        { name: 'react', count: 29834 },
        { name: 'css', count: 27456 },
        { name: 'devops', count: 24567 },
        { name: 'career', count: 22345 },
        { name: 'opensource', count: 21234 },
        { name: 'nodejs', count: 19876 },
        { name: 'typescript', count: 18543 },
        { name: 'productivity', count: 17234 },
        { name: 'aws', count: 16789 },
    ];

    return (
        <aside className="w-64 flex-shrink-0">

            <div className="bg-white rounded-lg border border-brand-muted/20 p-4 mb-4">
                <h3 className="font-bold text-brand-dark mb-3">Left Sidebar</h3>
                <p className="text-sm text-brand-muted">Content coming soon...</p>
            </div>

            <div className="sticky top-16">
                {/* Main Menu */}
                <nav className="space-y-1">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-brand-dark hover:bg-white hover:text-brand-primary transition-colors"
                        >
                            {item.emoji ? (
                                <span className="text-xl">{item.emoji}</span>
                            ) : (
                                item.icon
                            )}
                            <span className="text-base">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Other Section */}
                <div className="mt-6">
                    <h3 className="px-3 text-base font-bold text-brand-dark mb-2">Other</h3>
                    <nav className="space-y-1">
                        {otherItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-brand-dark hover:bg-white hover:text-brand-primary transition-colors"
                            >
                                <span className="text-xl">{item.emoji}</span>
                                <span className="text-base">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Social Media & RSS */}
                <div className="mt-6">
                    <div className="flex items-center gap-2 px-3">
                        <Link 
                            href="https://twitter.com" 
                            target="_blank"
                            className="p-2 rounded-md text-brand-dark hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                        >
                            <BsTwitter className="w-5 h-5" />
                        </Link>
                        <Link 
                            href="https://facebook.com" 
                            target="_blank"
                            className="p-2 rounded-md text-brand-dark hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                        >
                            <BsFacebook className="w-5 h-5" />
                        </Link>
                        <Link 
                            href="https://github.com" 
                            target="_blank"
                            className="p-2 rounded-md text-brand-dark hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                        >
                            <BsGithub className="w-5 h-5" />
                        </Link>
                        <Link 
                            href="https://instagram.com" 
                            target="_blank"
                            className="p-2 rounded-md text-brand-dark hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                        >
                            <BsInstagram className="w-5 h-5" />
                        </Link>
                        <Link 
                            href="/rss" 
                            className="p-2 rounded-md text-brand-dark hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                        >
                            <FaRss className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Popular Tags */}
                <div className="mt-6">
                    <h3 className="px-3 text-base font-bold text-brand-dark mb-2">Popular Tags</h3>
                    <div
                        className={`max-h-80 overflow-y-auto transition-all ${isScrolling ? 'scrollbar-default' : 'scrollbar-hide'
                            }`}
                        onScroll={handleScroll}
                    >
                        <div className="space-y-1">
                            {popularTags.map((tag, index) => (
                                <Link
                                    key={index}
                                    href={`/tag/${tag.name}`}
                                    className="flex items-start gap-2 px-3 py-2 rounded-md hover:bg-white transition-colors group"
                                >

                                    <div className="flex-1">
                                        <span className="text-base text-brand-dark group-hover:text-brand-primary transition-colors">
                                            <span className="text-brand-muted group-hover:text-brand-primary">#</span>{tag.name}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

