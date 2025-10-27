"use client";

import Link from 'next/link';

export default function MenuLink({ href, icon, emoji, label }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-brand-dark hover:bg-white hover:text-brand-primary transition-colors"
    >
      {emoji ? (
        <span className="text-xl">{emoji}</span>
      ) : (
        icon
      )}
      <span className="text-base">{label}</span>
    </Link>
  );
}

