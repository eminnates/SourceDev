import PostFeed from '@/components/PostFeed/PostFeed';
import { getRelevantPosts } from '@/utils/api/postApi';
import InternalPostLinks from '@/components/SEO/InternalPostLinks';
import { buildLocalizedMetadata } from '@/utils/seo';

// Disable caching for feed pages - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateMetadata({ searchParams }) {
  return buildLocalizedMetadata({
    searchParams,
    pathname: '/',
    titleEn: 'Home feed',
    titleTr: 'Ana akış',
    descriptionEn: 'Discover the newest software articles, projects, and community discussions on SourceDev.',
    descriptionTr: 'SourceDev üzerindeki en yeni yazılım yazılarını, projeleri ve topluluk tartışmalarını keşfedin.',
  });
}

export default async function Home() {
  let initialPosts = null;
  try {
    const result = await getRelevantPosts(1, 20);
    if (result.success) {
      initialPosts = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch initial posts:', error);
  }

  return (
    <>
      <PostFeed initialPosts={initialPosts} defaultTab="home" />
      <InternalPostLinks
        title="Ana sayfadan öne çıkan yazılar"
        posts={initialPosts}
        maxLinks={12}
      />
    </>
  );
}
