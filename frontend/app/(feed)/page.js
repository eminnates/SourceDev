import PostFeed from '@/components/PostFeed/PostFeed';
import { getRelevantPosts } from '@/utils/api/postApi';

export default async function Home() {
  let initialPosts = null;
  try {
    const result = await getRelevantPosts(1, 10);
    if (result.success) {
      initialPosts = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch initial posts:', error);
  }

  return <PostFeed initialPosts={initialPosts} defaultTab="home" />;
}
