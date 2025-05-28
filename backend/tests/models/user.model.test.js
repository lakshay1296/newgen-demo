const User = require('../../src/models/user.model');
const { pool } = require('../../src/config/db');

// Mock the database connection
jest.mock('../../src/config/db', () => ({
  pool: {
    execute: jest.fn(),
    getConnection: jest.fn()
  }
}));

describe('User Model', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      // Mock data
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'staff'
      };

      // Mock bcrypt
      jest.spyOn(require('bcrypt'), 'genSalt').mockResolvedValue('salt');
      jest.spyOn(require('bcrypt'), 'hash').mockResolvedValue('hashedPassword');

      // Mock database responses
      pool.execute.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1 }]);
      
      // Mock findById method
      jest.spyOn(User, 'findById').mockResolvedValue({
        user_id: 1,
        username: userData.username,
        email: userData.email,
        role: userData.role
      });

      // Call the method
      const result = await User.create(userData);

      // Assertions
      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [userData.username, userData.email, 'hashedPassword', userData.role]
      );
      expect(User.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        user_id: 1,
        username: userData.username,
        email: userData.email,
        role: userData.role
      });
    });

    it('should return null if user creation fails', async () => {
      // Mock data
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock bcrypt
      jest.spyOn(require('bcrypt'), 'genSalt').mockResolvedValue('salt');
      jest.spyOn(require('bcrypt'), 'hash').mockResolvedValue('hashedPassword');

      // Mock database responses for failed creation
      pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      // Call the method
      const result = await User.create(userData);

      // Assertions
      expect(result).toBeNull();
    });

    it('should throw an error if database operation fails', async () => {
      // Mock data
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock bcrypt
      jest.spyOn(require('bcrypt'), 'genSalt').mockResolvedValue('salt');
      jest.spyOn(require('bcrypt'), 'hash').mockResolvedValue('hashedPassword');

      // Mock database error
      const dbError = new Error('Database error');
      pool.execute.mockRejectedValueOnce(dbError);

      // Call the method and expect it to throw
      await expect(User.create(userData)).rejects.toThrow(dbError);
    });
  });

  describe('findById', () => {
    it('should find a user by ID successfully', async () => {
      // Mock user data
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'staff',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      // Mock database response
      pool.execute.mockResolvedValueOnce([[mockUser]]);

      // Call the method
      const result = await User.findById(1);

      // Assertions
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT user_id, username, email, role, created_at, updated_at FROM users WHERE user_id = ?',
        [1]
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      // Mock empty database response
      pool.execute.mockResolvedValueOnce([[]]);

      // Call the method
      const result = await User.findById(999);

      // Assertions
      expect(result).toBeNull();
    });

    it('should throw an error if database operation fails', async () => {
      // Mock database error
      const dbError = new Error('Database error');
      pool.execute.mockRejectedValueOnce(dbError);

      // Call the method and expect it to throw
      await expect(User.findById(1)).rejects.toThrow(dbError);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email successfully', async () => {
      // Mock user data
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'staff'
      };

      // Mock database response
      pool.execute.mockResolvedValueOnce([[mockUser]]);

      // Call the method
      const result = await User.findByEmail('test@example.com');

      // Assertions
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      // Mock empty database response
      pool.execute.mockResolvedValueOnce([[]]);

      // Call the method
      const result = await User.findByEmail('nonexistent@example.com');

      // Assertions
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      // Mock data
      const userId = 1;
      const userData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      // Mock database response
      pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock findById method
      jest.spyOn(User, 'findById').mockResolvedValue({
        user_id: userId,
        username: userData.username,
        email: userData.email,
        role: 'staff'
      });

      // Call the method
      const result = await User.update(userId, userData);

      // Assertions
      expect(pool.execute).toHaveBeenCalled();
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        user_id: userId,
        username: userData.username,
        email: userData.email,
        role: 'staff'
      });
    });

    it('should update password if provided', async () => {
      // Mock data
      const userId = 1;
      const userData = {
        password: 'newpassword'
      };

      // Mock bcrypt
      jest.spyOn(require('bcrypt'), 'genSalt').mockResolvedValue('salt');
      jest.spyOn(require('bcrypt'), 'hash').mockResolvedValue('newHashedPassword');

      // Mock database response
      pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock findById method
      jest.spyOn(User, 'findById').mockResolvedValue({
        user_id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'staff'
      });

      // Call the method
      await User.update(userId, userData);

      // Assertions
      expect(require('bcrypt').genSalt).toHaveBeenCalled();
      expect(require('bcrypt').hash).toHaveBeenCalledWith(userData.password, 'salt');
      expect(pool.execute).toHaveBeenCalledWith(
        'UPDATE users SET password = ? WHERE user_id = ?',
        ['newHashedPassword', userId]
      );
    });

    it('should return null if update fails', async () => {
      // Mock data
      const userId = 1;
      const userData = {
        username: 'updateduser'
      };

      // Mock database response for failed update
      pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      // Call the method
      const result = await User.update(userId, userData);

      // Assertions
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      // Mock database response
      pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      // Call the method
      const result = await User.delete(1);

      // Assertions
      expect(pool.execute).toHaveBeenCalledWith(
        'DELETE FROM users WHERE user_id = ?',
        [1]
      );
      expect(result).toBe(true);
    });

    it('should return false if user is not found', async () => {
      // Mock database response for failed deletion
      pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      // Call the method
      const result = await User.delete(999);

      // Assertions
      expect(result).toBe(false);
    });
  });

  describe('verifyPassword', () => {
    it('should verify password correctly', async () => {
      // Mock bcrypt compare
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      // Call the method
      const result = await User.verifyPassword('password123', 'hashedPassword');

      // Assertions
      expect(require('bcrypt').compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      // Mock bcrypt compare
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      // Call the method
      const result = await User.verifyPassword('wrongpassword', 'hashedPassword');

      // Assertions
      expect(result).toBe(false);
    });
  });
});