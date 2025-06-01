const { body } = require('express-validator');

// Validate user registration
exports.validateUserRegistration = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isString().withMessage('Username must be a string')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'staff', 'customer']).withMessage('Invalid role')
];

// Validate login
exports.validateLogin = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Validate customer creation
exports.validateCustomerCreation = [
  body('first_name')
    .notEmpty().withMessage('First name is required')
    .isString().withMessage('First name must be a string')
    .isLength({ max: 50 }).withMessage('First name must be at most 50 characters'),
  
  body('last_name')
    .notEmpty().withMessage('Last name is required')
    .isString().withMessage('Last name must be a string')
    .isLength({ max: 50 }).withMessage('Last name must be at most 50 characters'),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('phone')
    .optional()
    .isString().withMessage('Phone must be a string'),
  
  body('address')
    .optional()
    .isString().withMessage('Address must be a string'),
  
  body('city')
    .optional()
    .isString().withMessage('City must be a string'),
  
  body('state')
    .optional()
    .isString().withMessage('State must be a string'),
  
  body('postal_code')
    .optional()
    .isString().withMessage('Postal code must be a string'),
  
  body('country')
    .optional()
    .isString().withMessage('Country must be a string')
];

// Validate product creation
exports.validateProductCreation = [
  body('name')
    .notEmpty().withMessage('Product name is required')
    .isString().withMessage('Product name must be a string')
    .isLength({ max: 100 }).withMessage('Product name must be at most 100 characters'),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isNumeric().withMessage('Price must be a number')
    .custom(value => value >= 0).withMessage('Price must be non-negative'),
  
  body('sku')
    .optional()
    .isString().withMessage('SKU must be a string'),
  
  body('stock_quantity')
    .optional()
    .isNumeric().withMessage('Stock quantity must be a number')
    .custom(value => value >= 0).withMessage('Stock quantity must be non-negative'),
  
  body('category')
    .optional()
    .isString().withMessage('Category must be a string'),
  
  body('image_url')
    .optional()
    .isString().withMessage('Image URL must be a string')
];

// Validate order creation
exports.validateOrderCreation = [
  body('customer_id')
    .notEmpty().withMessage('Customer ID is required')
    .isNumeric().withMessage('Customer ID must be a number'),
  
  body('payment_method')
    .notEmpty().withMessage('Payment method is required')
    .isString().withMessage('Payment method must be a string')
    .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'])
    .withMessage('Invalid payment method'),
  
  body('payment_status')
    .optional()
    .isString().withMessage('Payment status must be a string')
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  
  body('shipping_address')
    .optional()
    .isString().withMessage('Shipping address must be a string'),
  
  body('shipping_city')
    .optional()
    .isString().withMessage('Shipping city must be a string'),
  
  body('shipping_state')
    .optional()
    .isString().withMessage('Shipping state must be a string'),
  
  body('shipping_postal_code')
    .optional()
    .isString().withMessage('Shipping postal code must be a string'),
  
  body('shipping_country')
    .optional()
    .isString().withMessage('Shipping country must be a string'),
  
  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string'),
  
  body('order_items')
    .notEmpty().withMessage('Order items are required')
    .isArray().withMessage('Order items must be an array')
    .custom(items => items.length > 0).withMessage('Order must have at least one item')
];

// Validate settings update
exports.validateSettingsUpdate = [
  body('email_notifications')
    .optional()
    .isBoolean().withMessage('Email notifications must be a boolean'),
  
  body('dark_mode')
    .optional()
    .isBoolean().withMessage('Dark mode must be a boolean'),
  
  body('auto_refresh')
    .optional()
    .isBoolean().withMessage('Auto refresh must be a boolean'),
  
  body('refresh_interval')
    .optional()
    .isInt({ min: 1, max: 60 }).withMessage('Refresh interval must be between 1 and 60 minutes'),
  
  body('default_page_size')
    .optional()
    .isInt({ min: 5, max: 100 }).withMessage('Default page size must be between 5 and 100 items')
];