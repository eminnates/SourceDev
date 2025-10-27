"use client";

import Link from 'next/link';

export default function TagLink({ name, href }) {
  return (
    <Link
      href={href}
      className="flex items-start gap-2 px-3 py-2 rounded-md hover:bg-white transition-colors group"
    >
      <div className="flex-1">
        <span className="text-base text-brand-dark group-hover:text-brand-primary transition-colors">
          <span className="text-brand-muted group-hover:text-brand-primary">#</span>
          {name}
        </span>
      </div>
    </Link>
  );
}

