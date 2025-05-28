const { authenticate, isAdmin, isStaffOrAdmin } = require('../../src/middleware/auth.middleware');
const User = require('../../src/models/user.model');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../src/models/user.model');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      headers: {},
      user: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();

    // Set environment variable
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticate', () => {
    it('should authenticate a valid token', async () => {
      // Mock request headers
      req.headers.authorization = 'Bearer valid-token';

      // Mock jwt.verify to return a decoded token
      const decodedToken = { id: 1, role: 'staff' };
      jwt.verify.mockReturnValue(decodedToken);

      // Mock User.findById to return a user
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'staff'
      };
      User.findById.mockResolvedValueOnce(mockUser);

      // Call the middleware
      await authenticate(req, res, next);

      // Assertions
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(decodedToken.id);
      expect(req.user).toEqual({
        id: mockUser.user_id,
        role: mockUser.role
      });
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', async () => {
      // Call the middleware
      await authenticate(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token format is invalid', async () => {
      // Mock request headers with invalid token format
      req.headers.authorization = 'InvalidToken';

      // Call the middleware
      await authenticate(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is expired', async () => {
      // Mock request headers
      req.headers.authorization = 'Bearer expired-token';

      // Mock jwt.verify to throw a TokenExpiredError
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      // Call the middleware
      await authenticate(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      // Mock request headers
      req.headers.authorization = 'Bearer invalid-token';

      // Mock jwt.verify to throw a JsonWebTokenError
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      // Call the middleware
      await authenticate(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not found', async () => {
      // Mock request headers
      req.headers.authorization = 'Bearer valid-token';

      // Mock jwt.verify to return a decoded token
      const decodedToken = { id: 999, role: 'staff' };
      jwt.verify.mockReturnValue(decodedToken);

      // Mock User.findById to return null
      User.findById.mockResolvedValueOnce(null);

      // Call the middleware
      await authenticate(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token. User not found.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle server errors', async () => {
      // Mock request headers
      req.headers.authorization = 'Bearer valid-token';

      // Mock jwt.verify to return a decoded token
      const decodedToken = { id: 1, role: 'staff' };
      jwt.verify.mockReturnValue(decodedToken);

      // Mock User.findById to throw an error
      const error = new Error('Database error');
      User.findById.mockRejectedValueOnce(error);

      // Call the middleware
      await authenticate(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication error',
        error: error.message
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('should allow access to admin users', () => {
      // Mock request user
      req.user = {
        id: 1,
        role: 'admin'
      };

      // Call the middleware
      isAdmin(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });

    it('should deny access to non-admin users', () => {
      // Mock request user
      req.user = {
        id: 1,
        role: 'staff'
      };

      // Call the middleware
      isAdmin(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin role required.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access if user is not authenticated', () => {
      // Call the middleware
      isAdmin(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin role required.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isStaffOrAdmin', () => {
    it('should allow access to admin users', () => {
      // Mock request user
      req.user = {
        id: 1,
        role: 'admin'
      };

      // Call the middleware
      isStaffOrAdmin(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });

    it('should allow access to staff users', () => {
      // Mock request user
      req.user = {
        id: 1,
        role: 'staff'
      };

      // Call the middleware
      isStaffOrAdmin(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });

    it('should deny access to customer users', () => {
      // Mock request user
      req.user = {
        id: 1,
        role: 'customer'
      };

      // Call the middleware
      isStaffOrAdmin(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Staff or admin role required.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access if user is not authenticated', () => {
      // Call the middleware
      isStaffOrAdmin(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Staff or admin role required.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});