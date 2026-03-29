import { redirect } from 'next/navigation';
import { getPostBySlug, getPostById, getLatestPosts } from '@/utils/api/postApi';
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
export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const { lang } = await searchParams || {};
  const activeLang = lang || 'tr';

  if (!slug) return { title: 'Post Not Found' };

  const result = await getPostBySlug(slug);

  if (result.success && result.data) {
    const post = result.data;

    // Pick the active translation's content for metadata
    let title = post.title;
    let description = post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 160) || 'SourceDev makalesini oku';

    if (activeLang !== 'tr' && post.translations) {
      const translation = post.translations.find(t => t.languageCode === activeLang);
      if (translation) {
        title = translation.title || post.title;
        const raw = (translation.contentMarkdown || translation.content || '').replace(/<[^>]*>/g, '').replace(/[#*`_~]/g, '');
        description = raw.substring(0, 160) || description;
      }
    }

    // hreflang alternates — one entry per available translation
    const languages = {};
    if (post.translations?.length > 0) {
      post.translations.forEach(t => {
        languages[t.languageCode] = t.languageCode === 'tr'
          ? `${SITE_URL}/post/${slug}`
          : `${SITE_URL}/post/${slug}?lang=${t.languageCode}`;
      });
    }

    const canonicalUrl = activeLang === 'tr'
      ? `${SITE_URL}/post/${slug}`
      : `${SITE_URL}/post/${slug}?lang=${activeLang}`;

    const ogLocale = activeLang === 'en' ? 'en_US' : 'tr_TR';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        locale: ogLocale,
        images: post.coverImageUrl ? [{ url: post.coverImageUrl, width: 1200, height: 630, alt: title }] : [],
        type: 'article',
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: post.author?.username ? [`${SITE_URL}/user/${post.author.username}`] : [],
        tags: post.tags?.map(t => t.name) || [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: post.coverImageUrl ? [post.coverImageUrl] : [],
      },
      alternates: {
        canonical: canonicalUrl,
        ...(Object.keys(languages).length > 0 && { languages }),
      },
    };
  }

  return { title: 'Post Not Found' };
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
    wordCount: post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : undefined,
    articleSection: post.tags?.[0]?.name || undefined,
  };
}

function generateBreadcrumbJsonLd(post) {
  const firstTag = post.tags?.[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL },
      firstTag
        ? { '@type': 'ListItem', position: 2, name: `#${firstTag.name}`, item: `${SITE_URL}/tag/${firstTag.name}` }
        : { '@type': 'ListItem', position: 2, name: 'Yazılar', item: `${SITE_URL}/latest` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/post/${post.slug}` },
    ],
  };
}

export default async function PostDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const { lang } = await searchParams || {};
  const activeLang = lang || 'tr';

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

  // Numeric ID → redirect to slug-based URL (backward compatibility)
  const numericId = parseInt(slug, 10);
  if (!isNaN(numericId) && String(numericId) === slug) {
    const idResult = await getPostById(numericId);
    if (idResult.success && idResult.data?.slug) {
      redirect(`/post/${idResult.data.slug}`);
    }
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

  // Apply translation server-side so Google sees the correct language content
  let renderedPost = post;
  if (activeLang !== 'tr' && post.translations) {
    const translation = post.translations.find(t => t.languageCode === activeLang);
    if (translation) {
      renderedPost = {
        ...post,
        title: translation.title || post.title,
        content: translation.contentMarkdown || translation.content || post.content,
        contentMarkdown: translation.contentMarkdown || translation.content || post.contentMarkdown,
      };
    }
  }

  const jsonLd = generateArticleJsonLd(renderedPost);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(renderedPost);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PostDetailClient initialPost={renderedPost} initialLanguage={activeLang} />
    </>
  );
}
