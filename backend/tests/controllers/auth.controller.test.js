const authController = require('../../src/controllers/auth.controller');
const User = require('../../src/models/user.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Mock dependencies
jest.mock('../../src/models/user.model');
jest.mock('jsonwebtoken');
jest.mock('express-validator');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request and response objects
    req = {
      body: {},
      user: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock validation result
    validationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([])
    });

    // Mock JWT sign
    jwt.sign.mockReturnValue('mock-token');

    // Set environment variable
    process.env.NODE_ENV = 'test';
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock request body
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'staff'
      };

      // Mock User.findByEmail to return null (user doesn't exist)
      User.findByEmail.mockResolvedValueOnce(null);
      User.findByUsername.mockResolvedValueOnce(null);

      // Mock User.create to return a new user
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'staff'
      };
      User.create.mockResolvedValueOnce(mockUser);

      // Call the controller method
      await authController.register(req, res);

      // Assertions
      expect(User.findByEmail).toHaveBeenCalledWith(req.body.email);
      expect(User.findByUsername).toHaveBeenCalledWith(req.body.username);
      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.user_id, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: {
          user: mockUser,
          token: 'mock-token'
        }
      });
    });

    it('should return 400 if validation fails', async () => {
      // Mock validation errors
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Validation error' }])
      });

      // Call the controller method
      await authController.register(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: 'Validation error' }]
      });
    });

    it('should return 400 if email is already registered', async () => {
      // Mock request body
      req.body = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock User.findByEmail to return an existing user
      User.findByEmail.mockResolvedValueOnce({ email: 'existing@example.com' });

      // Call the controller method
      await authController.register(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email is already registered'
      });
    });

    it('should return 400 if username is already taken', async () => {
      // Mock request body
      req.body = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findByEmail to return null
      User.findByEmail.mockResolvedValueOnce(null);

      // Mock User.findByUsername to return an existing user
      User.findByUsername.mockResolvedValueOnce({ username: 'existinguser' });

      // Call the controller method
      await authController.register(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username is already taken'
      });
    });

    it('should handle server errors', async () => {
      // Mock request body
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findByEmail to throw an error
      const error = new Error('Database error');
      User.findByEmail.mockRejectedValueOnce(error);

      // Call the controller method
      await authController.register(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error registering user',
        error: error.message
      });
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      // Mock request body
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findByEmail to return a user
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'staff'
      };
      User.findByEmail.mockResolvedValueOnce(mockUser);

      // Mock User.verifyPassword to return true
      User.verifyPassword.mockResolvedValueOnce(true);

      // Call the controller method
      await authController.login(req, res);

      // Assertions
      expect(User.findByEmail).toHaveBeenCalledWith(req.body.email);
      expect(User.verifyPassword).toHaveBeenCalledWith(req.body.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.user_id, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          user: expect.objectContaining({
            user_id: mockUser.user_id,
            username: mockUser.username,
            email: mockUser.email,
            role: mockUser.role
          }),
          token: 'mock-token'
        }
      });
      // Ensure password is not included in the response
      expect(res.json.mock.calls[0][0].data.user.password).toBeUndefined();
    });

    it('should return 400 if validation fails', async () => {
      // Mock validation errors
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Validation error' }])
      });

      // Call the controller method
      await authController.login(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: 'Validation error' }]
      });
    });

    it('should return 401 if user is not found', async () => {
      // Mock request body
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Mock User.findByEmail to return null
      User.findByEmail.mockResolvedValueOnce(null);

      // Call the controller method
      await authController.login(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return 401 if password is invalid', async () => {
      // Mock request body
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Mock User.findByEmail to return a user
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'staff'
      };
      User.findByEmail.mockResolvedValueOnce(mockUser);

      // Mock User.verifyPassword to return false
      User.verifyPassword.mockResolvedValueOnce(false);

      // Call the controller method
      await authController.login(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should handle server errors', async () => {
      // Mock request body
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findByEmail to throw an error
      const error = new Error('Database error');
      User.findByEmail.mockRejectedValueOnce(error);

      // Call the controller method
      await authController.login(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error logging in',
        error: error.message
      });
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      // Mock request user
      req.user = {
        id: 1
      };

      // Mock User.findById to return a user
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'staff'
      };
      User.findById.mockResolvedValueOnce(mockUser);

      // Call the controller method
      await authController.getProfile(req, res);

      // Assertions
      expect(User.findById).toHaveBeenCalledWith(req.user.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser
        }
      });
    });

    it('should return 404 if user is not found', async () => {
      // Mock request user
      req.user = {
        id: 999
      };

      // Mock User.findById to return null
      User.findById.mockResolvedValueOnce(null);

      // Call the controller method
      await authController.getProfile(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle server errors', async () => {
      // Mock request user
      req.user = {
        id: 1
      };

      // Mock User.findById to throw an error
      const error = new Error('Database error');
      User.findById.mockRejectedValueOnce(error);

      // Call the controller method
      await authController.getProfile(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error getting user profile',
        error: error.message
      });
    });
  });
});