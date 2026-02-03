"use client";

import Link from 'next/link';

export default function ProfilePosts({ posts }) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="bg-white rounded-lg border border-brand-muted/20 p-6">
          {/* Post Header */}
          {post.badge && (
            <div className="mb-3">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                {post.badge}
              </span>
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              SM
            </div>
            <div>
              <p className="font-medium text-brand-dark">{post.author}</p>
              <p className="text-xs text-brand-muted">{post.date}</p>
            </div>
          </div>

          {/* Title */}
          <Link href={`/post/${post.slug || post.id}`}>
            <h2 className="text-2xl font-bold text-brand-dark hover:text-brand-primary transition-colors mb-3 cursor-pointer">
              {post.title}
            </h2>
          </Link>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap mb-4">
            {post.tags.map((tag, idx) => (
              <Link
                key={idx}
                href={`/tag/${tag}`}
                className="text-brand-muted hover:text-brand-primary text-sm transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-brand-muted">
            {post.reactions > 0 && (
              <div className="flex items-center gap-2">
                <span>❤️🦄🔥</span>
                <span>{post.reactions} reactions</span>
              </div>
            )}
            
            {post.comments !== undefined && (
              <div className="flex items-center gap-2">
                {post.comments > 0 ? (
                  <>
                    <span>💬</span>
                    <span>{post.comments} comments</span>
                  </>
                ) : (
                  <span className="text-brand-muted">💬 Add Comment</span>
                )}
              </div>
            )}

            <div className="ml-auto text-xs">
              {post.readTime} min read
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

