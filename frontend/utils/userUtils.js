/* eslint-disable no-console */
import { getAllUsers } from './api/userApi';

// Cache for user mapping
let userMapCache = null;
let userMapCacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get username from display name by fetching all users and finding the match
 * @param {string} displayName - Display name to search for
 * @returns {Promise<string|null>} Username if found, null otherwise
 */
export const getUsernameFromDisplayName = async (displayName) => {
  if (!displayName) return null;

  try {
    // Check cache first
    const now = Date.now();
    if (userMapCache && userMapCacheTimestamp && (now - userMapCacheTimestamp < CACHE_DURATION)) {
      const user = userMapCache.find(u => 
        u.displayName === displayName || 
        u.display_name === displayName ||
        u.name === displayName
      );
      if (user && user.username) {
        return user.username;
      }
    }

    // Fetch all users
    const result = await getAllUsers();
    
    if (result.success && result.data && Array.isArray(result.data)) {
      // Create cache
      userMapCache = result.data;
      userMapCacheTimestamp = now;

      // Find user by display name
      const user = result.data.find(u => 
        u.displayName === displayName || 
        u.display_name === displayName ||
        u.name === displayName
      );

      if (user && user.username) {
        return user.username;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting username from display name:', error);
    return null;
  }
};

/**
 * Clear the user map cache
 */
export const clearUserMapCache = () => {
  userMapCache = null;
  userMapCacheTimestamp = null;
};

