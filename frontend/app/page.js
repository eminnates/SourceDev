import PostFeed from '@/components/PostFeed/PostFeed';
import LeftSidebar from '@/components/Sidebar/LeftSidebar';
import RightSidebar from '@/components/Sidebar/RightSidebar';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-background flex justify-center">
      <main className="mx-16 px-4 py-4 w-full">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <div className="hidden lg:block">
            <LeftSidebar />
          </div>

          {/* Main Content - Post Feed */}
          <div className="flex-1 w-full">
            <PostFeed />
          </div>

          {/* Right Sidebar */}
          <div className="hidden xl:block">
            <RightSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}
