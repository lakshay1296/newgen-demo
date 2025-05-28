const orderController = require('../../src/controllers/order.controller');
const Order = require('../../src/models/order.model');
const Customer = require('../../src/models/customer.model');
const Product = require('../../src/models/product.model');
const { validationResult } = require('express-validator');

// Mock dependencies
jest.mock('../../src/models/order.model');
jest.mock('../../src/models/customer.model');
jest.mock('../../src/models/product.model');
jest.mock('express-validator');

describe('Order Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request and response objects
    req = {
      body: {},
      params: {},
      query: {},
      user: {
        id: 1,
        role: 'staff'
      }
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
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      // Mock request body
      req.body = {
        customer_id: 1,
        payment_method: 'credit_card',
        payment_status: 'pending',
        shipping_address: '123 Main St',
        shipping_city: 'Anytown',
        shipping_state: 'CA',
        shipping_postal_code: '12345',
        shipping_country: 'USA',
        notes: 'Test order',
        order_items: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ]
      };

      // Mock Customer.findById to return a customer
      Customer.findById.mockResolvedValueOnce({
        customer_id: 1,
        first_name: 'John',
        last_name: 'Doe'
      });

      // Mock Product.findById to return products
      Product.findById.mockResolvedValueOnce({
        product_id: 1,
        name: 'Product 1',
        price: 10.99,
        stock_quantity: 5
      });
      Product.findById.mockResolvedValueOnce({
        product_id: 2,
        name: 'Product 2',
        price: 20.99,
        stock_quantity: 3
      });

      // Mock Order.create to return a new order
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        total_amount: 42.97,
        status: 'pending',
        payment_method: 'credit_card',
        payment_status: 'pending',
        items: [
          { product_id: 1, quantity: 2, unit_price: 10.99 },
          { product_id: 2, quantity: 1, unit_price: 20.99 }
        ]
      };
      Order.create.mockResolvedValueOnce(mockOrder);

      // Call the controller method
      await orderController.createOrder(req, res);

      // Assertions
      expect(Customer.findById).toHaveBeenCalledWith(req.body.customer_id);
      expect(Product.findById).toHaveBeenCalledWith(req.body.order_items[0].product_id);
      expect(Product.findById).toHaveBeenCalledWith(req.body.order_items[1].product_id);
      expect(Order.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order created successfully',
        data: {
          order: mockOrder
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
      await orderController.createOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: 'Validation error' }]
      });
    });

    it('should return 404 if customer is not found', async () => {
      // Mock request body
      req.body = {
        customer_id: 999,
        payment_method: 'credit_card',
        order_items: [
          { product_id: 1, quantity: 2 }
        ]
      };

      // Mock Customer.findById to return null
      Customer.findById.mockResolvedValueOnce(null);

      // Call the controller method
      await orderController.createOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Customer not found'
      });
    });

    it('should return 404 if a product is not found', async () => {
      // Mock request body
      req.body = {
        customer_id: 1,
        payment_method: 'credit_card',
        order_items: [
          { product_id: 999, quantity: 2 }
        ]
      };

      // Mock Customer.findById to return a customer
      Customer.findById.mockResolvedValueOnce({
        customer_id: 1,
        first_name: 'John',
        last_name: 'Doe'
      });

      // Mock Product.findById to return null
      Product.findById.mockResolvedValueOnce(null);

      // Call the controller method
      await orderController.createOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product with ID 999 not found'
      });
    });

    it('should return 400 if a product is out of stock', async () => {
      // Mock request body
      req.body = {
        customer_id: 1,
        payment_method: 'credit_card',
        order_items: [
          { product_id: 1, quantity: 10 }
        ]
      };

      // Mock Customer.findById to return a customer
      Customer.findById.mockResolvedValueOnce({
        customer_id: 1,
        first_name: 'John',
        last_name: 'Doe'
      });

      // Mock Product.findById to return a product with insufficient stock
      Product.findById.mockResolvedValueOnce({
        product_id: 1,
        name: 'Product 1',
        price: 10.99,
        stock_quantity: 5
      });

      // Call the controller method
      await orderController.createOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product Product 1 has insufficient stock. Available: 5, Requested: 10'
      });
    });

    it('should handle server errors', async () => {
      // Mock request body
      req.body = {
        customer_id: 1,
        payment_method: 'credit_card',
        order_items: [
          { product_id: 1, quantity: 2 }
        ]
      };

      // Mock Customer.findById to throw an error
      const error = new Error('Database error');
      Customer.findById.mockRejectedValueOnce(error);

      // Call the controller method
      await orderController.createOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error creating order',
        error: error.message
      });
    });
  });

  describe('getAllOrders', () => {
    it('should get all orders with pagination', async () => {
      // Mock request query
      req.query = {
        page: '1',
        limit: '10'
      };

      // Mock Order.findAll to return orders
      const mockOrders = [
        { order_id: 1, customer_id: 1, total_amount: 42.97 },
        { order_id: 2, customer_id: 2, total_amount: 35.98 }
      ];
      const mockPagination = {
        total: 2,
        limit: 10,
        offset: 0,
        page: 1,
        hasMore: false
      };
      Order.findAll.mockResolvedValueOnce({
        orders: mockOrders,
        pagination: mockPagination
      });

      // Call the controller method
      await orderController.getAllOrders(req, res);

      // Assertions
      expect(Order.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        customer_id: undefined,
        search: undefined
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          orders: mockOrders,
          pagination: mockPagination
        }
      });
    });

    it('should filter orders by status', async () => {
      // Mock request query
      req.query = {
        status: 'pending'
      };

      // Mock Order.findAll to return orders
      const mockOrders = [
        { order_id: 1, customer_id: 1, total_amount: 42.97, status: 'pending' }
      ];
      const mockPagination = {
        total: 1,
        limit: 10,
        offset: 0,
        page: 1,
        hasMore: false
      };
      Order.findAll.mockResolvedValueOnce({
        orders: mockOrders,
        pagination: mockPagination
      });

      // Call the controller method
      await orderController.getAllOrders(req, res);

      // Assertions
      expect(Order.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: 'pending',
        customer_id: undefined,
        search: undefined
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          orders: mockOrders,
          pagination: mockPagination
        }
      });
    });

    it('should handle server errors', async () => {
      // Mock Order.findAll to throw an error
      const error = new Error('Database error');
      Order.findAll.mockRejectedValueOnce(error);

      // Call the controller method
      await orderController.getAllOrders(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error getting orders',
        error: error.message
      });
    });
  });

  describe('getOrderById', () => {
    it('should get an order by ID successfully', async () => {
      // Mock request params
      req.params.id = '1';

      // Mock Order.findById to return an order
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        total_amount: 42.97,
        status: 'pending',
        items: [
          { product_id: 1, quantity: 2, unit_price: 10.99 },
          { product_id: 2, quantity: 1, unit_price: 20.99 }
        ]
      };
      Order.findById.mockResolvedValueOnce(mockOrder);

      // Call the controller method
      await orderController.getOrderById(req, res);

      // Assertions
      expect(Order.findById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          order: mockOrder
        }
      });
    });

    it('should return 404 if order is not found', async () => {
      // Mock request params
      req.params.id = '999';

      // Mock Order.findById to return null
      Order.findById.mockResolvedValueOnce(null);

      // Call the controller method
      await orderController.getOrderById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Order not found'
      });
    });

    it('should handle server errors', async () => {
      // Mock request params
      req.params.id = '1';

      // Mock Order.findById to throw an error
      const error = new Error('Database error');
      Order.findById.mockRejectedValueOnce(error);

      // Call the controller method
      await orderController.getOrderById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error getting order',
        error: error.message
      });
    });
  });

  describe('updateOrder', () => {
    it('should update an order successfully', async () => {
      // Mock request params and body
      req.params.id = '1';
      req.body = {
        status: 'processing',
        payment_status: 'paid',
        tracking_number: '123456789'
      };

      // Mock Order.findById to return an order
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        total_amount: 42.97,
        status: 'pending',
        payment_status: 'pending'
      };
      Order.findById.mockResolvedValueOnce(mockOrder);

      // Mock Order.update to return the updated order
      const mockUpdatedOrder = {
        ...mockOrder,
        status: 'processing',
        payment_status: 'paid',
        tracking_number: '123456789'
      };
      Order.update.mockResolvedValueOnce(mockUpdatedOrder);

      // Call the controller method
      await orderController.updateOrder(req, res);

      // Assertions
      expect(Order.findById).toHaveBeenCalledWith(1);
      expect(Order.update).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order updated successfully',
        data: {
          order: mockUpdatedOrder
        }
      });
    });

    it('should return 404 if order is not found', async () => {
      // Mock request params and body
      req.params.id = '999';
      req.body = {
        status: 'processing'
      };

      // Mock Order.findById to return null
      Order.findById.mockResolvedValueOnce(null);

      // Call the controller method
      await orderController.updateOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Order not found'
      });
    });

    it('should return 400 if update fails', async () => {
      // Mock request params and body
      req.params.id = '1';
      req.body = {
        status: 'processing'
      };

      // Mock Order.findById to return an order
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        total_amount: 42.97,
        status: 'pending'
      };
      Order.findById.mockResolvedValueOnce(mockOrder);

      // Mock Order.update to return null (update failed)
      Order.update.mockResolvedValueOnce(null);

      // Call the controller method
      await orderController.updateOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update order'
      });
    });

    it('should handle server errors', async () => {
      // Mock request params and body
      req.params.id = '1';
      req.body = {
        status: 'processing'
      };

      // Mock Order.findById to throw an error
      const error = new Error('Database error');
      Order.findById.mockRejectedValueOnce(error);

      // Call the controller method
      await orderController.updateOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error updating order',
        error: error.message
      });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order successfully', async () => {
      // Mock request params and body
      req.params.id = '1';
      req.body = {
        notes: 'Customer requested cancellation'
      };

      // Mock Order.findById to return an order
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        total_amount: 42.97,
        status: 'pending',
        items: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ]
      };
      Order.findById.mockResolvedValueOnce(mockOrder);

      // Mock Order.cancel to return the cancelled order
      const mockCancelledOrder = {
        ...mockOrder,
        status: 'cancelled'
      };
      Order.cancel.mockResolvedValueOnce(mockCancelledOrder);

      // Call the controller method
      await orderController.cancelOrder(req, res);

      // Assertions
      expect(Order.findById).toHaveBeenCalledWith(1);
      expect(Order.cancel).toHaveBeenCalledWith(1, req.body.notes, req.user.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order cancelled successfully',
        data: {
          order: mockCancelledOrder
        }
      });
    });

    it('should return 404 if order is not found', async () => {
      // Mock request params
      req.params.id = '999';

      // Mock Order.findById to return null
      Order.findById.mockResolvedValueOnce(null);

      // Call the controller method
      await orderController.cancelOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Order not found'
      });
    });

    it('should return 400 if order is already cancelled', async () => {
      // Mock request params
      req.params.id = '1';

      // Mock Order.findById to return a cancelled order
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        total_amount: 42.97,
        status: 'cancelled'
      };
      Order.findById.mockResolvedValueOnce(mockOrder);

      // Call the controller method
      await orderController.cancelOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Order is already cancelled'
      });
    });

    it('should return 400 if order is already delivered', async () => {
      // Mock request params
      req.params.id = '1';

      // Mock Order.findById to return a delivered order
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        total_amount: 42.97,
        status: 'delivered'
      };
      Order.findById.mockResolvedValueOnce(mockOrder);

      // Call the controller method
      await orderController.cancelOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot cancel an order that has been delivered'
      });
    });

    it('should handle server errors', async () => {
      // Mock request params
      req.params.id = '1';

      // Mock Order.findById to throw an error
      const error = new Error('Database error');
      Order.findById.mockRejectedValueOnce(error);

      // Call the controller method
      await orderController.cancelOrder(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error cancelling order',
        error: error.message
      });
    });
  });
});