import { getPostById } from '@/utils/api/postApi';
import { redirect } from 'next/navigation';

// This page handles old /post/[id] URLs and redirects to /post/[slug]
// for backward compatibility and SEO (301 redirect)

export default async function PostRedirectPage({ params }) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  // If it's not a number, it might already be a slug - let it 404 naturally
  if (isNaN(postId)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-text mb-2">Post Not Found</h1>
          <p className="text-brand-muted">The post you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  // Fetch the post to get its slug
  const result = await getPostById(postId);

  if (result.success && result.data && result.data.slug) {
    // Permanent redirect (301) to the slug-based URL
    redirect(`/post/${result.data.slug}`);
  }

  // If post not found or no slug, show error
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-text mb-2">Post Not Found</h1>
        <p className="text-brand-muted">The post you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    </div>
  );
}

