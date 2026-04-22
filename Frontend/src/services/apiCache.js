// API Response Cache System
// Reduces redundant API calls by caching responses

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedData = (key) => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
        cache.delete(key);
        return null;
    }
    return cached.data;
};

export const setCachedData = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = () => {
    cache.clear();
};

export const invalidateCache = (pattern) => {
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
};

// Example usage in components:
// const getCachedUser = async (userId) => {
//     const cached = getCachedData(`user_${userId}`);
//     if (cached) return cached;
//     
//     const data = await fetchUser(userId);
//     setCachedData(`user_${userId}`, data);
//     return data;
// };
