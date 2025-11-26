"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PostCard from '@/components/Post/PostCard';
import LeftSidebar from '@/components/Sidebar/LeftSidebar';
import DiscussSection from '@/components/Sidebar/DiscussSection';
import { getUserDrafts, publishPost } from '@/utils/api/postApi';
import { isAuthenticated } from '@/utils/auth';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchDrafts();
  }, [router]);

  const fetchDrafts = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getUserDrafts(1, 50); // Get more drafts for the dedicated page
      console.log('Drafts:', result);
      if (result.success && result.data) {
        setDrafts(result.data);
      } else {
        setError(result.message || 'Failed to load drafts');
        setDrafts([]);
      }
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError('Failed to load drafts');
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishDraft = async (draftId) => {
    setPublishingId(draftId);

    try {
      const result = await publishPost(draftId);

      if (result.success) {
        // Remove the published draft from the list
        setDrafts(drafts.filter(draft => draft.id !== draftId));
      } else {
        setError(result.message || 'Failed to publish draft');
      }
    } catch (err) {
      console.error('Error publishing draft:', err);
      setError('Failed to publish draft');
    } finally {
      setPublishingId(null);
    }
  };

  const handleEditDraft = (draftId) => {
    router.push(`/create-post?edit=${draftId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex justify-center">
        <main className="mx-16 px-4 py-4 w-full">
          <div className="flex gap-4">
            {/* Left Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0 space-y-4">
              <DiscussSection />
              <LeftSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                  <p className="text-brand-muted">Loading your drafts...</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-background flex justify-center">
        <main className="mx-16 px-4 py-4 w-full">
          <div className="flex gap-4">
            {/* Left Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0 space-y-4">
              <DiscussSection />
              <LeftSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-red-600 mb-2">Error loading drafts</p>
                <p className="text-brand-muted">{error}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background flex justify-center">
      <main className="mx-16 px-4 py-4 w-full">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0 space-y-4">
            <DiscussSection />
            <LeftSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-brand-dark mb-2">My Drafts</h1>
              <p className="text-brand-muted">Manage your unpublished posts</p>
            </div>

            {/* Drafts List */}
            {drafts.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-brand-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">No drafts yet</h3>
                <p className="text-brand-muted mb-4">Start writing and save your posts as drafts to continue later</p>
                <Link
                  href="/create-post"
                  className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors"
                >
                  Create Your First Draft
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft, index) => (
                  <div key={draft.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-brand-dark mb-2 line-clamp-2">
                          {draft.title || 'Untitled Draft'}
                        </h3>
                        {draft.tags && draft.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {draft.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-md text-xs font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditDraft(draft.id)}
                          className="px-4 py-2 bg-gray-100 text-brand-dark rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePublishDraft(draft.id)}
                          disabled={publishingId === draft.id}
                          className={`px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors text-sm font-medium ${
                            publishingId === draft.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {publishingId === draft.id ? 'Publishing...' : 'Publish'}
                        </button>
                      </div>
                    </div>

                    {draft.contentMarkdown && (
                      <div className="text-brand-muted text-sm line-clamp-3">
                        {draft.contentMarkdown.replace(/[#*`]/g, '').substring(0, 200)}
                        {draft.contentMarkdown.length > 200 && '...'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
