"use client";

import Link from 'next/link';
import PostCard from '@/components/Post/PostCard';

export default function SearchResults({ results, sortBy, onSortChange, category }) {
  const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'oldest', label: 'Oldest' },
  ];

  const isPostCategory = category === 'posts';

  return (
    <div className="space-y-4">

      {isPostCategory && (
        <div className="flex justify-end gap-4">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSortChange && onSortChange(option.id)}
              className={`text-lg transition-colors ${
                sortBy === option.id
                  ? 'text-brand-dark font-bold'
                  : 'text-brand-muted hover:text-brand-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {results && results.length > 0 ? (
          isPostCategory ? (
            results.map((post) => (
              <PostCard key={post.id} post={post} showCover={false} />
            ))
          ) : category === 'tags' ? (
            results.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.name}`}
                className="block bg-white rounded-lg border border-brand-muted/20 px-4 py-3 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-brand-dark">#{tag.name}</span>
                  <span className="text-sm text-brand-muted">{tag.postCount} posts</span>
                </div>
              </Link>
            ))
          ) : category === 'comments' ? (
            results.map((comment) => (
              <Link
                key={comment.id}
                href={`/post/${comment.postId}#comments`}
                className="block bg-white rounded-lg border border-brand-muted/20 px-4 py-3 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors"
              >
                <p className="text-sm text-brand-muted mb-1">
                  {comment.userDisplayName} on post #{comment.postId}
                </p>
                <p className="text-base text-brand-dark line-clamp-2">
                  {comment.content}
                </p>
              </Link>
            ))
          ) : category === 'users' ? (
            results.map((user) => {
              const initials =
                (user.displayName || user.username || 'U')
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

              return (
                <Link
                  key={user.id}
                  href={`/user/${user.username}`}
                  className="block bg-white rounded-lg border border-brand-muted/20 px-4 py-3 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-muted/30 bg-brand-primary/10 flex items-center justify-center text-sm font-semibold text-brand-primary">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={user.displayName || user.username || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.username || 'User')}&background=1ABC9C&color=fff&bold=true&size=64`;
                          }}
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-brand-dark">
                        {user.displayName || user.username}
                      </p>
                      {user.username && (
                        <p className="text-xs text-brand-muted">@{user.username}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="bg-white rounded-lg border border-brand-muted/20 p-12 text-center">
              <p className="text-brand-muted text-lg">No results for this category yet</p>
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg border border-brand-muted/20 p-12 text-center">
            <p className="text-brand-muted text-lg">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
}

