import PostFeed from '@/components/PostFeed/PostFeed';
import { getForYouPosts } from '@/utils/api/postApi';
import { buildLocalizedMetadata } from '@/utils/seo';

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateMetadata({ searchParams }) {
  return buildLocalizedMetadata({
    searchParams,
    pathname: '/for-you',
    titleEn: 'For you',
    titleTr: 'Size özel',
    descriptionEn: 'Explore a personalized feed of software content curated from your interests on SourceDev.',
    descriptionTr: 'İlgi alanlarınıza göre derlenen kişiselleştirilmiş yazılım akışını SourceDev üzerinde keşfedin.',
  });
}

export default async function ForYouPage() {
  let initialPosts = null;
  try {
    const result = await getForYouPosts(1, 20);
    if (result.success) {
      initialPosts = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch for-you posts:', error);
  }

  return <PostFeed initialPosts={initialPosts} defaultTab="home" defaultSubTab="foryou" />;
}
