/* eslint-disable no-console */
import apiClient from '../apiClient';

/**
 * User API services
 */

/**
 * Get user profile by ID
 * @param {number} userId - User ID to fetch
 * @returns {Promise<Object>} API response
 */
export const getUserById = async (userId) => {
  try {
    const numericId = Number(userId);
    if (!numericId || Number.isNaN(numericId)) {
      return {
        success: false,
        message: 'Invalid user id'
      };
    }

    const response = await apiClient.get(`/users/${numericId}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch user profile'
    };
  }
};

/**
 * Search users by query
 * @param {string} query - Search query
 * @returns {Promise<Object>} API response
 */
export const searchUsers = async (query) => {
  try {
    if (!query || !query.trim()) {
      return {
        success: false,
        message: 'Search term is required'
      };
    }

    const response = await apiClient.get('/users/search', {
      params: { query }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Search users error:', error);
    return {
      success: false,
      message: error.message || 'Failed to search users'
    };
  }
};

/**
 * Fetch all users (public endpoint)
 * @returns {Promise<Object>} API response
 */
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get all users error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch users'
    };
  }
};

/**
 * Get current user profile (authenticated)
 * @returns {Promise<Object>} API response
 */
export const getCurrentUserProfile = async () => {
  try {
    const response = await apiClient.get('/auth/profile');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get current user profile error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch profile'
    };
  }
};

/**
 * Get user posts by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} API response
 */
export const getUserPosts = async (userId) => {
  try {
    const response = await apiClient.get(`/post/user/${userId}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get user posts error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch user posts'
    };
  }
};

/**
 * Follow/Unfollow user
 * @param {number} userId - User ID to follow/unfollow
 * @returns {Promise<Object>} API response
 */
export const toggleFollowUser = async (userId) => {
  try {
    const response = await apiClient.post(`/users/${userId}/follow`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Toggle follow user error:', error);
    return {
      success: false,
      message: error.message || 'Failed to follow/unfollow user'
    };
  }
};

