import Link from 'next/link';

export default function InternalPostLinks({
  title = 'Öne çıkan yazılar',
  posts = [],
  maxLinks = 10,
}) {
  const safePosts = Array.isArray(posts) ? posts : [];

  const unique = [];
  const seen = new Set();

  for (const post of safePosts) {
    const key = post?.slug || post?.id;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(post);
    if (unique.length >= maxLinks) break;
  }

  if (unique.length === 0) return null;

  return (
    <section className="mt-8 bg-white border border-brand-muted/20 rounded-lg p-4">
      <h2 className="text-base font-semibold text-brand-dark mb-3">{title}</h2>
      <ul className="space-y-2">
        {unique.map((post) => {
          const href = `/post/${post.slug || post.id}`;
          return (
            <li key={post.id || post.slug}>
              <Link
                href={href}
                className="text-sm text-brand-primary hover:text-brand-primary-dark hover:underline"
              >
                {post.title || href}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
