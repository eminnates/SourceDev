'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [searchFocused, setSearchFocused] = useState(false);

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
                        <div className={`flex items-center justify-center rounded-md border px-3 py-2 bg-white transition-all ${
                            searchFocused ? 'border-brand-primary outline-1 outline-brand-primary' : 'border-brand-muted/40 hover:border-brand-muted'
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

                    {/* Auth Buttons */}
                    <div className="flex flex-row justify-end ml-3 flex-1">
                        <Link href="/login" className="hidden sm:block px-3 py-1.5 text-base  text-brand-dark hover:bg-brand-primary/20 hover:text-brand-primary rounded-md transition-colors mr-1">
                            Log in
                        </Link>
                        <Link href="/register" className="px-3 py-1.5 text-base font-medium text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white rounded-md transition-colors whitespace-nowrap">
                            Create account
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
