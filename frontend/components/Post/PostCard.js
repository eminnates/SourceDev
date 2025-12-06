'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { RiChat1Line } from "react-icons/ri";
import { toggleBookmark } from '@/utils/api/postApi';
import { getCommentCount } from '@/utils/api/commentApi';
import { searchUsers } from '@/utils/api/userApi';
import { isAuthenticated } from '@/utils/auth';
import { getUsernameFromDisplayName } from '@/utils/userUtils';

export default function PostCard({ post, showCover = false, onBookmarkToggle }) {
    const [commentCount, setCommentCount] = useState(0);
    const [authorProfileImage, setAuthorProfileImage] = useState(null);
    const [authorUsername, setAuthorUsername] = useState(null);
    const [formattedDate, setFormattedDate] = useState('');

    const author = post.authorDisplayName;
    const isBookmarked = post.bookmarkedByCurrentUser || false;
    const coverImage = post.coverImageUrl;
    const postUrl = `/post/${post.id}`; // Always use ID for unique identification
    const readTime = post.readingTimeMinutes || post.readTime || 5;
    const tags = post.tags || [];

    // Format date on client side to avoid hydration mismatch
    useEffect(() => {
        if (post.date) {
            setFormattedDate(post.date);
        } else if (post.publishedAt) {
            setFormattedDate(new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }));
        }
    }, [post.date, post.publishedAt]);

    // Fetch comment count when component mounts
    useEffect(() => {
        const fetchCommentCount = async () => {
            try {
                const result = await getCommentCount(post.id);
                if (result.success) {
                    setCommentCount(result.count);
                }
            } catch (error) {
                console.error('Failed to fetch comment count:', error);
            }
        };

        fetchCommentCount();
    }, [post.id]);

    // Fetch author profile image
    useEffect(() => {
        const fetchAuthorProfileImage = async () => {
            if (!author) return;

            // Check localStorage first
            const cacheKey = `user_profile_${author}`;
            const cachedImage = localStorage.getItem(cacheKey);
            if (cachedImage) {
                setAuthorProfileImage(cachedImage);
                return;
            }

            try {
                const result = await searchUsers(author);
                if (result.success && result.data && result.data.length > 0) {
                    // Find the user with matching display name
                    const user = result.data.find(u => u.displayName === author);
                    if (user && user.profileImageUrl) {
                        setAuthorProfileImage(user.profileImageUrl);
                        // Cache the result
                        localStorage.setItem(cacheKey, user.profileImageUrl);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch author profile image:', error);
            }
        };

        fetchAuthorProfileImage();
    }, [author]);

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

    const reactionTypes = post.reactionTypes && Object.keys(post.reactionTypes).length > 0
        ? post.reactionTypes
        : post.ReactionTypes && Object.keys(post.ReactionTypes).length > 0
            ? post.ReactionTypes
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
                        <Link href={authorUsername ? `/user/${authorUsername}` : '#'}>
                            {authorProfileImage ? (
                                <img
                                    src={authorProfileImage}
                                    alt={author}
                                    className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition-opacity cursor-pointer">
                                    {getAuthorInitials(author)}
                                </div>
                            )}
                        </Link>
                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-2">
                            <Link 
                                href={authorUsername ? `/user/${authorUsername}` : '#'}
                                className="text-sm font-medium text-brand-dark hover:text-brand-primary transition-colors px-2 py-1 rounded"
                            >
                                {author}
                            </Link>
                            <p className="text-xs text-brand-muted ms-2">{formattedDate}</p>
                        </div>

                        <Link href={postUrl}>
                            <h2 className="text-xl sm:text-2xl font-bold text-black mb-2 hover:text-brand-primary cursor-pointer transition-colors">
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

                        <div className="flex flex-col gap-4 text-sm text-brand-muted w-full sm:flex-row sm:items-center sm:justify-between">
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
                                                        unicorn: '🦄',
                                                        bookmark: '🔖',
                                                        fire: '🔥',
                                                        raised_hands: '🙌',
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
                                    <span className="text-sm text-center gap-2 text-brand-dark">
                                       {commentCount > 0 ? `${commentCount} comments` : ' Add comment'}
                                    </span>
                                </Link>
                            </div>

                            <div className="flex items-center gap-3 self-end text-right sm:justify-end sm:text-left">
                                <span className="text-xs">{readTime} min read</span>

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (!isAuthenticated()) {
                                            // Redirect to login if not authenticated
                                            window.location.href = '/login';
                                            return;
                                        }
                                        if (onBookmarkToggle) {
                                            // Use parent handler for instant update
                                            onBookmarkToggle(post.id);
                                        } else {
                                            // Fallback to reload behavior
                                            toggleBookmark(post.id).then(() => {
                                                window.location.reload();
                                            }).catch(error => {
                                                console.error('Bookmark toggle failed:', error);
                                            });
                                        }
                                    }}
                                    className="hover:text-brand-primary transition-colors cursor-pointer"
                                >
                                    {isBookmarked ? (
                                        <BsBookmarkFill className="w-4 h-4 text-brand-primary" />
                                    ) : (
                                        <BsBookmark className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

