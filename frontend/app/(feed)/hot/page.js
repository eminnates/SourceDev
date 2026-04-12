import PostFeed from '@/components/PostFeed/PostFeed';
import { getHotPosts } from '@/utils/api/postApi';

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Hot Posts',
  description: 'Discover the hottest and most popular posts on SourceDev right now. Trending articles from the developer community.',
};

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
