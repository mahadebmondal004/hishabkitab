const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// OTP Auth Routes (Public)
router.post('/send-otp', adminController.sendOtp);
router.post('/verify-otp', adminController.verifyOtp);

// Admin Features (Protected)
router.get('/users', adminAuth, adminController.getUsers);
router.get('/customers', adminAuth, adminController.getAllCustomers);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

module.exports = router;
