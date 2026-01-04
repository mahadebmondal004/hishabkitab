import axios from 'axios';
import { localCache } from '../utils/localCache';

const instance = axios.create({
    baseURL: '/api',
    timeout: 45000,
});

instance.interceptors.request.use(config => {
    const user = localStorage.getItem('user');
    const adminToken = localStorage.getItem('adminToken');

    if (user) {
        const userData = JSON.parse(user);
        if (userData.id) {
            config.headers['X-User-Id'] = userData.id;
        }
    }

    if (adminToken) {
        config.headers['Authorization'] = `Bearer ${adminToken}`;
    }

    return config;
}, error => {
    return Promise.reject(error);
});

// Response interceptor for caching
instance.interceptors.response.use(
    (response) => {
        // Cache GET requests
        if (response.config.method === 'get') {
            const cacheKey = `cache_${response.config.url}`;
            localCache.set(cacheKey, response.data);
        }
        return response;
    },
    async (error) => {
        // If offline, try to get from cache
        if (!navigator.onLine && error.config.method === 'get') {
            const cacheKey = `cache_${error.config.url}`;
            const cachedData = localCache.get(cacheKey);

            if (cachedData) {
                return Promise.resolve({ data: cachedData, fromCache: true });
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
