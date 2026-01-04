const logger = require('../utils/logger');

// Simple in-memory rate limiter (for production, use Redis)
class RateLimiter {
    constructor(options = {}) {
        this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
        this.max = options.max || 100; // Max requests per window
        this.message = options.message || 'Too many requests, please try again later.';
        this.requests = new Map();

        // Clean up old entries every minute
        setInterval(() => this.cleanup(), 60000);
    }

    cleanup() {
        const now = Date.now();
        for (const [key, data] of this.requests.entries()) {
            if (now - data.resetTime > this.windowMs) {
                this.requests.delete(key);
            }
        }
    }

    middleware() {
        return (req, res, next) => {
            // Get client identifier (IP address)
            const identifier = req.ip || req.connection.remoteAddress;
            const now = Date.now();

            // Get or create request data for this identifier
            let requestData = this.requests.get(identifier);

            if (!requestData || now - requestData.resetTime > this.windowMs) {
                // New window
                requestData = {
                    count: 1,
                    resetTime: now
                };
            } else {
                // Increment count
                requestData.count++;
            }

            this.requests.set(identifier, requestData);

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', this.max);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - requestData.count));
            res.setHeader('X-RateLimit-Reset', new Date(requestData.resetTime + this.windowMs).toISOString());

            // Check if limit exceeded
            if (requestData.count > this.max) {
                logger.warn('Rate limit exceeded', {
                    ip: identifier,
                    url: req.url,
                    count: requestData.count
                });

                return res.status(429).json({
                    success: false,
                    error: this.message,
                    retryAfter: Math.ceil((requestData.resetTime + this.windowMs - now) / 1000)
                });
            }

            next();
        };
    }
}

// Create rate limiters for different endpoints
const apiLimiter = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100000, // Effectively disabled
    message: 'Too many API requests, please try again later.'
});

const authLimiter = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100000, // Effectively disabled
    message: 'Too many login attempts, please try again later.'
});

module.exports = {
    apiLimiter: apiLimiter.middleware(),
    authLimiter: authLimiter.middleware()
};
