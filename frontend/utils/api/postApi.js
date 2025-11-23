/* eslint-disable no-console */
import apiClient from '../apiClient';

/**
 * Post API services
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @param {string} postData.title - Post title
 * @param {string} postData.content - Post content (markdown)
 * @param {string[]} postData.tags - Array of tag names
 * @param {string} [postData.coverImageUrl] - Cover image URL (optional)
 * @param {boolean} [postData.publishNow] - Whether to publish immediately (default: true)
 * @returns {Promise<Object>} API response
 */
export const createPost = async (postData) => {
  try {
    const response = await apiClient.post('/post', {
      title: postData.title,
      content: postData.content,
      tags: postData.tags || [],
      tagIds: postData.tagIds || [],
      coverImageUrl: postData.coverImageUrl || null,
      publishNow: postData.publishNow !== undefined ? postData.publishNow : true
    });
    
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
 * @returns {Promise<Object>} API response
 */
export const updatePost = async (postId, postData) => {
  try {
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
  return {
    id: backendPost.id,
    title: backendPost.title,
    slug: backendPost.slug,
    content: backendPost.contentMarkdown,
    coverImage: backendPost.coverImageUrl,
    author: backendPost.authorDisplayName,
    authorId: backendPost.authorId,
    date: new Date(backendPost.publishedAt || backendPost.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
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
    reactionTypes: {
      heart: backendPost.likesCount || 0
    },
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
    
    return {
      success: true,
      data: transformPostData(response.data)
    };
  } catch (error) {
    console.error('Get post error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch post'
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
export const getLatestPosts = async (page = 1, pageSize = 20) => {
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
 * @returns {Promise<Object>} API response
 */
export const getTopPosts = async (take = 20) => {
  try {
    const response = await apiClient.get('/post/top', {
      params: { take }
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
 * Get relevant posts (personalized feed)
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @returns {Promise<Object>} API response
 */
export const getRelevantPosts = async (page = 1, pageSize = 10) => {
  try {
    // Create a separate axios instance without Authorization header for this endpoint
    const axios = require('axios');
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5254/api'}/post/relevant`, {
      params: { page, pageSize },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.log('Full error object:', error);
    console.error('Get relevant posts error:', error);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
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

