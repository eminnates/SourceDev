"use client";

import Link from 'next/link';
import { BsTwitter, BsFacebook, BsGithub, BsInstagram } from 'react-icons/bs';
import { FaRss } from 'react-icons/fa';

export default function SocialLinks() {
  const socialLinks = [
    { icon: BsTwitter, href: "https://twitter.com", external: true },
    { icon: BsFacebook, href: "https://facebook.com", external: true },
    { icon: BsGithub, href: "https://github.com", external: true },
    { icon: BsInstagram, href: "https://instagram.com", external: true },
    { icon: FaRss, href: "/rss", external: false },
  ];

  return (
    <div className="flex items-center gap-2 px-3">
      {socialLinks.map((link, index) => {
        const Icon = link.icon;
        return (
          <Link
            key={index}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            className="p-2 rounded-md text-brand-dark hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
          >
            <Icon className="w-5 h-5" />
          </Link>
        );
      })}
    </div>
  );
}

