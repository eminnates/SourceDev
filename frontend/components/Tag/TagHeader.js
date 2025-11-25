"use client";

// Capitalize tag name for better display
const formatTagName = (tag) => {
  if (!tag) return '';

  // Capitalize first letter of each word
  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
};

export default function TagHeader({ tag, postCount, description, followersCount }) {
  const displayName = formatTagName(tag);

  return (
    <div className="bg-white rounded-lg border border-brand-muted/20 p-8 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-5xl">#</span>
        <h1 className="text-5xl font-bold text-brand-dark">{displayName}</h1>
      </div>

      {description && (
        <p className="text-brand-text-secondary text-base mb-3">
          {description}
        </p>
      )}

      <div className="flex items-center gap-4 text-brand-muted text-lg">
        <span>{postCount} posts published</span>
        {followersCount !== undefined && followersCount !== null && (
          <>
            <span>•</span>
            <span>{followersCount} followers</span>
          </>
        )}
      </div>
    </div>
  );
}



