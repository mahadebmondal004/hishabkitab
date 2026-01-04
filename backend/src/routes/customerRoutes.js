const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const entryController = require('../controllers/entryController');

router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

router.post('/:id/entries', entryController.addEntry);
router.get('/:id/entries', entryController.getEntriesByCustomer);

module.exports = router;
