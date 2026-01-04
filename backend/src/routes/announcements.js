const express = require('express');
const router = express.Router();
const controller = require('../controllers/announcementController');

router.get('/', controller.getActiveAnnouncements);

module.exports = router;
