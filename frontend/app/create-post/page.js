"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MdClose } from 'react-icons/md';
import { isAuthenticated } from '@/utils/auth';
import { createPost } from '@/utils/api/postApi';
import 'easymde/dist/easymde.min.css';

// Dynamic import to avoid SSR issues
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
    }

    // Change body background for this page only
    document.body.style.backgroundColor = '#f5f5f5';
    
    // Cleanup - restore original background when leaving page
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [router]);

  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!content.trim()) {
      alert('Please enter content');
      return;
    }

    setIsLoading(true);
    try {
      // Parse tags
      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t)
        .slice(0, 4); // Maximum 4 tags

      // Create post data
      const postData = {
        title: title.trim(),
        content: content.trim(),
        tags: tagArray,
        coverImageUrl: coverImage || null,
        publishNow: true
      };

      // Call API
      const result = await createPost(postData);

      if (result.success) {
        alert(result.message);
        // Redirect to the created post using ID
        if (result.data?.id) {
          router.push(`/post/${result.data.id}`);
        } else {
          router.push('/');
        }
      } else {
        alert(result.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsLoading(true);
    try {
      // Parse tags
      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t)
        .slice(0, 4); // Maximum 4 tags

      // Create post data as draft
      const postData = {
        title: title.trim(),
        content: content.trim() || '',
        tags: tagArray,
        coverImageUrl: coverImage || null,
        publishNow: false // Save as draft
      };

      // Call API
      const result = await createPost(postData);

      if (result.success) {
        alert('Draft saved successfully!');
        router.push('/');
      } else {
        alert(result.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: 'Write your post content here...',
    status: false,
    autofocus: false,
    autosave: {
      enabled: false,
    },
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      'code',
    ],
  }), []);

  return (
    <div className="h-screen bg-brand-background flex flex-col">
      {/* Header - Fixed */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-block bg-black text-white px-3 py-1.5 rounded-md">
              <span className="text-lg font-bold">SourceDev</span>
            </div>
            <h1 className="text-base font-semibold text-brand-dark">Create Post</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPreview(false)}
              className={`px-4 py-2 text-base font-medium rounded-md transition-colors ${
                !isPreview
                  ? 'text-brand-primary bg-brand-primary/10'
                  : 'text-brand-dark hover:bg-gray-100'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setIsPreview(true)}
              className={`px-4 py-2 text-base font-medium rounded-md transition-colors ${
                isPreview
                  ? 'text-brand-primary bg-brand-primary/10'
                  : 'text-brand-dark hover:bg-gray-100'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 flex">
        {/* Left Content Area */}
        <div className="flex-1 overflow-y-auto px-16 py-8">
          <div className="max-w-[900px] bg-white rounded-lg p-12">
            {!isPreview ? (
              /* Edit Mode */
              <div className="space-y-6">
              {/* Cover Image */}
              <div className="flex gap-4">
                {!coverImage && (
                <label className="px-4 py-2 border-2 border-gray-300 rounded-md cursor-pointer hover:border-brand-primary transition-colors text-brand-dark font-medium">
                  Upload Cover Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="hidden"
                  />
                </label>
                  )}
              </div>

              {coverImage && (
                <div className="relative">
                  <img src={coverImage} alt="Cover" className="w-full h-64 object-cover rounded-lg" />
                  <button
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    <MdClose className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Title */}
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New post title here..."
                className="w-full text-5xl font-bold text-brand-dark placeholder-gray-400 resize-none border-none outline-none"
                rows={1}
              />

              {/* Tags */}
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add up to 4 tags..."
                className="w-full text-base text-brand-dark placeholder-gray-400 border-none outline-none"
              />

              {/* Markdown Editor */}
              <div className="markdown-editor">
                <SimpleMDE
                  key="markdown-editor"
                  value={content}
                  onChange={setContent}
                  options={editorOptions}
                />
              </div>
            </div>
            ) : (
              /* Preview Mode */
              <div className="space-y-6">
                {coverImage && (
                  <img src={coverImage} alt="Cover" className="w-full h-64 object-cover rounded-lg" />
                )}

                <h1 className="text-5xl font-bold text-brand-dark break-words">
                  {title || 'New post title here...'}
                </h1>

                {tags && (
                  <div className="flex flex-wrap gap-2">
                    {tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-brand-dark rounded-md text-sm"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="markdown-preview prose prose-lg max-w-none">
                  {content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-400">Write your post content here...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Action Buttons (Fixed) */}
        <aside className="w-72 flex-shrink-0 p-6">
          <div className="sticky top-6">
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className={`w-full px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold rounded-lg transition-colors mb-3 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Publishing...' : 'Publish'}
            </button>
            <button
              onClick={handleSaveDraft}
              className="w-full px-6 py-3 text-brand-dark hover:bg-gray-100 font-medium rounded-lg transition-colors"
            >
              Save draft
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

