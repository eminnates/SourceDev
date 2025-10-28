"use client";

export default function TagHeader({ tag, postCount }) {
  return (
    <div className="bg-white rounded-lg border border-brand-muted/20 p-8 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-5xl">#</span>
        <h1 className="text-5xl font-bold text-brand-dark">{tag}</h1>
      </div>
      <p className="text-brand-muted text-lg">
        {postCount} posts published
      </p>
    </div>
  );
}

