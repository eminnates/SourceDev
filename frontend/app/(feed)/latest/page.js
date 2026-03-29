import PostFeed from '@/components/PostFeed/PostFeed';
import { getLatestPosts } from '@/utils/api/postApi';
import InternalPostLinks from '@/components/SEO/InternalPostLinks';

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "Latest Posts - SourceDev",
  description: "Discover the latest posts from the SourceDev community",
};

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

