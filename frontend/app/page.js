import PostFeed from '@/components/PostFeed/PostFeed';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-background flex justify-center">
      <main className="mx-16 px-4 py-4 w-full">
        <div className="flex gap-4 ">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-brand-muted/20 p-4">
              <h3 className="font-bold text-brand-dark mb-3">Left Sidebar</h3>
              <p className="text-sm text-brand-muted">Content coming soon...</p>
            </div>
          </aside>

          {/* Main Content - Post Feed */}
          <div className="flex-1 w-full">
            <PostFeed />
          </div>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg border border-brand-muted/20 p-4 mb-4">
              <h3 className="font-bold text-brand-dark mb-3">Right Sidebar</h3>
              <p className="text-sm text-brand-muted">Content coming soon...</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
