import { getPostBySlug, getLatestPosts } from '@/utils/api/postApi';
import PostDetailClient from './PostDetailClient';

const SITE_URL = 'https://sourcedev.tr';

// Generate static params for popular posts (improves SEO crawling)
export async function generateStaticParams() {
  try {
    const result = await getLatestPosts(1, 100);
    if (result.success && result.data) {
      return result.data
        .filter((post) => post.slug)
        .map((post) => ({
          slug: post.slug,
        }));
    }
  } catch (error) {
    console.error('Failed to generate static params:', error);
  }
  return [];
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  if (!slug) {
    return {
      title: 'Post Not Found',
    };
  }

  const result = await getPostBySlug(slug);
  
  if (result.success && result.data) {
    const post = result.data;
    const description = post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 160) || 'SourceDev makalesini oku';
    
    return {
      title: post.title,
      description: description,
      openGraph: {
        title: post.title,
        description: description,
        url: `${SITE_URL}/post/${slug}`,
        images: post.coverImageUrl ? [{ url: post.coverImageUrl, width: 1200, height: 630, alt: post.title }] : [],
        type: 'article',
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: post.author?.username ? [`${SITE_URL}/user/${post.author.username}`] : [],
        tags: post.tags?.map(t => t.name) || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: description,
        images: post.coverImageUrl ? [post.coverImageUrl] : [],
      },
      alternates: {
        canonical: `${SITE_URL}/post/${slug}`,
      },
    };
  }

  return {
    title: 'Post Not Found',
  };
}

// JSON-LD Structured Data for Article
function generateArticleJsonLd(post) {
  const authorName = post.authorDisplayName || post.author?.displayName || post.author?.username || post.author || 'SourceDev User';
  const authorUsername = post.author?.username || post.author || null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 160),
    image: post.coverImageUrl || `${SITE_URL}/og-image.png`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUsername ? `${SITE_URL}/user/${authorUsername}` : SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SourceDev',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512x512.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/post/${post.slug}`,
    },
    keywords: post.tags?.map(t => t.name).join(', '),
  };
}

export default async function PostDetailPage({ params }) {
  const { slug } = await params;

  if (!slug) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-text mb-2">Invalid Post</h1>
          <p className="text-brand-muted">The post slug provided is invalid.</p>
        </div>
      </div>
    );
  }

  // Fetch data on the server
  const result = await getPostBySlug(slug);

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

  const post = result.data;
  const jsonLd = generateArticleJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostDetailClient initialPost={post} />
    </>
  );
}
