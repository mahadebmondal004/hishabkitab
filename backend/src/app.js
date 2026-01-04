const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import utilities and middleware
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const entryRoutes = require('./routes/entryRoutes');
const cashbookRoutes = require('./routes/cashbookRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/products');
const invoiceRoutes = require('./routes/invoices');
const ticketRoutes = require('./routes/tickets');
const staffRoutes = require('./routes/staffRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const cmsRoutes = require('./routes/cms');
const adminSupportRoutes = require('./routes/adminSupport');
const adminAnnouncementRoutes = require('./routes/adminAnnouncements');
const announcementRoutes = require('./routes/announcements');

const app = express();

// Log server startup
logger.info('Server starting...', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    dbHost: process.env.DB_HOST
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });

    next();
});

// API Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/customers', apiLimiter, customerRoutes);
app.use('/api/entries', apiLimiter, entryRoutes);
app.use('/api/cashbook', apiLimiter, cashbookRoutes);
app.use('/api/products', apiLimiter, productRoutes);
app.use('/api/invoices', apiLimiter, invoiceRoutes);
app.use('/api/tickets', apiLimiter, ticketRoutes);
app.use('/api/staff', apiLimiter, staffRoutes);
app.use('/api/collections', apiLimiter, collectionRoutes);
app.use('/api/announcements', apiLimiter, announcementRoutes);

// Admin routes
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/admin/cms', apiLimiter, cmsRoutes);
app.use('/api/admin/support', apiLimiter, adminSupportRoutes);
app.use('/api/admin/announcements', apiLimiter, adminAnnouncementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Root endpoint
// Serve Frontend in Production
const clientBuildPath = path.join(__dirname, '../public');
app.use(express.static(clientBuildPath));

// Catch-all route for SPA (excludes API routes)
app.get(/(.*)/, (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    const message = `Server running on port ${PORT}`;
    console.log(`✅ ${message}`);
    logger.info(message, { port: PORT, env: process.env.NODE_ENV });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
    console.error('❌ Unhandled Rejection:', reason);
    process.exit(1);
});

