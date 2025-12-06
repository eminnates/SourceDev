import PostFeed from '@/components/PostFeed/PostFeed';
import { getLatestPosts } from '@/utils/api/postApi';

export const metadata = {
  title: "Latest Posts - SourceDev",
  description: "Discover the latest posts from the SourceDev community",
};

export default async function LatestPage() {
  let initialPosts = null;
  try {
    const result = await getLatestPosts(1, 10);
    if (result.success) {
      initialPosts = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch initial posts:', error);
  }

  return <PostFeed initialPosts={initialPosts} defaultTab="latest" />;
}

