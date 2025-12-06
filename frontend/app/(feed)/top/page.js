import PostFeed from '@/components/PostFeed/PostFeed';
import { getTopPosts } from '@/utils/api/postApi';

export const metadata = {
  title: "Top Posts - SourceDev",
  description: "Explore the most popular posts from the SourceDev community",
};

export default async function TopPage() {
  let initialPosts = null;
  try {
    const result = await getTopPosts(20);
    if (result.success) {
      initialPosts = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch initial posts:', error);
  }

  return <PostFeed initialPosts={initialPosts} defaultTab="top" />;
}

