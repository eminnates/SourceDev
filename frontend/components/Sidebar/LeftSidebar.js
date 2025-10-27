'use client';

import React from 'react';
import { AiOutlineHome } from 'react-icons/ai';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import { BsInfoCircle, BsEnvelope, BsCode } from 'react-icons/bs';
import MenuLink from './MenuLink';
import SocialLinks from './SocialLinks';
import PopularTags from './PopularTags';

export default function LeftSidebar() {
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

    return (
        <aside className="w-full">
            <div className="sticky top-16">
                {/* Main Menu */}
                <nav className="space-y-1">
                    {menuItems.map((item, index) => (
                        <MenuLink
                            key={index}
                            href={item.href}
                            icon={item.icon}
                            emoji={item.emoji}
                            label={item.label}
                        />
                    ))}
                </nav>

                {/* Other Section */}
                <div className="mt-6">
                    <h3 className="px-3 text-base font-bold text-brand-dark mb-2">Other</h3>
                    <nav className="space-y-1">
                        {otherItems.map((item, index) => (
                            <MenuLink
                                key={index}
                                href={item.href}
                                emoji={item.emoji}
                                label={item.label}
                            />
                        ))}
                    </nav>
                </div>

                {/* Social Media & RSS */}
                <div className="mt-6">
                    <SocialLinks />
                </div>

                {/* Popular Tags */}
                <PopularTags />
            </div>
        </aside>
    );
}

