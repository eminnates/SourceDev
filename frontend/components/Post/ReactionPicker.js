"use client";

import { useState, useRef } from 'react';
import { BsHeart } from 'react-icons/bs';

export default function ReactionPicker({ totalReactions = 0, userReactions = [], onReact }) {
  const [showPicker, setShowPicker] = useState(false);
  const timeoutRef = useRef(null);

  const reactions = [
    { type: 'heart', emoji: '❤️', label: 'Heart' },
    { type: 'unicorn', emoji: '🦄', label: 'Unicorn' },
    { type: 'bookmark', emoji: '🔖', label: 'Bookmark' },
    { type: 'fire', emoji: '🔥', label: 'Fire' },
    { type: 'raised_hands', emoji: '🙌', label: 'Raised Hands' },
    { type: 'thinking', emoji: '🤔', label: 'Thinking' },
  ];

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowPicker(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPicker(false);
    }, 200);
  };

  const handleReactionClick = (reaction) => {
    if (onReact) {
      onReact(reaction.type);
    }
    setShowPicker(false);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Button */}
      <button 
        className="flex flex-col items-center gap-1 p-2 hover:bg-brand-primary/10 rounded-lg transition-colors group"
      >
        <div className="w-10 h-10 flex items-center justify-center">
          {userReactions.length > 0 ? (
            <div className="relative">
              <span className="text-2xl">
                {reactions.find(r => r.type === userReactions[0])?.emoji}
              </span>
              {userReactions.length > 1 && (
                <div className="absolute -top-1 -right-1 bg-brand-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {userReactions.length}
                </div>
              )}
            </div>
          ) : (
            <BsHeart className="w-6 h-6 text-brand-muted group-hover:text-red-500 transition-colors" />
          )}
        </div>
        <span className="text-xs text-brand-muted">{totalReactions}</span>
      </button>

      {/* Reaction Picker Popup */}
      {showPicker && (
        <div 
          className="absolute left-full top-0 bg-white border-2 border-brand-muted/30 rounded-lg shadow-xl p-2 z-50 animate-fadeIn"
          style={{ marginLeft: '8px' }}
        >
          <div className="flex gap-1">
            {reactions.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => handleReactionClick(reaction)}
                className="group/reaction relative flex flex-col items-center p-2 hover:bg-brand-primary/10 rounded-lg transition-all transform hover:scale-110"
                title={reaction.label}
              >
                <span className="text-2xl">{reaction.emoji}</span>
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-xs px-2 py-1 rounded opacity-0 group-hover/reaction:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {reaction.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

