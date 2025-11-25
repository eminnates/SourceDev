'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, logout } from '@/utils/auth';

export default function Navbar() {
    const router = useRouter();
    const [searchFocused, setSearchFocused] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Check authentication status
        setIsLoggedIn(isAuthenticated());
        setUser(getUser());
    }, []);

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
        setIsLoggedIn(false);
        setUser(null);
        router.push('/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-brand-muted/30 flex justify-center">
            <div className="w-full mx-16 px-3">
                <div className="flex flex-row items-center h-14 w-full">
                    {/* Logo */}
                    <div className="mr-3">
                        <Link href="/" className="text-2xl font-bold text-brand-dark hover:text-brand-primary transition-colors">
                            SourceDev
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="flex-1 items-center">
                        <div className={`flex items-center justify-center rounded-md border px-3 py-2 bg-white transition-all ${searchFocused ? 'border-brand-primary outline-1 outline-brand-primary' : 'border-brand-muted/40 hover:border-brand-muted'
                            }`}>
                            <svg className="w-6 h-6 text-brand-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="flex-1 bg-transparent outline-none text-base text-brand-dark placeholder-brand-dark ml-2"
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                            />
                        </div>
                    </div>

                    {/* Auth Section */}
                    <div className="flex flex-row justify-end items-center ml-3 flex-1 gap-2">
                        {isLoggedIn && user ? (
                            <>
                                {/* Create Post Button */}
                                <Link
                                    href="/create-post"
                                    className="px-4 py-2 text-base font-medium text-brand-primary border-2 border-brand-primary hover:bg-brand-primary hover:text-white rounded-md transition-colors whitespace-nowrap"
                                >
                                    Create Post
                                </Link>
                                {/* Profile Picture & Dropdown */}
                                <div className="relative profile-dropdown">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-brand-primary transition-colors"
                                    >
                                        <img
                                            src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.username)}&background=1ABC9C&color=fff&bold=true`}
                                            alt={user.displayName || user.username}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.username)}&background=1ABC9C&color=fff&bold=true`;
                                            }}
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
                                                <Link
                                                    href={`/user/${user.username}`}
                                                    className="flex items-center px-4 py-2 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary transition-colors rounded-md"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href="/drafts"
                                                    className="flex items-center px-4 py-2 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary transition-colors rounded-md"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    My Drafts
                                                </Link>
                                                <Link
                                                    href="/reading-list"
                                                    className="flex items-center px-4 py-2 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary transition-colors rounded-md"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Reading list
                                                </Link>
                                                <Link
                                                    href="/settings"
                                                    className="flex items-center px-4 py-2 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary transition-colors rounded-md"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Settings
                                                </Link>
                                            </div>
                                            <div className="border-t border-gray-200 py-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center text-left px-4 py-2 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary transition-colors rounded-md"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Not Logged In - Show Login/Register */}
                                <Link href="/login" className="hidden sm:block px-3 py-1.5 text-base text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary rounded-md transition-colors mr-1">
                                    Log in
                                </Link>
                                <Link href="/register" className="px-3 py-1.5 text-base font-medium text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white rounded-md transition-colors whitespace-nowrap">
                                    Create account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
