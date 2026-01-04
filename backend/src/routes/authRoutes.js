const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const upload = require('../middleware/upload');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/set-pin', authController.setPin);
router.post('/verify-pin', authController.verifyPin);
router.post('/change-pin', authController.changePin);

router.get('/profile/:id', authController.getProfile);
router.put('/profile/:id', upload.single('profilePicture'), authController.updateProfile);

router.post('/verify-email/send/:id', authController.sendEmailVerificationOtp);
router.post('/verify-email/verify/:id', authController.verifyEmailOtp);

module.exports = router;
