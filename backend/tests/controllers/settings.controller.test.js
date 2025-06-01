const request = require('supertest');
const app = require('../../src/server');
const jwt = require('jsonwebtoken');
const Settings = require('../../src/models/settings.model');

// Mock the Settings model
jest.mock('../../src/models/settings.model');

describe('Settings Controller', () => {
  let token;
  
  beforeEach(() => {
    // Create a valid token for testing
    token = jwt.sign(
      { id: 1, role: 'admin' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
    
    // Reset all mocks
    jest.clearAllMocks();
  });
  
  describe('GET /api/settings', () => {
    it('should return user settings', async () => {
      // Mock the getByUserId method
      Settings.getByUserId.mockResolvedValue({
        settings_id: 1,
        user_id: 1,
        email_notifications: true,
        dark_mode: false,
        auto_refresh: true,
        refresh_interval: 5,
        default_page_size: 10,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      const response = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.settings).toBeDefined();
      expect(Settings.getByUserId).toHaveBeenCalledWith(1);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/settings');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    it('should handle errors', async () => {
      // Mock the getByUserId method to throw an error
      Settings.getByUserId.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error getting user settings');
    });
  });
  
  describe('PUT /api/settings', () => {
    it('should update user settings', async () => {
      // Mock the update method
      Settings.update.mockResolvedValue({
        settings_id: 1,
        user_id: 1,
        email_notifications: false,
        dark_mode: true,
        auto_refresh: false,
        refresh_interval: 10,
        default_page_size: 20,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      const settingsData = {
        email_notifications: false,
        dark_mode: true,
        auto_refresh: false,
        refresh_interval: 10,
        default_page_size: 20
      };
      
      const response = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send(settingsData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Settings updated successfully');
      expect(response.body.data.settings).toBeDefined();
      expect(Settings.update).toHaveBeenCalledWith(1, settingsData);
    });
    
    it('should return 400 for invalid data', async () => {
      const settingsData = {
        refresh_interval: 'invalid', // Should be a number
        default_page_size: 200 // Should be between 5 and 100
      };
      
      const response = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send(settingsData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .put('/api/settings')
        .send({});
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    it('should handle errors', async () => {
      // Mock the update method to throw an error
      Settings.update.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          dark_mode: true
        });
      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error updating user settings');
    });
  });
  
  describe('POST /api/settings/reset', () => {
    it('should reset user settings to default', async () => {
      // Mock the resetToDefault method
      Settings.resetToDefault.mockResolvedValue({
        settings_id: 1,
        user_id: 1,
        email_notifications: true,
        dark_mode: false,
        auto_refresh: true,
        refresh_interval: 5,
        default_page_size: 10,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      const response = await request(app)
        .post('/api/settings/reset')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Settings reset to default');
      expect(response.body.data.settings).toBeDefined();
      expect(Settings.resetToDefault).toHaveBeenCalledWith(1);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/settings/reset');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    it('should handle errors', async () => {
      // Mock the resetToDefault method to throw an error
      Settings.resetToDefault.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app)
        .post('/api/settings/reset')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error resetting user settings');
    });
  });
});