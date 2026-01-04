const express = require('express');
const router = express.Router();
const adminSupportController = require('../controllers/adminSupportController');

// Support Tickets
router.get('/tickets', adminSupportController.getAllTickets);
router.get('/tickets/stats', adminSupportController.getTicketStats);
router.get('/tickets/:id', adminSupportController.getTicketById);
router.put('/tickets/:id', adminSupportController.updateTicketStatus);
router.delete('/tickets/:id', adminSupportController.deleteTicket);

module.exports = router;
