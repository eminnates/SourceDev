import PostFeed from '@/components/PostFeed/PostFeed';
import { getForYouPosts } from '@/utils/api/postApi';

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'For You | SourceDev',
  description: 'Personalized posts based on your interests',
};

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
