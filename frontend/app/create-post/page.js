"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MdClose } from 'react-icons/md';
import { isAuthenticated } from '@/utils/auth';
import { createPost } from '@/utils/api/postApi';
import { searchTags, getPopularTags } from '@/utils/api/tagApi';
import 'easymde/dist/easymde.min.css';

// Dynamic import to avoid SSR issues
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const tagInputRef = useRef(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
    }

    // Load popular tags on mount
    loadPopularTags();

    // Change body background for this page only
    document.body.style.backgroundColor = '#f5f5f5';
    
    // Cleanup - restore original background when leaving page
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [router]);

  // Load popular tags
  const loadPopularTags = async () => {
    const result = await getPopularTags(20);
    if (result.success && result.data) {
      setTagSuggestions(result.data);
    }
  };

  // Search tags as user types
  useEffect(() => {
    const searchTagsDebounced = async () => {
      if (tagInput.trim().length === 0) {
        loadPopularTags();
        return;
      }

      if (tagInput.trim().length < 2) {
        return;
      }

      const result = await searchTags(tagInput, 10);
      if (result.success && result.data) {
        setTagSuggestions(result.data);
      }
    };

    const timeoutId = setTimeout(searchTagsDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [tagInput]);

  // Handle tag selection
  const handleAddTag = (tagName) => {
    if (selectedTags.length >= 4) {
      alert('Maximum 4 tags allowed');
      return;
    }

    if (selectedTags.includes(tagName)) {
      return; // Silently ignore if already added
    }

    const newTags = [...selectedTags, tagName];
    setSelectedTags(newTags);
    setTagInput('');
    
    // If we've reached 4 tags, close suggestions
    if (newTags.length >= 4) {
      setShowSuggestions(false);
    } else {
      // Keep suggestions open and refocus input
      setTimeout(() => {
        tagInputRef.current?.focus();
        setShowSuggestions(true);
      }, 0);
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagName) => {
    setSelectedTags(selectedTags.filter(t => t !== tagName));
  };

  // Handle Enter key on tag input
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedInput = tagInput.trim();
      
      if (trimmedInput.length > 0) {
        handleAddTag(trimmedInput);
      }
    }
  };

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
      // Create post data
      const postData = {
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags, // Use selected tags array
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
      // Create post data as draft
      const postData = {
        title: title.trim(),
        content: content.trim() || '',
        tags: selectedTags, // Use selected tags array
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
      {/* Header - Fixed - Matching Navbar */}
      <header className="bg-white border-b border-brand-muted/30 flex-shrink-0">
        <div className="w-full px-3">
          <div className="flex items-center justify-between h-14 mx-16">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-2">
              <Link href="/" className="text-2xl font-bold text-brand-dark hover:text-brand-primary transition-colors">
                SourceDev
              </Link>
              <span className="text-brand-muted">|</span>
              <h1 className="text-base font-semibold text-brand-dark">Create Post</h1>
            </div>

            {/* Right: Edit/Preview + Close */}
            <div className="flex items-center gap-3">
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
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

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
              <div>
                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-medium"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <MdClose className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                {selectedTags.length < 4 && (
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      // Delay to allow click events to fire first
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder={selectedTags.length === 0 ? "Add up to 4 tags..." : "Add another tag..."}
                    className="w-full text-base text-brand-dark placeholder-gray-400 border-none outline-none mb-3"
                  />
                )}

                {selectedTags.length >= 4 && (
                  <p className="text-sm text-brand-muted italic mb-3">Maximum 4 tags reached</p>
                )}
              </div>

              {/* Tag Suggestions Dropdown - Between Tags and Editor */}
              {showSuggestions && tagSuggestions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto mb-4" style={{ maxHeight: '180px' }}>
                  {tagSuggestions
                    .filter(tag => !selectedTags.includes(tag.name || tag)) // Filter out already selected tags
                    .slice(0, 10)
                    .map((tag, index) => (
                      <button
                        key={index}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          handleAddTag(tag.name || tag);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-brand-dark font-medium">#{tag.name || tag}</span>
                      </button>
                    ))}
                </div>
              )}

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

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-md text-sm font-medium"
                      >
                        #{tag}
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

