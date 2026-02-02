import PostFeed from '@/components/PostFeed/PostFeed';
import { getHotPosts } from '@/utils/api/postApi';

export const metadata = {
  title: 'Hot Posts | SourceDev',
  description: 'Discover the hottest posts right now',
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
