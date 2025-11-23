"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MdClose } from 'react-icons/md';
import { isAuthenticated } from '@/utils/auth';
import { createPost, updatePost, getPostById, publishPost } from '@/utils/api/postApi';
import { searchTags, getPopularTags } from '@/utils/api/tagApi';
import 'easymde/dist/easymde.min.css';

// Dynamic import to avoid SSR issues
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPostId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const tagInputRef = useRef(null);

  useEffect(() => {
    const initializePage = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Load popular tags on mount
      loadPopularTags();

      // If editing, load the draft data
      if (editPostId) {
        setIsEditMode(true);
        await loadDraftData(editPostId);
      }

      // Change body background for this page only
      document.body.style.backgroundColor = '#f5f5f5';
    };

    initializePage();

    // Cleanup - restore original background when leaving page
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [router, editPostId]);

  // Load popular tags
  const loadPopularTags = async () => {
    const result = await getPopularTags(20);
    if (result.success && result.data) {
      setTagSuggestions(result.data);
    }
  };

  // Load draft data for editing
  const loadDraftData = async (postId) => {
    try {
      const result = await getPostById(postId);
      if (result.success && result.data) {
        const post = result.data;
        setEditingPost(post);
        setTitle(post.title || '');
        setContent(post.content || '');
        setSelectedTags(post.tags || []);
        setCoverImage(post.coverImage || null);
      } else {
        setErrors({ submit: 'Failed to load draft for editing' });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      setErrors({ submit: 'Failed to load draft for editing' });
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
      return;
    }

    if (selectedTags.includes(tagName)) {
      return; // Silently ignore if already added
    }

    const newTags = [...selectedTags, tagName];
    setSelectedTags(newTags);
    setTagInput('');
    
    // Clear tags error if it exists
    if (errors.tags) {
      setErrors({ ...errors, tags: null });
    }
    
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Title validation (30-300 characters)
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 30) {
      newErrors.title = `Title must be at least 30 characters (currently ${title.trim().length})`;
    } else if (title.trim().length > 300) {
      newErrors.title = `Title must be maximum 300 characters (currently ${title.trim().length})`;
    }

    // Content validation (minimum 300 characters)
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.trim().length < 300) {
      newErrors.content = `Content must be at least 300 characters (currently ${content.trim().length})`;
    }

    // Tags validation (exactly 4 tags required)
    if (selectedTags.length === 0) {
      newErrors.tags = 'Please add at least 4 tags';
    } else if (selectedTags.length < 4) {
      newErrors.tags = `Please add ${4 - selectedTags.length} more tag(s) (${selectedTags.length}/4)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    // Validate form
    if (!validateForm()) {
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

      // Call API - create or update based on mode
      let result;
      if (isEditMode && editingPost) {
        // First update the draft content, then publish it
        await updatePost(editingPost.id, {
          title: postData.title,
          content: postData.content,
          coverImageUrl: postData.coverImageUrl
        });

        // Then publish the updated draft
        result = await publishPost(editingPost.id);
      } else {
        result = await createPost(postData);
      }

      if (result.success) {
        // Redirect to the post using ID
        const postId = isEditMode ? editingPost.id : result.data?.id;
        if (postId) {
          router.push(`/post/${postId}`);
        } else {
          router.push('/');
        }
      } else {
        setErrors({ submit: result.message || `Failed to ${isEditMode ? 'update' : 'create'} post` });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} post:`, error);
      setErrors({ submit: `Failed to ${isEditMode ? 'update' : 'create'} post. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    // For draft, only title is required
    if (!title.trim()) {
      setErrors({ title: 'Title is required to save draft' });
      return;
    }

    if (title.trim().length < 30) {
      setErrors({ title: `Title must be at least 30 characters (currently ${title.trim().length})` });
      return;
    }

    if (title.trim().length > 300) {
      setErrors({ title: `Title must be maximum 300 characters (currently ${title.trim().length})` });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Create post data as draft
      const postData = {
        title: title.trim(),
        content: content.trim() || '',
        tags: selectedTags, // Use selected tags array
        coverImageUrl: coverImage || null,
        publishNow: false // Save as draft
      };

      // Call API - create or update based on mode
      let result;
      if (isEditMode && editingPost) {
        result = await updatePost(editingPost.id, {
          title: postData.title,
          content: postData.content,
          coverImageUrl: postData.coverImageUrl,
          publishNow: false
        });
      } else {
        result = await createPost(postData);
      }

      if (result.success) {
        router.push('/drafts');
      } else {
        setErrors({ submit: result.message || 'Failed to save draft' });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrors({ submit: 'Failed to save draft. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Help content for each section
  const helpContent = {
    title: {
      title: "Writing a Great Title",
      tips: [
        "Keep it between 30-300 characters",
        "Make it descriptive and engaging",
        "Use clear, concise language",
        "Avoid clickbait or misleading titles",
        "Include relevant keywords"
      ]
    },
    tags: {
      title: "Adding Tags",
      tips: [
        "Add exactly 4 tags to your post",
        "Use existing tags when possible",
        "Create new tags if needed",
        "Tags help others find your content",
        "Choose relevant and specific tags"
      ]
    },
    content: {
      title: "Editor Basics",
      tips: [
        "Use Markdown to write and format posts",
        "Minimum 300 characters required",
        "Embed rich content (Tweets, YouTube, etc.)",
        "Add images with drag and drop",
        "Use code blocks for syntax highlighting"
      ],
      markdown: [
        "**bold text** - Bold",
        "*italic text* - Italic",
        "# Heading 1",
        "## Heading 2",
        "[link text](url) - Links",
        "![alt text](image-url) - Images",
        "`code` - Inline code",
        "```language\\ncode block\\n``` - Code blocks"
      ]
    },
    coverImage: {
      title: "Cover Image",
      tips: [
        "Upload an eye-catching cover image",
        "Recommended size: 1200x600px",
        "Supports: JPG, PNG, GIF",
        "Optional but recommended",
        "Drag and drop to upload"
      ]
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
              <h1 className="text-base font-semibold text-brand-dark">
                {isEditMode ? 'Edit Draft' : 'Create Post'}
              </h1>
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
      <main className="flex-1 flex relative">
        {/* Left Content Area - Full Width */}
        <div className="flex-2 ps-16 py-8">
          <div className="max-w-[900px] bg-white rounded-lg p-12">
            {!isPreview ? (
              /* Edit Mode */
              <div className="space-y-6">
              {/* Cover Image */}
              <div className="flex gap-4">
                {!coverImage && (
                <label 
                  className="px-4 py-2 border-2 border-gray-300 rounded-md cursor-pointer hover:border-brand-primary transition-colors text-brand-dark font-medium"
                  onFocus={() => setActiveSection('coverImage')}
                  onClick={() => setActiveSection('coverImage')}
                >
                  Upload Cover Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    onFocus={() => setActiveSection('coverImage')}
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors({ ...errors, title: null });
                  }
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onFocus={() => setActiveSection('title')}
                placeholder="New post title here..."
                className={`w-full text-5xl font-bold text-brand-dark placeholder-gray-400 resize-none border-none outline-none overflow-hidden ${errors.title ? 'border-b-2 border-red-500' : ''}`}
                rows={1}
                style={{ minHeight: '1.2em', maxHeight: '2.4em' }}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1 mb-2">{errors.title}</p>
              )}

              {/* Tags */}
              <div className='mb-2'>
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
                    onFocus={() => {
                      setShowSuggestions(true);
                      setActiveSection('tags');
                    }}
                    onBlur={() => {
                      // Delay to allow click events to fire first
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder={selectedTags.length === 0 ? "Add up to 4 tags..." : "Add another tag..."}
                    className="w-full text-base text-brand-dark placeholder-gray-400 border-none outline-none mb-2"
                  />
                )}

                {selectedTags.length >= 4 && (
                  <p className="text-sm text-green-600 font-medium">✓ All 4 tags added</p>
                )}
              </div>
              
              {/* Tags Error */}
              {errors.tags && (
                <p className="text-red-600 text-sm mb-2">{errors.tags}</p>
              )}
              
              {/* Tag Suggestions Dropdown - Directly below input */}
              {showSuggestions && (tagSuggestions.length > 0 || tagInput.trim().length > 0) && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto mb-4" style={{ maxHeight: '180px' }}>
                  {/* Existing tags */}
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
                  
                  {/* Create new tag option */}
                  {tagInput.trim().length >= 2 && 
                   !tagSuggestions.some(tag => (tag.name || tag).toLowerCase() === tagInput.trim().toLowerCase()) &&
                   !selectedTags.includes(tagInput.trim()) && (
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
                        handleAddTag(tagInput.trim());
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-brand-primary/10 transition-colors border-t border-gray-200"
                    >
                      <span className="text-brand-primary font-medium">
                        Create new tag: <span className="font-bold">#{tagInput.trim()}</span>
                      </span>
                    </button>
                  )}
                  
                  {/* No results message */}
                  {tagSuggestions.filter(tag => !selectedTags.includes(tag.name || tag)).length === 0 && 
                   tagInput.trim().length < 2 && (
                    <div className="px-4 py-2 text-sm text-brand-muted">
                      Type at least 2 characters to create a new tag
                    </div>
                  )}
                </div>
              )}

              {/* Markdown Editor */}
              <div 
                className="markdown-editor"
                onFocus={() => setActiveSection('content')}
                onClick={() => setActiveSection('content')}
              >
                <SimpleMDE
                  key="markdown-editor"
                  value={content}
                  onChange={(value) => {
                    setContent(value);
                    if (errors.content) {
                      setErrors({ ...errors, content: null });
                    }
                  }}
                  options={editorOptions}
                />
              </div>
              
              {/* Content Error */}
              {errors.content && (
                <p className="text-red-600 text-sm mt-2">{errors.content}</p>
              )}
              
              {/* Submit Error */}
              {errors.submit && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}
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

        {/* Right Sidebar - Help Panel Always Visible */}
        <aside className="flex-1 flex items-center">
          <div className="w-full max-w-sm ">
            {activeSection && helpContent[activeSection] ? (
              <div className="">
                <h3 className="text-base font-bold text-brand-dark mb-3">
                  {helpContent[activeSection].title}
                </h3>
                
                <ul className="space-y-1.5 mb-3">
                  {helpContent[activeSection].tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-brand-muted">
                      <span className="text-brand-primary mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>

                {/* Markdown syntax examples */}
                {helpContent[activeSection].markdown && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-semibold text-brand-dark mb-2">
                      ▸ Commonly used syntax
                    </h4>
                    <div className="space-y-1">
                      {helpContent[activeSection].markdown.map((syntax, index) => (
                        <code key={index} className="block text-xs bg-gray-50 p-1.5 rounded text-brand-dark">
                          {syntax}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-brand-muted text-center">
                  Click on any field to see helpful tips
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Action Buttons - Absolute Position Top Right */}
        <div className="absolute right-0 top-6 w-64 z-10">
          <div className="p-4">
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className={`w-full px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold rounded-lg transition-colors mb-3 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update & Publish' : 'Publish')}
            </button>
            <button
              onClick={handleSaveDraft}
              className="w-full px-6 py-3 bg-white border border-gray-200 text-brand-dark hover:bg-gray-100 font-medium rounded-lg transition-colors"
            >
              Save draft
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

