const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

router.get('/', collectionController.getCollections);
router.post('/', collectionController.addCollection);
router.delete('/:id', collectionController.deleteCollection);

module.exports = router;
