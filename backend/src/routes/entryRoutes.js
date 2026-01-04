const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');

router.put('/:id', entryController.updateEntry);
router.delete('/:id', entryController.deleteEntry);

module.exports = router;
