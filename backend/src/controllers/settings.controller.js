const Settings = require('../models/settings.model');
const { validationResult } = require('express-validator');

// Get user settings
exports.getSettings = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id;

    // Get settings for the user
    const settings = await Settings.getByUserId(userId);

    // Return settings
    res.status(200).json({
      success: true,
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('Error getting user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user settings',
      error: error.message
    });
  }
};

// Update user settings
exports.updateSettings = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Get user ID from authenticated user
    const userId = req.user.id;

    // Update settings
    const updatedSettings = await Settings.update(userId, req.body);

    // Return updated settings
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: updatedSettings
      }
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user settings',
      error: error.message
    });
  }
};

// Reset user settings to default
exports.resetSettings = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id;

    // Reset settings to default
    const defaultSettings = await Settings.resetToDefault(userId);

    // Return default settings
    res.status(200).json({
      success: true,
      message: 'Settings reset to default',
      data: {
        settings: defaultSettings
      }
    });
  } catch (error) {
    console.error('Error resetting user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting user settings',
      error: error.message
    });
  }
};