"use client";

import Link from 'next/link';

export default function TrendingCard() {
  const trendingPosts = [
    {
      id: 1,
      title: "If I Had to Learn JavaScript Again: The Real Journey From 2017 to Today",
      author: "TechGuru",
      tags: ["javascript", "webdev", "programming", "productivity"],
      avatar: "TG"
    },
    {
      id: 2,
      title: "Meme Monday",
      author: "FunnyDev",
      tags: ["discuss", "watercooler", "jokes"],
      avatar: "FD"
    },
    {
      id: 3,
      title: "Final Round AI vs. Verve AI: Which AI Interview Copilot Boosts Your Job Offers the Most?",
      author: "CareerExpert",
      tags: ["programming", "ai", "career", "interview"],
      avatar: "CE"
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-brand-muted/20 p-5">
      <h3 className="font-bold text-brand-dark mb-1 flex items-center gap-2">
        Trending on <span className="text-brand-primary">DEV Community</span> 🔥
      </h3>
      
      <div className="space-y-4 mt-4">
        {trendingPosts.map((post) => (
          <div key={post.id} className="group">
            <Link href={`/post/${post.slug || post.id}`} className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {post.avatar}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-brand-dark group-hover:text-brand-primary transition-colors mb-1 line-clamp-2">
                  {post.title}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs text-brand-muted">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

