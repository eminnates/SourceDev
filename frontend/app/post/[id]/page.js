import { getPostById } from '@/utils/api/postApi';
import PostDetailClient from './PostDetailClient';

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  
  if (isNaN(postId)) {
    return {
      title: 'Post Not Found',
    };
  }

  const result = await getPostById(postId);
  
  if (result.success && result.data) {
    const post = result.data;
    return {
      title: `${post.title} - SourceDev`,
      description: post.excerpt || post.content?.substring(0, 160) || 'Read this post on SourceDev',
      openGraph: {
        title: post.title,
        description: post.excerpt || post.content?.substring(0, 160),
        images: post.coverImageUrl ? [post.coverImageUrl] : [],
        type: 'article',
        publishedTime: post.publishedAt,
        authors: [post.author],
      },
    };
  }

  return {
    title: 'Post Not Found',
  };
}

export default async function PostDetailPage({ params }) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-text mb-2">Invalid Post ID</h1>
          <p className="text-brand-muted">The post ID provided is invalid.</p>
        </div>
      </div>
    );
  }

  // Fetch data on the server
  const result = await getPostById(postId);

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-text mb-2">Post Not Found</h1>
          <p className="text-brand-muted">{result.message || "The post you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  return <PostDetailClient initialPost={result.data} />;
}

