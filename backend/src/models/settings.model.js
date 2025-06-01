const { pool } = require('../config/db');

class Settings {
  // Get settings for a user
  static async getByUserId(userId) {
    try {
      // Check if settings exist for the user
      const [rows] = await pool.execute(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );

      // If settings exist, return them
      if (rows.length > 0) {
        return rows[0];
      }

      // If settings don't exist, create default settings
      return this.createDefault(userId);
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  // Create default settings for a user
  static async createDefault(userId) {
    try {
      const defaultSettings = {
        email_notifications: true,
        dark_mode: false,
        auto_refresh: true,
        refresh_interval: 5,
        default_page_size: 10
      };

      // Insert default settings
      const [result] = await pool.execute(
        `INSERT INTO user_settings 
        (user_id, email_notifications, dark_mode, auto_refresh, refresh_interval, default_page_size) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          defaultSettings.email_notifications, 
          defaultSettings.dark_mode, 
          defaultSettings.auto_refresh, 
          defaultSettings.refresh_interval, 
          defaultSettings.default_page_size
        ]
      );

      // Return the created settings
      if (result.insertId) {
        return {
          settings_id: result.insertId,
          user_id: userId,
          ...defaultSettings,
          created_at: new Date(),
          updated_at: new Date()
        };
      }

      return null;
    } catch (error) {
      console.error('Error creating default user settings:', error);
      throw error;
    }
  }

  // Update settings for a user
  static async update(userId, settingsData) {
    try {
      // Start building the query
      const fields = [];
      const values = [];

      // Add fields that are present in the request
      if (settingsData.email_notifications !== undefined) {
        fields.push('email_notifications = ?');
        values.push(settingsData.email_notifications);
      }

      if (settingsData.dark_mode !== undefined) {
        fields.push('dark_mode = ?');
        values.push(settingsData.dark_mode);
      }

      if (settingsData.auto_refresh !== undefined) {
        fields.push('auto_refresh = ?');
        values.push(settingsData.auto_refresh);
      }

      if (settingsData.refresh_interval !== undefined) {
        fields.push('refresh_interval = ?');
        values.push(settingsData.refresh_interval);
      }

      if (settingsData.default_page_size !== undefined) {
        fields.push('default_page_size = ?');
        values.push(settingsData.default_page_size);
      }

      // If no fields to update, return the current settings
      if (fields.length === 0) {
        return this.getByUserId(userId);
      }

      // Add user_id to values
      values.push(userId);

      // Execute the update query
      const [result] = await pool.execute(
        `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`,
        values
      );

      // If no rows were affected, the settings might not exist yet
      if (result.affectedRows === 0) {
        // Try to create default settings first
        await this.createDefault(userId);
        
        // Then update with the provided data
        return this.update(userId, settingsData);
      }

      // Return the updated settings
      return this.getByUserId(userId);
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Reset settings to default for a user
  static async resetToDefault(userId) {
    try {
      // Delete existing settings
      await pool.execute(
        'DELETE FROM user_settings WHERE user_id = ?',
        [userId]
      );

      // Create default settings
      return this.createDefault(userId);
    } catch (error) {
      console.error('Error resetting user settings:', error);
      throw error;
    }
  }
}

module.exports = Settings;