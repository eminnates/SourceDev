/* eslint-disable no-console */
import apiClient from '../apiClient';

/**
 * Post API services
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @param {Array<Object>} postData.translations - Array of translation objects with languageCode, title, content
 * @param {string} postData.defaultLanguageCode - Default language code (e.g., 'tr', 'en')
 * @param {string[]} [postData.tags] - Array of tag names
 * @param {number[]} [postData.tagIds] - Array of tag IDs
 * @param {string} [postData.coverImageUrl] - Cover image URL (optional)
 * @param {boolean} [postData.publishNow] - Whether to publish immediately (default: true)
 * @returns {Promise<Object>} API response
 */
export const createPost = async (postData) => {
  try {
    // Support new format with translations array
    const requestBody = {
      translations: postData.translations || [],
      defaultLanguageCode: postData.defaultLanguageCode || 'tr',
      tags: postData.tags || [],
      tagIds: postData.tagIds || [],
      coverImageUrl: postData.coverImageUrl || null,
      publishNow: postData.publishNow !== undefined ? postData.publishNow : true
    };
    
    const response = await apiClient.post('/post', requestBody);
    
    return {
      success: true,
      data: transformPostData(response.data),
      message: 'Post created successfully!'
    };
  } catch (error) {
    console.error('Create post error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while creating the post',
      errors: error.data?.errors
    };
  }
};

/**
 * Update an existing post
 * @param {number} postId - Post ID
 * @param {Object} postData - Post data to update
 * @param {Array<Object>} [postData.translations] - Array of translation objects with languageCode, title, content
 * @param {string} [postData.defaultLanguageCode] - Default language code (e.g., 'tr', 'en')
 * @param {string[]} [postData.tags] - Array of tag names
 * @param {string} [postData.coverImageUrl] - Cover image URL (optional)
 * @param {boolean} [postData.publishNow] - Whether to publish immediately (optional)
 * @returns {Promise<Object>} API response
 */
export const updatePost = async (postId, postData) => {
  try {
    // Pass through the data as-is - it should already be in the correct format
    const response = await apiClient.put(`/post/${postId}`, postData);
    
    return {
      success: true,
      data: response.data,
      message: 'Post updated successfully!'
    };
  } catch (error) {
    console.error('Update post error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating the post'
    };
  }
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} API response
 */
export const deletePost = async (postId) => {
  try {
    await apiClient.delete(`/post/${postId}`);
    
    return {
      success: true,
      message: 'Post deleted successfully!'
    };
  } catch (error) {
    console.error('Delete post error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting the post'
    };
  }
};

/**
 * Transform backend post DTO to frontend format
 * @private
 */
const transformPostData = (backendPost) => {
  if (!backendPost) return null;

  let formattedDate = '';
  try {
    const dateStr = backendPost.publishedAt || backendPost.createdAt;
    if (dateStr) {
      formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  } catch (e) {
    console.error('Date parsing error:', e);
  }

  // Preserve translations array from backend
  const translations = backendPost.translations || [];

  return {
    id: backendPost.id,
    title: backendPost.title,
    slug: backendPost.slug,
    content: backendPost.contentMarkdown || '',
    contentMarkdown: backendPost.contentMarkdown || '',
    translations: translations, // Preserve full translations array
    coverImage: backendPost.coverImageUrl,
    coverImageUrl: backendPost.coverImageUrl,
    author: backendPost.authorDisplayName,
    authorDisplayName: backendPost.authorDisplayName,
    authorId: backendPost.authorId,
    date: formattedDate,
    publishedAt: backendPost.publishedAt,
    createdAt: backendPost.createdAt,
    updatedAt: backendPost.updatedAt,
    tags: backendPost.tags || [],
    status: backendPost.status,
    likesCount: backendPost.likesCount || 0,
    commentsCount: backendPost.commentsCount || 0,
    viewCount: backendPost.viewCount || 0,
    bookmarksCount: backendPost.bookmarksCount || 0,
    readingTimeMinutes: backendPost.readingTimeMinutes || 0,
    likedByCurrentUser: backendPost.likedByCurrentUser || false,
    bookmarkedByCurrentUser: backendPost.bookmarkedByCurrentUser || false,
    reactionTypes: backendPost.reactionTypes || {},
    userReactions: backendPost.userReactions || [],
    comments: backendPost.commentsCount || 0,
    readTime: backendPost.readingTimeMinutes || 5
  };
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} API response
 */
export const getPostById = async (postId) => {
  try {
    const response = await apiClient.get(`/post/${postId}`);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }

    return {
      success: true,
      data: transformPostData(response.data)
    };
  } catch (error) {
    console.error('Get post error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    });
    return {
      success: false,
      message: error.message || 'Failed to fetch post'
    };
  }
};

/**
 * Get post for editing (requires auth)
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} API response
 */
export const getPostForEdit = async (postId) => {
  try {
    const response = await apiClient.get(`/post/${postId}/edit`);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }

    return {
      success: true,
      data: transformPostData(response.data)
    };
  } catch (error) {
    console.error('Get post for edit error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch post for editing',
      status: error.response?.status
    };
  }
};

/**
 * Get post by slug
 * @param {string} slug - Post slug
 * @returns {Promise<Object>} API response
 */
export const getPostBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/post/slug/${slug}`);
    
    return {
      success: true,
      data: transformPostData(response.data)
    };
  } catch (error) {
    console.error('Get post by slug error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch post'
    };
  }
};

/**
 * Get latest posts
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=20] - Page size
 * @returns {Promise<Object>} API response
 */
export const getLatestPosts = async (page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get('/post/latest', {
      params: { page, pageSize }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get latest posts error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch posts'
    };
  }
};

/**
 * Get top posts
 * @param {number} [take=20] - Number of posts to fetch
 * @param {string} [period='month'] - Time period: day, week, month, year, all
 * @returns {Promise<Object>} API response
 */
export const getTopPosts = async (take = 20, period = 'month') => {
  try {
    const response = await apiClient.get('/post/top', {
      params: { take, period }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get top posts error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch posts'
    };
  }
};

/**
 * Get trending posts (last 48 hours, engagement-weighted)
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=20] - Page size
 * @returns {Promise<Object>} API response
 */
export const getTrendingPosts = async (page = 1, pageSize = 20) => {
  try {
    const response = await apiClient.get('/post/trending', {
      params: { page, pageSize }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get trending posts error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch trending posts'
    };
  }
};

/**
 * Get hot posts (Reddit-style balanced algorithm)
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=20] - Page size
 * @returns {Promise<Object>} API response
 */
export const getHotPosts = async (page = 1, pageSize = 20) => {
  try {
    const response = await apiClient.get('/post/hot', {
      params: { page, pageSize }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get hot posts error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch hot posts'
    };
  }
};

/**
 * Get personalized "For You" feed
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=20] - Page size
 * @returns {Promise<Object>} API response
 */
export const getForYouPosts = async (page = 1, pageSize = 20) => {
  try {
    const response = await apiClient.get('/post/for-you', {
      params: { page, pageSize }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get for-you posts error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch personalized posts'
    };
  }
};

/**
 * Toggle reaction on a post
 * @param {number} postId - Post ID
 * @param {string} reactionType - Reaction type (heart, unicorn, etc.)
 * @returns {Promise<Object>} API response
 */
export const toggleReaction = async (postId, reactionType) => {
  try {
    const response = await apiClient.post(`/reaction/post/${postId}`, reactionType, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Reaction toggled successfully'
    };
  } catch (error) {
    console.error('Toggle reaction error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to toggle reaction'
    };
  }
};

/**
 * Get user's bookmarked posts
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=20] - Page size
 * @returns {Promise<Object>} API response
 */
export const getBookmarkedPosts = async (page = 1, pageSize = 20) => {
  try {
    const response = await apiClient.get('/post/bookmarks', {
      params: { page, pageSize }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get bookmarked posts error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch bookmarked posts'
    };
  }
};

/**
 * Get comments for a post
 * @param {number} postId - Post ID
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=50] - Page size
 * @returns {Promise<Object>} API response
 */
export const getComments = async (postId, page = 1, pageSize = 50) => {
  try {
    const response = await apiClient.get(`/comment/post/${postId}`, {
      params: { page, pageSize }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get comments error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch comments'
    };
  }
};

/**
 * Add a comment to a post
 * @param {number} postId - Post ID
 * @param {string} content - Comment content
 * @param {number} [parentCommentId] - Parent comment ID for replies
 * @returns {Promise<Object>} API response
 */
export const addComment = async (postId, content, parentCommentId = null) => {
  try {
    const response = await apiClient.post(`/comment/post/${postId}`, {
      content,
      parentCommentId
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Add comment error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add comment'
    };
  }
};

/**
 * Delete a comment
 * @param {number} commentId - Comment ID
 * @returns {Promise<Object>} API response
 */
export const deleteComment = async (commentId) => {
  try {
    const response = await apiClient.delete(`/comment/${commentId}`);

    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Comment deleted successfully'
    };
  } catch (error) {
    console.error('Delete comment error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete comment'
    };
  }
};

/**
 * Get relevant posts (personalized feed)
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @returns {Promise<Object>} API response
 */
export const getRelevantPosts = async (page = 1, pageSize = 10) => {
  try {
    // Use apiClient - it will automatically add Authorization header if token exists
    const response = await apiClient.get('/post/relevant', {
      params: { page, pageSize }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get relevant posts error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch posts'
    };
  }
};

/**
 * Get posts by user
 * @param {number} userId - User ID
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=20] - Page size
 * @returns {Promise<Object>} API response
 */
export const getPostsByUser = async (userId, page = 1, pageSize = 20) => {
  try {
    const response = await apiClient.get(`/post/user/${userId}`, {
      params: { page, pageSize }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get posts by user error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch posts'
    };
  }
};

/**
 * Get user's draft posts
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=20] - Page size
 * @returns {Promise<Object>} API response
 */
export const getUserDrafts = async (page = 1, pageSize = 20) => {
  try {
    const response = await apiClient.get('/post/drafts', {
      params: { page, pageSize }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get user drafts error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch drafts'
    };
  }
};

/**
 * Get posts by tag
 * @param {string} tagSlug - Tag slug
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=20] - Page size
 * @returns {Promise<Object>} API response
 */
export const getPostsByTag = async (tagSlug, page = 1, pageSize = 20) => {
  try {
    const response = await apiClient.get(`/post/tag/${tagSlug}`, {
      params: { page, pageSize }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get posts by tag error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch posts'
    };
  }
};

/**
 * Search posts
 * @param {string} query - Search query
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=20] - Page size
 * @returns {Promise<Object>} API response
 */
export const searchPosts = async (query, page = 1, pageSize = 20) => {
  try {
    const response = await apiClient.get('/post/search', {
      params: { query, page, pageSize }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Search posts error:', error);
    return {
      success: false,
      message: error.message || 'Failed to search posts'
    };
  }
};

/**
 * Toggle like on a post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} API response
 */
export const toggleLike = async (postId) => {
  try {
    await apiClient.post(`/post/${postId}/like`);
    
    return {
      success: true,
      message: 'Like toggled successfully!'
    };
  } catch (error) {
    console.error('Toggle like error:', error);
    return {
      success: false,
      message: error.message || 'Failed to toggle like'
    };
  }
};

/**
 * Toggle bookmark on a post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} API response
 */
export const toggleBookmark = async (postId) => {
  try {
    await apiClient.post(`/post/${postId}/save`);
    
    return {
      success: true,
      message: 'Bookmark toggled successfully!'
    };
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    return {
      success: false,
      message: error.message || 'Failed to toggle bookmark'
    };
  }
};

/**
 * Publish a draft post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} API response
 */
export const publishPost = async (postId) => {
  try {
    await apiClient.put(`/post/${postId}/publish`);
    
    return {
      success: true,
      message: 'Post published successfully!'
    };
  } catch (error) {
    console.error('Publish post error:', error);
    return {
      success: false,
      message: error.message || 'Failed to publish post'
    };
  }
};

/**
 * Unpublish a post (convert to draft)
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} API response
 */
export const unpublishPost = async (postId) => {
  try {
    await apiClient.put(`/post/${postId}/unpublish`);
    
    return {
      success: true,
      message: 'Post unpublished successfully!'
    };
  } catch (error) {
    console.error('Unpublish post error:', error);
    return {
      success: false,
      message: error.message || 'Failed to unpublish post'
    };
  }
};

/**
 * Add tag to post
 * @param {number} postId - Post ID
 * @param {string} tagName - Tag name
 * @returns {Promise<Object>} API response
 */
export const addTagToPost = async (postId, tagName) => {
  try {
    await apiClient.post(`/post/${postId}/tags`, JSON.stringify(tagName), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      message: 'Tag added successfully!'
    };
  } catch (error) {
    console.error('Add tag error:', error);
    return {
      success: false,
      message: error.message || 'Failed to add tag'
    };
  }
};

/**
 * Remove tag from post
 * @param {number} postId - Post ID
 * @param {number} tagId - Tag ID
 * @returns {Promise<Object>} API response
 */
export const removeTagFromPost = async (postId, tagId) => {
  try {
    await apiClient.delete(`/post/${postId}/tags/${tagId}`);
    
    return {
      success: true,
      message: 'Tag removed successfully!'
    };
  } catch (error) {
    console.error('Remove tag error:', error);
    return {
      success: false,
      message: error.message || 'Failed to remove tag'
    };
  }
};

