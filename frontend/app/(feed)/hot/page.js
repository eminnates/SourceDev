import PostFeed from '@/components/PostFeed/PostFeed';
import { getHotPosts } from '@/utils/api/postApi';
import { buildLocalizedMetadata } from '@/utils/seo';

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateMetadata({ searchParams }) {
  return buildLocalizedMetadata({
    searchParams,
    pathname: '/hot',
    titleEn: 'Hot posts',
    titleTr: 'Popüler yazılar',
    descriptionEn: 'Discover the most discussed and trending software posts on SourceDev right now.',
    descriptionTr: 'SourceDev üzerinde şu anda en çok konuşulan ve trend olan yazılım yazılarını keşfedin.',
  });
}

export default async function HotPage() {
  let initialPosts = null;
  try {
    const result = await getHotPosts(1, 20);
    if (result.success) {
      initialPosts = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch hot posts:', error);
  }

  return <PostFeed initialPosts={initialPosts} defaultTab="hot" />;
}
