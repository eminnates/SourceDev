import PostFeed from '@/components/PostFeed/PostFeed';
import { getLatestPosts } from '@/utils/api/postApi';
import InternalPostLinks from '@/components/SEO/InternalPostLinks';
import { buildLocalizedMetadata } from '@/utils/seo';

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateMetadata({ searchParams }) {
  return buildLocalizedMetadata({
    searchParams,
    pathname: '/latest',
    titleEn: 'Latest posts',
    titleTr: 'En yeni yazılar',
    descriptionEn: 'Discover the latest software posts, technical analysis, and fresh community updates on SourceDev.',
    descriptionTr: 'SourceDev topluluğundaki en yeni yazılım yazılarını, teknik analizleri ve güncel paylaşımları keşfedin.',
  });
}

export default async function LatestPage() {
  let initialPosts = null;
  try {
    const result = await getLatestPosts(1, 20);
    if (result.success) {
      initialPosts = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch initial posts:', error);
  }

  return (
    <>
      <PostFeed initialPosts={initialPosts} defaultTab="latest" />
      <InternalPostLinks
        title="Latest sayfasından yazılar"
        posts={initialPosts}
        maxLinks={12}
      />
    </>
  );
}

