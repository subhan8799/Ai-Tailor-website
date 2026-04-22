// Shared utility functions to eliminate code duplication

import { API } from './api';

/**
 * Format image URL to work with backend API
 */
export const imgUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API}${path}`;
};

/**
 * Format currency display
 */
export const formatPrice = (price) => {
    return `£${parseFloat(price).toFixed(2)}`;
};

/**
 * Format date to readable format
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
};

/**
 * Get item from localStorage safely
 */
export const getStorageItem = (key, defaultValue = null) => {
    try {
        return localStorage.getItem(key) || defaultValue;
    } catch (err) {
        console.warn(`Failed to get localStorage item: ${key}`, err);
        return defaultValue;
    }
};

/**
 * Set item in localStorage safely
 */
export const setStorageItem = (key, value) => {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (err) {
        console.warn(`Failed to set localStorage item: ${key}`, err);
        return false;
    }
};

/**
 * Parse JSON safely
 */
export const parseJSON = (jsonString, defaultValue = {}) => {
    try {
        return JSON.parse(jsonString) || defaultValue;
    } catch (err) {
        return defaultValue;
    }
};

/**
 * Debounce function for API calls
 */
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getStorageItem('token') && !!getStorageItem('user_id');
};

/**
 * Get authentication headers
 */
export const getAuthHeaders = () => {
    const token = getStorageItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    };
};

/**
 * Handle API errors gracefully
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
    if (error.response?.data?.msg) {
        return error.response.data.msg;
    }
    return error.message || defaultMessage;
};

/**
 * Generate unique ID
 */
export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Capitalize string
 */
export const capitalize = (str) => {
    return str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase() || '';
};

/**
 * Check if device is mobile
 */
export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
