const Customer = require('../models/customer.model');
const { validationResult } = require('express-validator');

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    // Get customers
    const result = await Customer.findAll({ page, limit, search });

    // Return customers
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting customers',
      error: error.message,
      data: {
        customers: [],
        pagination: {
          total: 0,
          limit: parseInt(req.query.limit) || 10,
          offset: 0,
          page: 1,
          hasMore: false
        }
      }
    });
  }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get customer
    const customer = await Customer.findById(parseInt(id));
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Return customer
    res.status(200).json({
      success: true,
      data: {
        customer
      }
    });
  } catch (error) {
    console.error('Error getting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting customer',
      error: error.message
    });
  }
};

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if email is already registered
    if (req.body.email) {
      const existingCustomer = await Customer.findByEmail(req.body.email);
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered'
        });
      }
    }

    // Create customer
    const customer = await Customer.create(req.body);
    if (!customer) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create customer'
      });
    }

    // Return customer data
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        customer
      }
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = await Customer.findById(parseInt(id));
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if email is already registered
    if (req.body.email && req.body.email !== customer.email) {
      const existingCustomer = await Customer.findByEmail(req.body.email);
      if (existingCustomer && existingCustomer.customer_id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered'
        });
      }
    }

    // Update customer
    const updatedCustomer = await Customer.update(parseInt(id), req.body);
    if (!updatedCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update customer'
      });
    }

    // Return updated customer data
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: {
        customer: updatedCustomer
      }
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = await Customer.findById(parseInt(id));
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Delete customer
    const deleted = await Customer.delete(parseInt(id));
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete customer'
      });
    }

    // Return success message
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};