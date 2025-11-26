import PostFeed from '@/components/PostFeed/PostFeed';
import LeftSidebar from '@/components/Sidebar/LeftSidebar';
import DiscussSection from '@/components/Sidebar/DiscussSection';

export const metadata = {
  title: "Latest Posts - SourceDev",
  description: "Discover the latest posts from the SourceDev community",
};

export default function LatestPage() {
  return (
    <div className="min-h-screen bg-brand-background flex justify-center">
      <main className="mx-4 md:mx-8 lg:mx-16 px-4 py-4 w-full">
        <div className="flex gap-4">
          {/* Left Sidebar with Discuss Section */}
          <div className="hidden lg:block w-80 flex-shrink-0 space-y-4">
            <DiscussSection />
            <LeftSidebar />

          </div>

          {/* Main Content - Post Feed */}
          <div className="flex-1 max-w-4xl">
            <PostFeed defaultTab="latest" />
          </div>
        </div>
      </main>
    </div>
  );
}

