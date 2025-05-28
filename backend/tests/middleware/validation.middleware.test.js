const { 
  validateUserRegistration, 
  validateLogin, 
  validateCustomerCreation,
  validateProductCreation,
  validateOrderCreation
} = require('../../src/middleware/validation.middleware');
const { body } = require('express-validator');

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(field => ({
    notEmpty: jest.fn().mockReturnThis(),
    isEmail: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    isString: jest.fn().mockReturnThis(),
    isNumeric: jest.fn().mockReturnThis(),
    isDecimal: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    custom: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    escape: jest.fn().mockReturnThis()
  }))
}));

describe('Validation Middleware', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('validateUserRegistration', () => {
    it('should validate username, email, password, and role', () => {
      // Call the middleware
      const validations = validateUserRegistration;

      // Assertions
      expect(body).toHaveBeenCalledWith('username');
      expect(body).toHaveBeenCalledWith('email');
      expect(body).toHaveBeenCalledWith('password');
      expect(body).toHaveBeenCalledWith('role');
      
      // Check that the returned array has the expected length
      expect(validations.length).toBe(4);
    });
  });

  describe('validateLogin', () => {
    it('should validate email and password', () => {
      // Call the middleware
      const validations = validateLogin;

      // Assertions
      expect(body).toHaveBeenCalledWith('email');
      expect(body).toHaveBeenCalledWith('password');
      
      // Check that the returned array has the expected length
      expect(validations.length).toBe(2);
    });
  });

  describe('validateCustomerCreation', () => {
    it('should validate customer fields', () => {
      // Call the middleware
      const validations = validateCustomerCreation;

      // Assertions
      expect(body).toHaveBeenCalledWith('first_name');
      expect(body).toHaveBeenCalledWith('last_name');
      expect(body).toHaveBeenCalledWith('email');
      
      // Optional fields
      expect(body).toHaveBeenCalledWith('phone');
      expect(body).toHaveBeenCalledWith('address');
      expect(body).toHaveBeenCalledWith('city');
      expect(body).toHaveBeenCalledWith('state');
      expect(body).toHaveBeenCalledWith('postal_code');
      expect(body).toHaveBeenCalledWith('country');
      
      // Check that the returned array has the expected length
      expect(validations.length).toBe(9);
    });
  });

  describe('validateProductCreation', () => {
    it('should validate product fields', () => {
      // Call the middleware
      const validations = validateProductCreation;

      // Assertions
      expect(body).toHaveBeenCalledWith('name');
      expect(body).toHaveBeenCalledWith('price');
      
      // Optional fields
      expect(body).toHaveBeenCalledWith('description');
      expect(body).toHaveBeenCalledWith('sku');
      expect(body).toHaveBeenCalledWith('stock_quantity');
      expect(body).toHaveBeenCalledWith('category');
      expect(body).toHaveBeenCalledWith('image_url');
      
      // Check that the returned array has the expected length
      expect(validations.length).toBe(7);
    });
  });

  describe('validateOrderCreation', () => {
    it('should validate order fields', () => {
      // Call the middleware
      const validations = validateOrderCreation;

      // Assertions
      expect(body).toHaveBeenCalledWith('customer_id');
      expect(body).toHaveBeenCalledWith('payment_method');
      expect(body).toHaveBeenCalledWith('order_items');
      
      // Optional fields
      expect(body).toHaveBeenCalledWith('payment_status');
      expect(body).toHaveBeenCalledWith('shipping_address');
      expect(body).toHaveBeenCalledWith('shipping_city');
      expect(body).toHaveBeenCalledWith('shipping_state');
      expect(body).toHaveBeenCalledWith('shipping_postal_code');
      expect(body).toHaveBeenCalledWith('shipping_country');
      expect(body).toHaveBeenCalledWith('notes');
      
      // Check that the returned array has the expected length
      expect(validations.length).toBe(10);
    });
  });
});