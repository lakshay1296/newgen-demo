const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const { validateUserRegistration, validateLogin } = require('../middleware/validation.middleware');

// Register a new user
router.post('/register', validateUserRegistration, authController.register);

// Login
router.post('/login', validateLogin, authController.login);

// Get current user profile
router.get('/profile', authenticate, authController.getProfile);

// Update user profile
router.put('/profile', authenticate, authController.updateProfile);

// Change user role (admin only)
router.put('/change-role/:id', authenticate, isAdmin, authController.changeRole);

module.exports = router;