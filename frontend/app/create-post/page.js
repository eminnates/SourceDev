"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MdClose } from 'react-icons/md';
import { isAuthenticated } from '@/utils/auth';
import { createPost, updatePost, getPostById, getPostForEdit, publishPost, deletePost } from '@/utils/api/postApi';
import { searchTags, getPopularTags } from '@/utils/api/tagApi';
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

function CreatePostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPostId = searchParams.get('edit');

  const [translations, setTranslations] = useState({
    tr: { title: '', content: '' },
    en: { title: '', content: '' }
  });
  const [activeLang, setActiveLang] = useState('tr');
  
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const tagInputRef = useRef(null);
  const titleTextareaRef = useRef(null);

  useEffect(() => {
    const initializePage = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      loadPopularTags();

      if (editPostId) {
        setIsEditMode(true);
        await loadDraftData(editPostId);
      }

      document.body.style.backgroundColor = '#f5f5f5';
    };

    initializePage();

    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [router, editPostId]);

  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = titleTextareaRef.current.scrollHeight + 'px';
    }
  }, [translations[activeLang].title]);

  const loadPopularTags = async () => {
    const result = await getPopularTags(20);
    if (result.success && result.data) {
      setTagSuggestions(result.data);
    }
  };

  const loadDraftData = async (postId) => {
    try {
      const result = await getPostForEdit(postId);
      if (result.success && result.data) {
        const post = result.data;
        setEditingPost(post);
        
        const newTranslations = {
          tr: { title: '', content: '' },
          en: { title: '', content: '' }
        };
        
        if (post.translations && post.translations.length > 0) {
          post.translations.forEach(t => {
            if (newTranslations[t.languageCode]) {
              newTranslations[t.languageCode] = {
                title: t.title || '',
                content: t.contentMarkdown || t.content || ''
              };
            }
          });
        } else {
          newTranslations.tr = { 
            title: post.title || '', 
            content: post.contentMarkdown || post.content || '' 
          };
        }
        
        setTranslations(newTranslations);
        setSelectedTags(post.tags || []);
        setCoverImage(post.coverImage || null);
      } else {
        setErrors({ submit: result.message || 'Failed to load draft' });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      setErrors({ submit: 'An unexpected error occurred.' });
    }
  };

  useEffect(() => {
    const searchTagsDebounced = async () => {
      if (tagInput.trim().length === 0) {
        loadPopularTags();
        return;
      }

      if (tagInput.trim().length < 2) return;

      const result = await searchTags(tagInput, 10);
      if (result.success && result.data) {
        setTagSuggestions(result.data);
      }
    };

    const timeoutId = setTimeout(searchTagsDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [tagInput]);

  const handleAddTag = (tagName) => {
    if (selectedTags.length >= 4 || selectedTags.includes(tagName)) return;

    const newTags = [...selectedTags, tagName];
    setSelectedTags(newTags);
    setTagInput('');

    if (errors.tags) {
      setErrors({ ...errors, tags: null });
    }

    if (newTags.length >= 4) {
      setShowSuggestions(false);
    } else {
      setTimeout(() => {
        tagInputRef.current?.focus();
        setShowSuggestions(true);
      }, 0);
    }
  };

  const handleRemoveTag = (tagName) => {
    setSelectedTags(selectedTags.filter(t => t !== tagName));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedInput = tagInput.trim();
      if (trimmedInput.length > 0) {
        handleAddTag(trimmedInput);
      }
    }
  };

  const handleLanguageChange = (lang) => {
    setActiveLang(lang);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTranslations(prev => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], title: newTitle }
    }));
    
    if (errors.title) {
      setErrors({ ...errors, title: null });
    }
  };

  const handleContentChange = (newContent) => {
    setTranslations(prev => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], content: newContent }
    }));
    
    if (errors.content) {
      setErrors({ ...errors, content: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate BOTH languages
    ['tr', 'en'].forEach(lang => {
      const t = translations[lang];
      
      // TR is mandatory, EN is optional but if filled must be valid
      if (lang === 'tr') {
        if (!t.title.trim()) {
          newErrors[`title_${lang}`] = `Turkish title is required`;
        } else if (t.title.trim().length < 5) {
          newErrors[`title_${lang}`] = `Turkish title must be at least 5 characters`;
        } else if (t.title.trim().length > 300) {
          newErrors[`title_${lang}`] = `Turkish title must be max 300 characters`;
        }

        if (!t.content.trim()) {
          newErrors[`content_${lang}`] = `Turkish content is required`;
        } else if (t.content.trim().length < 10) {
          newErrors[`content_${lang}`] = `Turkish content must be at least 10 characters`;
        }
      } else if (lang === 'en') {
        // EN is optional, but if title exists, content must exist too
        if (t.title.trim() && !t.content.trim()) {
          newErrors[`content_${lang}`] = `English content required if title is provided`;
        }
        if (t.content.trim() && !t.title.trim()) {
          newErrors[`title_${lang}`] = `English title required if content is provided`;
        }
      }
    });

    // Show error on current language if exists
    if (newErrors[`title_${activeLang}`]) {
      newErrors.title = newErrors[`title_${activeLang}`];
    }
    if (newErrors[`content_${activeLang}`]) {
      newErrors.content = newErrors[`content_${activeLang}`];
    }

    // Tags validation
    if (selectedTags.length === 0) {
      newErrors.tags = 'Please add at least 4 tags';
    } else if (selectedTags.length < 4) {
      newErrors.tags = `Please add ${4 - selectedTags.length} more tag(s) (${selectedTags.length}/4)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const postData = {
        translations: [
          { languageCode: 'tr', ...translations.tr },
          { languageCode: 'en', ...translations.en }
        ].filter(t => t.title.trim() && t.content.trim()), // Only send filled translations
        defaultLanguageCode: 'tr',
        tags: selectedTags,
        coverImageUrl: coverImage || null,
        publishNow: true
      };

      let result;
      if (isEditMode && editingPost) {
        await updatePost(editingPost.id, postData);
        result = await publishPost(editingPost.id);
      } else {
        result = await createPost(postData);
      }

      if (result.success) {
        const postId = isEditMode ? editingPost.id : result.data?.id;
        router.push(postId ? `/post/${postId}` : '/');
      } else {
        setErrors({ submit: result.message || 'Failed to publish' });
      }
    } catch (error) {
      console.error('Error publishing:', error);
      setErrors({ submit: 'Failed to publish. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!translations.tr.title.trim()) {
      setErrors({ title: 'Turkish title is required to save draft' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const postData = {
        translations: [
          { languageCode: 'tr', ...translations.tr },
          { languageCode: 'en', ...translations.en }
        ].filter(t => t.title.trim() || t.content.trim()),
        defaultLanguageCode: 'tr',
        tags: selectedTags,
        coverImageUrl: coverImage || null,
        publishNow: false
      };

      let result;
      if (isEditMode && editingPost) {
        result = await updatePost(editingPost.id, postData);
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

  const handleDelete = () => {
    if (!editingPost) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setIsLoading(true);

    try {
      const result = await deletePost(editingPost.id);
      if (result.success) {
        router.push('/');
      } else {
        setErrors({ submit: result.message || 'Failed to delete post' });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setErrors({ submit: 'Failed to delete post. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const helpContent = {
    title: {
      title: "Writing a Great Title",
      tips: [
        "Keep it between 5-300 characters",
        "Make it descriptive and engaging",
        "Turkish title is mandatory",
        "English translation is optional"
      ]
    },
    tags: {
      title: "Adding Tags",
      tips: [
        "Add exactly 4 tags to your post",
        "Use existing tags when possible",
        "Tags help others find your content"
      ]
    },
    content: {
      title: "Editor Basics",
      tips: [
        "Use Markdown to format posts",
        "Minimum 10 characters required",
        "Turkish content is mandatory"
      ]
    },
    coverImage: {
      title: "Cover Image",
      tips: [
        "Upload an eye-catching cover image",
        "Recommended size: 1200x600px",
        "Optional but recommended"
      ]
    }
  };

  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: `Write your ${activeLang === 'tr' ? 'Turkish' : 'English'} content here...`,
    status: false,
    autofocus: false,
    toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'image', 'code'],
  }), [activeLang]);

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <header className="bg-white border-b border-brand-muted/30 flex-shrink-0">
        <div className="w-full px-3">
          <div className="flex items-center justify-between h-14 mx-auto sm:mx-16">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-2xl font-bold text-brand-dark hover:text-brand-primary transition-colors">
                SourceDev
              </Link>
              <span className="text-brand-muted">|</span>
              <h1 className="text-base font-semibold text-brand-dark">
                {isEditMode ? 'Edit Draft' : 'Create Post'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPreview(false)}
                className={`px-4 py-2 text-base font-medium rounded-md transition-colors ${!isPreview ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-dark hover:bg-gray-100'}`}
              >
                Edit
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className={`px-4 py-2 text-base font-medium rounded-md transition-colors ${isPreview ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-dark hover:bg-gray-100'}`}
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
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row relative">
        <div className="w-full lg:flex-[2] lg:ps-16 py-8 px-4 lg:px-0">
          <div className="max-w-[900px] bg-white rounded-lg p-6 lg:p-12 mx-auto">
            {!isPreview ? (
              <div className="space-y-6">
                {/* Cover Image */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-brand-dark">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/cover.jpg"
                    value={coverImage || ''}
                    onChange={(e) => setCoverImage(e.target.value)}
                    onFocus={() => setActiveSection('coverImage')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {coverImage && (
                  <div className="relative">
                    <img src={coverImage} alt="Cover" className="w-full h-64 object-cover rounded-lg" />
                    <button
                      onClick={() => setCoverImage(null)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Language Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleLanguageChange('tr')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeLang === 'tr' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🇹🇷 Turkish {translations.tr.title && '✓'}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeLang === 'en' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🇬🇧 English {translations.en.title && '✓'}
                  </button>
                </div>

                {/* Title */}
                <textarea
                  ref={titleTextareaRef}
                  value={translations[activeLang].title}
                  onChange={handleTitleChange}
                  onFocus={() => setActiveSection('title')}
                  placeholder={`${activeLang === 'tr' ? 'Turkish' : 'English'} post title...`}
                  className={`w-full text-5xl font-bold text-brand-dark placeholder-gray-400 resize-none border-none outline-none overflow-hidden ${errors.title ? 'border-b-2 border-red-500' : ''}`}
                  rows={1}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}

                {/* Tags */}
                <div className='mb-2'>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedTags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-medium">
                          #{tag}
                          <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-600 transition-colors">
                            <MdClose className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

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
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder={selectedTags.length === 0 ? "Add up to 4 tags..." : "Add another tag..."}
                      className="w-full text-base text-brand-dark placeholder-gray-400 border-none outline-none mb-2"
                    />
                  )}

                  {selectedTags.length >= 4 && (
                    <p className="text-sm text-green-600 font-medium">✓ All 4 tags added</p>
                  )}
                </div>

                {errors.tags && <p className="text-red-600 text-sm mb-2">{errors.tags}</p>}

                {/* Tag Suggestions */}
                {showSuggestions && (tagSuggestions.length > 0 || tagInput.trim().length > 0) && (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto mb-4" style={{ maxHeight: '180px' }}>
                    {tagSuggestions
                      .filter(tag => !selectedTags.includes(tag.name || tag))
                      .slice(0, 10)
                      .map((tag, index) => (
                        <button
                          key={index}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAddTag(tag.name || tag);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-brand-dark font-medium">#{tag.name || tag}</span>
                        </button>
                      ))}

                    {tagInput.trim().length >= 2 &&
                      !tagSuggestions.some(tag => (tag.name || tag).toLowerCase() === tagInput.trim().toLowerCase()) &&
                      !selectedTags.includes(tagInput.trim()) && (
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAddTag(tagInput.trim());
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-brand-primary/10 transition-colors border-t border-gray-200"
                        >
                          <span className="text-brand-primary font-medium">
                            Create new: <span className="font-bold">#{tagInput.trim()}</span>
                          </span>
                        </button>
                      )}
                  </div>
                )}

                {/* Markdown Editor */}
                <div className="markdown-editor" onFocus={() => setActiveSection('content')}>
                  <SimpleMDE
                    key={`editor-${activeLang}`}
                    value={translations[activeLang].content}
                    onChange={handleContentChange}
                    options={editorOptions}
                  />
                </div>

                {errors.content && <p className="text-red-600 text-sm mt-2">{errors.content}</p>}
                {errors.submit && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {coverImage && <img src={coverImage} alt="Cover" className="w-full h-64 object-cover rounded-lg" />}

                <h1 className="text-5xl font-bold text-brand-dark break-words">
                  {translations[activeLang].title || 'Post title...'}
                </h1>

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-md text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="markdown-preview prose prose-lg max-w-none">
                  {translations[activeLang].content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {translations[activeLang].content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-400">Write your content...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="hidden lg:flex flex-1 items-center pr-8">
          <div className="w-full max-w-sm">
            {activeSection && helpContent[activeSection] ? (
              <div>
                <h3 className="text-base font-bold text-brand-dark mb-3">
                  {helpContent[activeSection].title}
                </h3>
                <ul className="space-y-1.5">
                  {helpContent[activeSection].tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-brand-muted">
                      <span className="text-brand-primary mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-brand-dark text-center">
                Click on any field to see helpful tips
              </p>
            )}
          </div>
        </aside>

        <div className="w-full lg:w-64 lg:absolute lg:right-0 lg:top-6 lg:z-10">
          <div className="p-4 lg:p-4">
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className={`w-full px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold rounded-lg transition-colors mb-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update & Publish' : 'Publish')}
            </button>
            <button
              onClick={handleSaveDraft}
              className="w-full px-6 py-3 bg-white border border-gray-200 text-brand-dark hover:bg-gray-100 font-medium rounded-lg transition-colors"
            >
              Save draft
            </button>

            {isEditMode && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className={`w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors mt-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Deleting...' : 'Delete Post'}
              </button>
            )}
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-brand-dark mb-4">Delete Post</h3>
            <p className="text-brand-muted mb-6">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-brand-dark font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-brand-background flex items-center justify-center">
        <div className="text-brand-muted">Loading...</div>
      </div>
    }>
      <CreatePostContent />
    </Suspense>
  );
}