'use client';

import React from 'react';
import { AiOutlineHome } from 'react-icons/ai';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import { BsInfoCircle, BsEnvelope, BsCode } from 'react-icons/bs';
import MenuLink from './MenuLink';
import SocialLinks from './SocialLinks';
import PopularTags from './PopularTags';
import { useLanguage } from '@/context/LanguageContext';

export default function LeftSidebar() {
    const { t } = useLanguage();
    const menuItems = [
        { icon: <AiOutlineHome className="w-5 h-5" />, label: t('menu.home'), href: '/' },
        { icon: <BsInfoCircle className="w-5 h-5" />, label: t('menu.about'), href: '/about', emoji: '😎' },
        { icon: <BsEnvelope className="w-5 h-5" />, label: t('menu.contact'), href: '/contact', emoji: '📬' },
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

