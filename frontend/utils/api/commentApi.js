import apiClient from '../apiClient';

/**
 * Get comment count for a post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} API response with count
 */
export const getCommentCount = async (postId) => {
  try {
    const response = await apiClient.get(`/comment/post/${postId}/count`);
    return {
      success: true,
      count: response.data.count || 0
    };
  } catch (error) {
    console.error('Get comment count error:', error);
    return {
      success: false,
      count: 0,
      message: error.message || 'Failed to fetch comment count'
    };
  }
};

/**
 * Get comments for a post
 * @param {number} postId - Post ID
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Page size (default: 50)
 * @returns {Promise<Object>} API response
 */
export const getComments = async (postId, page = 1, pageSize = 50) => {
  try {
    const response = await apiClient.get(`/comment/post/${postId}`, {
      params: { page, pageSize }
    });
    return {
      success: true,
      comments: response.data || []
    };
  } catch (error) {
    console.error('Get comments error:', error);
    return {
      success: false,
      comments: [],
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
    const payload = { content };
    if (parentCommentId) {
      payload.parentCommentId = parentCommentId;
    }

    const response = await apiClient.post(`/comment/post/${postId}`, payload);
    return {
      success: true,
      comment: response.data
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
      success: true
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
 * Search comments by query
 * @param {string} query - Search term
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Page size (default: 10)
 * @returns {Promise<Object>} API response
 */
export const searchComments = async (query, page = 1, pageSize = 10) => {
  try {
    if (!query || !query.trim()) {
      return { success: true, data: [] };
    }

    const response = await apiClient.get('/comment/search', {
      params: { query, page, pageSize }
    });

    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('Search comments error:', error);
    return {
      success: false,
      message: error.message || 'Failed to search comments'
    };
  }
};
