"use client";

import { BsBookmark, BsBookmarkFill, BsThreeDots } from 'react-icons/bs';
import { RiChat1Line } from "react-icons/ri";
import ReactionPicker from './ReactionPicker';
import { toggleBookmark } from '@/utils/api/postApi';
import { isAuthenticated } from '@/utils/auth';

export default function PostDetailSidebar({
  reactions = 0,
  comments = 0,
  userReactions = [],
  onReact,
  bookmarks = 0,
  isBookmarked = false,
  onBookmark,
  onCommentClick
}) {
  return (
    <aside className="sticky top-20 flex flex-col items-center gap-4 w-14">
      {/* Reactions */}
      <ReactionPicker totalReactions={reactions} userReactions={userReactions} onReact={onReact} />

      {/* Comments */}
      <button
        onClick={onCommentClick}
        className="flex flex-col items-center gap-1 p-2 hover:bg-brand-primary/10 rounded-lg transition-colors group"
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <RiChat1Line className="w-6 h-6 text-brand-muted group-hover:text-brand-primary transition-colors" />
        </div>
        <span className="text-xs text-brand-muted">{comments}</span>
      </button>

      {/* Bookmark */}
      <button
        onClick={() => {
          if (!isAuthenticated()) {
            window.location.href = '/login';
            return;
          }

          if (onBookmark) {
            onBookmark();
          }
        }}
        className="flex flex-col items-center gap-1 p-2 hover:bg-brand-primary/10 rounded-lg transition-colors group"
      >
        <div className="w-10 h-10 flex items-center justify-center">
          {isBookmarked ? (
            <BsBookmarkFill className="w-6 h-6 text-brand-primary" />
          ) : (
            <BsBookmark className="w-6 h-6 text-brand-muted group-hover:text-brand-primary transition-colors" />
          )}
        </div>
        <span className="text-xs text-brand-muted">{bookmarks}</span>
      </button>
    </aside>
  );
}

