"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUser } from '@/utils/auth';

export default function PostAuthorCard({ author, authorId, joinDate, bio }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    
    // Check if this is the current user's own post
    if (user && authorId) {
      setIsOwnProfile(user.id === authorId);
    }
  }, [authorId]);

  // Get author initials safely
  const getAuthorInitials = (authorName) => {
    if (!authorName) return 'A';
    return authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white rounded-lg border border-brand-muted/20 p-5">
      <Link href={`/user/${author || 'anonymous'}`} className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center text-white text-lg font-bold hover:opacity-80 transition-opacity">
          {getAuthorInitials(author)}
        </div>
        <div>
          <h3 className="font-bold text-brand-dark hover:text-brand-primary transition-colors">
            {author || 'Anonymous'}
          </h3>
        </div>
      </Link>

      {/* Only show Follow button if not own profile */}
      {!isOwnProfile && (
        <button className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors mb-4">
          Follow
        </button>
      )}

      {joinDate && (
        <div className="text-sm text-brand-muted mb-2">
          <span className="font-semibold text-brand-dark">JOINED</span>
          <p>{joinDate}</p>
        </div>
      )}

      {bio && (
        <p className="text-sm text-brand-muted mt-3">{bio}</p>
      )}
    </div>
  );
}

