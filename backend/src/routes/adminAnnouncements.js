const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminAnnouncementController');

router.get('/', controller.getAllAnnouncements);
router.post('/', controller.createAnnouncement);
router.patch('/:id/toggle', controller.toggleStatus);
router.delete('/:id', controller.deleteAnnouncement);

module.exports = router;
