const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const { validationResult } = require('express-validator');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const customer_id = req.query.customer_id ? parseInt(req.query.customer_id) : undefined;
    const search = req.query.search || '';

    // Get orders
    const result = await Order.findAll({ page, limit, status, customer_id, search });

    // Return orders
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting orders',
      error: error.message,
      data: {
        orders: [],
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

// Get order statistics
exports.getStatistics = async (req, res) => {
  try {
    // Parse date range parameters
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    // Get statistics
    const statistics = await Order.getStatistics({ start_date, end_date });

    // Return statistics
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error getting order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting order statistics',
      error: error.message
    });
  }
};

// Get customer orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Check if customer exists
    const customer = await Customer.findById(parseInt(customerId));
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if user has permission to view customer orders
    if (req.user.role === 'customer' && req.user.id !== customer.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    // Get customer orders
    const result = await Order.findByCustomerId(parseInt(customerId), { page, limit });

    // Return orders
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting customer orders',
      error: error.message
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order
    const order = await Order.findById(parseInt(id));
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has permission to view order
    if (req.user.role === 'customer' && req.user.id !== order.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    // Return order
    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting order',
      error: error.message
    });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(req.body.customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if user has permission to create order for this customer
    if (req.user.role === 'customer' && req.user.id !== customer.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create orders for yourself.'
      });
    }

    // Validate order items
    const orderItems = req.body.order_items;
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item'
      });
    }

    // Check if products exist and have sufficient stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product_id} not found`
        });
      }

      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} has insufficient stock. Available: ${product.stock_quantity}, Requested: ${item.quantity}`
        });
      }
    }

    // Set default values
    req.body.status = 'pending';
    req.body.created_by = req.user.id;

    // Create order
    const order = await Order.create(req.body);
    if (!order) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create order'
      });
    }

    // Return order data
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order exists
    const order = await Order.findById(parseInt(id));
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a cancelled order'
      });
    }

    // Add user ID to request body
    req.body.updated_by = req.user.id;

    // Update order
    const updatedOrder = await Order.update(parseInt(id), req.body);
    if (!updatedOrder) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update order'
      });
    }

    // Return updated order data
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: {
        order: updatedOrder
      }
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if order exists
    const order = await Order.findById(parseInt(id));
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Check if order is already delivered
    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an order that has been delivered'
      });
    }

    // Check if user has permission to cancel order
    if (req.user.role === 'customer' && req.user.id !== order.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own orders.'
      });
    }

    // Cancel order
    const cancelledOrder = await Order.cancel(parseInt(id), notes, req.user.id);
    if (!cancelledOrder) {
      return res.status(400).json({
        success: false,
        message: 'Failed to cancel order'
      });
    }

    // Return cancelled order data
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order: cancelledOrder
      }
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};