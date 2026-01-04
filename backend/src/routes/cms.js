const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

// CMS Pages
router.get('/pages', cmsController.getAllPages);
router.get('/pages/:slug', cmsController.getPageBySlug);
router.post('/pages', cmsController.createPage);
router.put('/pages/:id', cmsController.updatePage);
router.delete('/pages/:id', cmsController.deletePage);

// SEO Settings
router.get('/seo', cmsController.getSEOSettings);
router.put('/seo', cmsController.updateSEOSettings);

module.exports = router;
