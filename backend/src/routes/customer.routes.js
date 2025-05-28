const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate, isStaffOrAdmin } = require('../middleware/auth.middleware');
const { validateCustomerCreation } = require('../middleware/validation.middleware');

// Get all customers (staff/admin only)
router.get('/', authenticate, isStaffOrAdmin, customerController.getAllCustomers);

// Get customer by ID (staff/admin only)
router.get('/:id', authenticate, isStaffOrAdmin, customerController.getCustomerById);

// Create a new customer (staff/admin only)
router.post('/', authenticate, isStaffOrAdmin, validateCustomerCreation, customerController.createCustomer);

// Update customer (staff/admin only)
router.put('/:id', authenticate, isStaffOrAdmin, customerController.updateCustomer);

// Delete customer (staff/admin only)
router.delete('/:id', authenticate, isStaffOrAdmin, customerController.deleteCustomer);

module.exports = router;