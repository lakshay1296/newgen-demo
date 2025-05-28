const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, isStaffOrAdmin } = require('../middleware/auth.middleware');
const { validateOrderCreation } = require('../middleware/validation.middleware');

// Get all orders (staff/admin only)
router.get('/', authenticate, isStaffOrAdmin, orderController.getAllOrders);

// Get order statistics (staff/admin only)
router.get('/statistics', authenticate, isStaffOrAdmin, orderController.getStatistics);

// Get customer order history
router.get('/customer/:customerId', authenticate, orderController.getCustomerOrders);

// Get order by ID
router.get('/:id', authenticate, orderController.getOrderById);

// Create a new order
router.post('/', authenticate, validateOrderCreation, orderController.createOrder);

// Update order (staff/admin only)
router.put('/:id', authenticate, isStaffOrAdmin, orderController.updateOrder);

// Cancel order
router.post('/:id/cancel', authenticate, orderController.cancelOrder);

module.exports = router;