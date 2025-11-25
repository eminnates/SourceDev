/* eslint-disable no-console */
import apiClient from '../apiClient';
import { setToken, setUser, removeToken, removeUser } from '../auth';

/**
 * Auth API services
 */

/**
 * User registration
 * @param {Object} registerData - Registration data
 * @param {string} registerData.username - Username
 * @param {string} registerData.email - Email
 * @param {string} registerData.password - Password
 * @param {string} registerData.displayName - Display name
 * @param {string} [registerData.bio] - Biography (optional)
 * @returns {Promise<Object>} API response
 */
export const register = async (registerData) => {
  try {
    const response = await apiClient.post('/auth/register', registerData);
    
    if (response.data.success && response.data.token) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Registration successful!'
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during registration',
      errors: error.data?.errors
    };
  }
};

/**
 * User login
 * @param {Object} loginData - Login data
 * @param {string} loginData.emailOrUsername - Email or username
 * @param {string} loginData.password - Password
 * @param {boolean} [loginData.rememberMe] - Remember me option
 * @returns {Promise<Object>} API response
 */
export const login = async (loginData) => {
  try {
    const response = await apiClient.post('/auth/login', loginData);
    
    if (response.data.success && response.data.token) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Login successful!'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during login'
    };
  }
};

/**
 * User logout
 * @returns {Promise<Object>} API response
 */
export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
    
    removeToken();
    removeUser();
    
    return {
      success: true,
      message: 'Logout successful!'
    };
  } catch (error) {
    console.error('Logout error:', error);
    
    removeToken();
    removeUser();
    
    return {
      success: false,
      message: error.message || 'An error occurred during logout'
    };
  }
};

/**
 * Get profile information
 * @returns {Promise<Object>} API response
 */
export const getProfile = async () => {
  try {
    const response = await apiClient.get('/auth/profile');

    const rawData = response.data;
    const profile =
      (rawData && typeof rawData === 'object'
        ? rawData.user || rawData.profile || rawData
        : null) || null;

    if (profile && profile.username) {
      setUser(profile);
    }

    return {
      success: true,
      data: profile,
      raw: rawData
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch profile information'
    };
  }
};

/**
 * Update profile information
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} API response
 */
export const updateProfile = async (updateData) => {
  try {
    const response = await apiClient.put('/auth/profile', updateData);
        
    if (response.data.success && response.data.user) {
      setUser(response.data.user);
    }
    
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Profile updated successfully!'
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating profile'
    };
  }
};

/**
 * Change password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} API response
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.post('/auth/change-password', passwordData);
    
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Password changed successfully!'
    };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while changing password'
    };
  }
};

