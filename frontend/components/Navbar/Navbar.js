'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoggedIn, logout, loading } = useAuth();
    const { lang, setLanguage, t } = useLanguage();
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Clear search input when leaving search page (e.g. going back to home)
    useEffect(() => {
        if (pathname !== '/search') {
            setSearchQuery('');
        }
    }, [pathname]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.profile-dropdown')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-brand-muted/30">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
                <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4">
                    {/* Logo */}
                    <div className="flex items-center justify-center sm:justify-between text-center sm:text-left">
                        <Link href="/" className="text-2xl font-bold text-brand-dark hover:text-brand-primary transition-colors">
                            SourceDev
                        </Link>
                    </div>

                    <div className="flex flex-row flex-wrap items-center gap-2 sm:flex-row sm:items-center sm:flex-1">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px] sm:min-w-[280px]">
                            <div className={`flex items-center rounded-md border px-3 py-2 bg-white transition-all ${searchFocused ? 'border-brand-primary outline-1 outline-brand-primary' : 'border-brand-muted/40 hover:border-brand-muted'
                                }`}>
                                <svg className="w-5 h-5 text-brand-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder={t('nav.search')}
                                    className="flex-1 bg-transparent outline-none text-sm sm:text-base text-brand-dark placeholder-brand-dark ml-2"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const trimmed = searchQuery.trim();
                                            if (trimmed.length === 0) return;
                                            router.push(`/search?q=${encodeURIComponent(trimmed)}&category=posts`);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Auth Section */}
                        <div className="flex flex-row justify-end items-center gap-2 flex-wrap ml-auto">
                            {loading ? (
                                <div className="w-24 h-10 bg-gray-100 animate-pulse rounded-md"></div>
                            ) : isLoggedIn && user ? (
                                <>
                                    {/* Create Post Button */}
                                    <Link
                                        href="/create-post"
                                        className="hidden sm:block px-4 py-2 text-base font-medium text-brand-primary border-2 border-brand-primary hover:bg-brand-primary hover:text-white rounded-md transition-colors whitespace-nowrap"
                                    >
                                        {t('nav.createPost')}
                                    </Link>
                                    {/* Profile Picture & Dropdown */}
                                    <div className="relative profile-dropdown">
                                        <button
                                            onClick={() => setShowDropdown(!showDropdown)}
                                            className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-brand-primary transition-colors"
                                        >
                                            <Image
                                                src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.username)}&background=1ABC9C&color=fff&bold=true`}
                                                alt={user.displayName || user.username}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showDropdown && (
                                            <div className="absolute right-0 mt-2 w-56 px-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                <div className="px-4 py-2 rounded-md hover:bg-brand-primary/20 hover:text-brand-primary transition-colors mb-1 cursor-pointer">
                                                    <Link href={`/user/${user.username}`}>
                                                        <p className="text-base font-semibold text-brand-dark">{user.displayName}</p>
                                                        <p className="text-sm text-brand-muted">@{user.username}</p>
                                                    </Link>
                                                </div>
                                                <hr className="border-gray-200 mb-2" />
                                                <div className="py-1">
                                                    <Link href="/create-post"
                                                    className="flex items-center px-4 py-2 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary transition-colors rounded-md sm:hidden"
                                                    onClick={() => setShowDropdown(false)}
                                                    >
                                                        {t('nav.createPost')}
                                                    </Link>
                                                    <Link
                                                        href="/dashboard"
                                                        className="flex items-center px-4 py-2 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary transition-colors rounded-md"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        {t('nav.dashboard')}
                                                    </Link>
                                                    <Link
                                                        href="/drafts"
                                                        className="flex items-center px-4 py-2 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary transition-colors rounded-md"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        {t('nav.drafts')}
                                                    </Link>
                                                    <Link
                                                        href="/reading-list"
                                                        className="flex items-center px-4 py-2 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary transition-colors rounded-md"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        {t('nav.readingList')}
                                                    </Link>
                                                    <Link
                                                        href="/settings"
                                                        className="flex items-center px-4 py-2 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary transition-colors rounded-md"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        {t('nav.settings')}
                                                    </Link>
                                                </div>
                                                <div className="border-t border-gray-200 py-1">
                                                    {/* Language Toggle */}
                                                    <div className="flex items-center gap-1 px-4 py-2">
                                                        <button
                                                            onClick={() => setLanguage('en')}
                                                            className={`px-2 py-0.5 rounded text-sm font-medium transition-colors ${lang === 'en' ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-brand-dark'}`}
                                                        >
                                                            EN
                                                        </button>
                                                        <span className="text-brand-muted text-xs">|</span>
                                                        <button
                                                            onClick={() => setLanguage('tr')}
                                                            className={`px-2 py-0.5 rounded text-sm font-medium transition-colors ${lang === 'tr' ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-brand-dark'}`}
                                                        >
                                                            TR
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center text-left px-4 py-2 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary transition-colors rounded-md"
                                                    >
                                                        {t('nav.signOut')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Not Logged In - Show Login/Register */}
                                    {/* Language toggle (logged out) */}
                                    <div className="hidden sm:flex items-center gap-1 mr-2">
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${lang === 'en' ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-brand-dark'}`}
                                        >
                                            EN
                                        </button>
                                        <span className="text-brand-muted text-xs">|</span>
                                        <button
                                            onClick={() => setLanguage('tr')}
                                            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${lang === 'tr' ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-brand-dark'}`}
                                        >
                                            TR
                                        </button>
                                    </div>
                                    <Link href="/login" className="px-3 py-1.5 text-sm sm:text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary rounded-md transition-colors mr-1">
                                        {t('nav.login')}
                                    </Link>
                                    <Link href="/register" className="flex-1 sm:flex-none text-center px-3 py-1.5 text-sm sm:text-base font-medium text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white rounded-md transition-colors whitespace-nowrap">
                                        {t('nav.createAccount')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
