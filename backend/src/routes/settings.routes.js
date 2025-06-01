const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateSettingsUpdate } = require('../middleware/validation.middleware');

// Get user settings
router.get('/', authenticate, settingsController.getSettings);

// Update user settings
router.put('/', authenticate, validateSettingsUpdate, settingsController.updateSettings);

// Reset user settings to default
router.post('/reset', authenticate, settingsController.resetSettings);

module.exports = router;