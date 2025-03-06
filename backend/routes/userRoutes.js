const express = require('express');
const router = express.Router();
const { registerUser, loginUser, resetPasswordRequest, resetPassword } = require('../controllers/userController');

// User Registration
router.post('/register', registerUser);

// User Login
router.post('/login', loginUser);

// Request Password Reset (Sends Reset Link)
router.post('/reset-password-request', resetPasswordRequest);

// Reset Password (After Clicking the Link)
router.post('/reset-password', resetPassword);

module.exports = router;
