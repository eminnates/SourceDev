"use client";

import Link from 'next/link';

export default function DiscussionItem({ id, slug, title, tag, tagColor, description, badge, badgeColor, comments }) {
  // Prefer slug for SEO, fallback to ID
  const postUrl = `/post/${slug || id}`;

  return (
    <div className="group py-4 first:pt-0 last:pb-0">
      <Link href={postUrl}>
        {/* Tag if exists */}
        {tag && (
          <div className="mb-2">
            <span className={`px-2 py-1 ${tagColor} text-xs rounded font-medium`}>
              {tag}
            </span>
            {description && (
              <p className="text-xs text-brand-muted mt-1">{description}</p>
            )}
          </div>
        )}

        {/* Title */}
        <h4 className="text-base font-medium text-brand-dark group-hover:text-brand-primary transition-colors mb-1">
          {title}
        </h4>

        {/* Badge or Comments */}
        {badge ? (
          <span className={`inline-block px-2 py-1 ${badgeColor} text-xs font-bold rounded`}>
            {badge}
          </span>
        ) : comments !== undefined && (
          <p className="text-xs text-brand-muted">
            {comments} {comments === 1 ? 'comment' : 'comments'}
          </p>
        )}
      </Link>
    </div>
  );
}

