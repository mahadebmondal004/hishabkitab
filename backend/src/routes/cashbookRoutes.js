const express = require('express');
const router = express.Router();
const cashbookController = require('../controllers/cashbookController');
const upload = require('../middleware/upload');

router.get('/', cashbookController.getEntries);
router.post('/', upload.single('attachment'), cashbookController.addEntry);
router.get('/categories', cashbookController.getCategories);
router.post('/categories', cashbookController.createCategory);

module.exports = router;
