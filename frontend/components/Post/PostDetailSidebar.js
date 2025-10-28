"use client";

import { BsBookmark, BsThreeDots } from 'react-icons/bs';
import { RiChat1Line } from "react-icons/ri";
import ReactionPicker from './ReactionPicker';

export default function PostDetailSidebar({ reactions = 0, comments = 0, onReact }) {
  return (
    <aside className="sticky top-20 flex flex-col items-center gap-4 w-14">
      {/* Reactions */}
      <ReactionPicker totalReactions={reactions} onReact={onReact} />

      {/* Comments */}
      <button className="flex flex-col items-center gap-1 p-2 hover:bg-brand-primary/10 rounded-lg transition-colors group">
        <div className="w-10 h-10 flex items-center justify-center">
          <RiChat1Line className="w-6 h-6 text-brand-muted group-hover:text-brand-primary transition-colors" />
        </div>
        <span className="text-xs text-brand-muted">{comments}</span>
      </button>

      {/* Bookmark */}
      <button className="flex flex-col items-center gap-1 p-2 hover:bg-brand-primary/10 rounded-lg transition-colors group">
        <div className="w-10 h-10 flex items-center justify-center">
          <BsBookmark className="w-6 h-6 text-brand-muted group-hover:text-brand-primary transition-colors" />
        </div>
        <span className="text-xs text-brand-muted">0</span>
      </button>

      {/* More Options */}
      <button className="flex flex-col items-center gap-1 p-2 hover:bg-brand-primary/10 rounded-lg transition-colors group">
        <div className="w-10 h-10 flex items-center justify-center">
          <BsThreeDots className="w-6 h-6 text-brand-muted group-hover:text-brand-dark transition-colors" />
        </div>
      </button>
    </aside>
  );
}

