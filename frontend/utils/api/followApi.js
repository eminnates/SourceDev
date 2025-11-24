import apiClient from '../apiClient';

/**
 * Follow a user
 * @param {number} userId - User ID to follow
 * @returns {Promise<Object>} API response
 */
export const followUser = async (userId) => {
  try {
    const response = await apiClient.post(`/follow/${userId}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Follow user error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to follow user'
    };
  }
};

/**
 * Unfollow a user
 * @param {number} userId - User ID to unfollow
 * @returns {Promise<Object>} API response
 */
export const unfollowUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/follow/${userId}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Unfollow user error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to unfollow user'
    };
  }
};

/**
 * Check if current user is following another user
 * @param {number} userId - User ID to check
 * @returns {Promise<Object>} API response with isFollowing boolean
 */
export const checkIfFollowing = async (userId) => {
  try {
    const response = await apiClient.get(`/follow/check/${userId}`);
    return {
      success: true,
      isFollowing: response.data.isFollowing
    };
  } catch (error) {
    console.error('Check following error:', error);
    return {
      success: false,
      isFollowing: false,
      message: error.message || 'Failed to check following status'
    };
  }
};

/**
 * Get followers count for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} API response with count
 */
export const getFollowersCount = async (userId) => {
  try {
    const response = await apiClient.get(`/follow/followers-count/${userId}`);
    return {
      success: true,
      count: response.data.count || 0
    };
  } catch (error) {
    console.error('Get followers count error:', error);
    return {
      success: false,
      count: 0,
      message: error.message || 'Failed to get followers count'
    };
  }
};

/**
 * Get following count for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} API response with count
 */
export const getFollowingCount = async (userId) => {
  try {
    const response = await apiClient.get(`/follow/following-count/${userId}`);
    return {
      success: true,
      count: response.data.count || 0
    };
  } catch (error) {
    console.error('Get following count error:', error);
    return {
      success: false,
      count: 0,
      message: error.message || 'Failed to get following count'
    };
  }
};
