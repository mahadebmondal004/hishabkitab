// Local Storage Cache Utility
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const localCache = {
    // Set data with timestamp
    set: (key, data) => {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    },

    // Get data if not expired
    get: (key) => {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

            if (isExpired) {
                localStorage.removeItem(key);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    },

    // Remove specific cache
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing cache:', error);
        }
    },

    // Clear all cache
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }
};
