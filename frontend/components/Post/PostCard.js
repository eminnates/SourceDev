'use client';

import React from 'react';
import Link from 'next/link';
import { BsBookmark} from 'react-icons/bs';
import { RiChat1Line } from "react-icons/ri";

export default function PostCard({ post, showCover = false }) {
    // Normalize data from backend to component format
    const author = post.authorDisplayName;
    const coverImage = post.coverImageUrl;
    const postUrl = `/post/${post.id}`; // Always use ID for unique identification
    const comments = post.commentsCount || post.comments || 0;
    const readTime = post.readingTimeMinutes || post.readTime || 5;
    const tags = post.tags || [];
    
    // Format date
    const date = post.date || (post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    }) : '');

    // Handle reactions
    const reactionTypes = post.reactionTypes && Object.keys(post.reactionTypes).length > 0 
        ? post.reactionTypes 
        : (post.likes > 0 ? { heart: post.likes } : {});

    // Get author initials safely
    const getAuthorInitials = (authorName) => {
        if (!authorName || authorName === 'Anonymous') return 'A';
        return authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <article className="bg-white rounded-lg border border-brand-muted/20 overflow-hidden">
            {showCover && coverImage && (
                <Link href={postUrl}>
                    <img 
                        src={coverImage} 
                        alt={post.title}
                        className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    />
                </Link>
            )}

            <div className="p-5">
                <div className="flex gap-2">

                    <Link href={`/user/${author}`} className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition-opacity cursor-pointer">
                            {getAuthorInitials(author)}
                        </div>
                    </Link>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-2">
                            <Link href={`/user/${author}`} className="text-sm font-medium text-brand-dark hover:bg-brand-muted/10 transition-colors px-2 py-1 rounded cursor-pointer">
                                {author}
                            </Link>
                            <p className="text-xs text-brand-muted ms-2">{date}</p>
                        </div>

                        <Link href={postUrl}>
                            <h2 className="text-2xl font-bold text-black mb-2 hover:text-brand-primary cursor-pointer transition-colors">
                                {post.title}
                            </h2>
                        </Link>

                        <div className="flex gap-2 flex-wrap mb-3">
                            {tags.length > 0 && tags.slice(0, 3).map((tag, idx) => {
                                const tagColors = [
                                    { bg: 'bg-yellow-50', text: 'text-yellow-700', hover: 'hover:bg-yellow-100/50', border: 'hover:border-yellow-200' },
                                    { bg: 'bg-green-50', text: 'text-green-700', hover: 'hover:bg-green-100/50', border: 'hover:border-green-200' },
                                    { bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-100/50', border: 'hover:border-blue-200' },
                                    { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100/50', border: 'hover:border-purple-200' },
                                    { bg: 'bg-pink-50', text: 'text-pink-700', hover: 'hover:bg-pink-100/50', border: 'hover:border-pink-200' },
                                    { bg: 'bg-red-50', text: 'text-red-700', hover: 'hover:bg-red-100/50', border: 'hover:border-red-200' },
                                ];
                                const colorIndex = tag.length % tagColors.length;
                                const colors = tagColors[colorIndex];
                                
                                return (
                                    <Link
                                        key={idx}
                                        href={`/tag/${tag}`}
                                        className={`px-2 py-1 border border-transparent bg-transparent hover:${colors.bg} ${colors.text} ${colors.hover} ${colors.border} text-xs rounded cursor-pointer transition-all`}
                                    >
                                        #<span className='text-black'>{tag}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between text-sm text-brand-muted">
                            <div className="flex items-center gap-4">
                                {reactionTypes && Object.keys(reactionTypes).length > 0 && (
                                    <button className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                                        <div className="flex items-center">
                                            {Object.entries(reactionTypes)
                                                .sort((a, b) => b[1] - a[1])
                                                .slice(0, 3)
                                                .map(([type, count], index) => {
                                                    const reactionEmojis = {
                                                        heart: '❤️',
                                                        party: '🎉',
                                                        wow: '😮',
                                                        fire: '🔥',
                                                        rocket: '🚀',
                                                        thinking: '🤔'
                                                    };
                                                    const zIndex = 30 - (index * 10);
                                                    
                                                    return (
                                                        <div 
                                                            key={type}
                                                            className={`w-6 h-6 rounded-full bg-brand-background border border-white flex items-center justify-center text-sm ${index > 0 ? '-ml-2' : ''}`}
                                                            style={{ zIndex }}
                                                        >
                                                            {reactionEmojis[type]}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                        <span className="text-sm text-brand-dark">
                                            {Object.values(reactionTypes).reduce((a, b) => a + b, 0)} reactions
                                        </span>
                                    </button>
                                )}
                                
                                <Link href={`${postUrl}#comments`} className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                                    <RiChat1Line className="w-5 h-5 text-brand-muted" />
                                    <span className="text-sm text-brand-dark">
                                        {comments > 0 ? `${comments} comments` : 'Add comment'}
                                    </span>
                                </Link>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs">{readTime} min read</span>

                                <button className="hover:text-brand-primary transition-colors cursor-pointer">
                                    <BsBookmark className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

