import PostFeed from '@/components/PostFeed/PostFeed';
import { getRelevantPosts } from '@/utils/api/postApi';

// Disable caching for feed pages - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Ana Sayfa',
  description: 'En güncel yazılım makaleleri, projeler ve tartışmalar. Yazılımcı topluluğuna katıl.',
  openGraph: {
    title: 'SourceDev - Yazılımcı Topluluğu',
    description: 'En güncel yazılım makaleleri, projeler ve tartışmalar.',
  },
};

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

  return <PostFeed initialPosts={initialPosts} defaultTab="home" />;
}
