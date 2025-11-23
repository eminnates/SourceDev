/* eslint-disable no-console */
import apiClient from '../apiClient';

/**
 * Tag API services
 */

/**
 * Get all tags
 * @returns {Promise<Object>} API response
 */
export const getAllTags = async () => {
  try {
    const response = await apiClient.get('/tag');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get all tags error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch tags'
    };
  }
};

/**
 * Get popular tags
 * @param {number} [limit=20] - Number of tags to fetch
 * @returns {Promise<Object>} API response
 */
export const getPopularTags = async (limit = 20) => {
  try {
    const response = await apiClient.get('/tag/popular', {
      params: { limit }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get popular tags error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch popular tags'
    };
  }
};

/**
 * Search tags by query
 * @param {string} query - Search query
 * @param {number} [limit=10] - Number of results
 * @returns {Promise<Object>} API response
 */
export const searchTags = async (query, limit = 10) => {
  try {
    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: []
      };
    }

    const response = await apiClient.get('/tag/search', {
      params: { 
        q: query.trim(),
        limit 
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Search tags error:', error);
    return {
      success: false,
      message: error.message || 'Failed to search tags'
    };
  }
};

/**
 * Get tag by ID
 * @param {number} tagId - Tag ID
 * @returns {Promise<Object>} API response
 */
export const getTagById = async (tagId) => {
  try {
    const response = await apiClient.get(`/tag/${tagId}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get tag by ID error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch tag'
    };
  }
};

/**
 * Get tag by name
 * @param {string} name - Tag name
 * @returns {Promise<Object>} API response
 */
export const getTagByName = async (name) => {
  try {
    const response = await apiClient.get(`/tag/name/${name}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get tag by name error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch tag'
    };
  }
};

