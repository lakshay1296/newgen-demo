const { pool } = require('../config/db');
const Product = require('./product.model');

class Order {
  // Create a new order
  static async create(orderData) {
    // Get connection and start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert order into database
      const [orderResult] = await connection.execute(
        `INSERT INTO orders 
        (customer_id, status, payment_method, payment_status, shipping_address, 
        shipping_city, shipping_state, shipping_postal_code, shipping_country, 
        notes, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderData.customer_id,
          orderData.status || 'pending',
          orderData.payment_method,
          orderData.payment_status || 'pending',
          orderData.shipping_address || null,
          orderData.shipping_city || null,
          orderData.shipping_state || null,
          orderData.shipping_postal_code || null,
          orderData.shipping_country || null,
          orderData.notes || null,
          orderData.created_by
        ]
      );

      const orderId = orderResult.insertId;
      let totalAmount = 0;

      // Insert order items
      for (const item of orderData.order_items) {
        // Get product details
        const product = await Product.findById(item.product_id);
        if (!product) {
          await connection.rollback();
          connection.release();
          return null;
        }

        // Calculate subtotal
        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        // Insert order item
        await connection.execute(
          `INSERT INTO order_items 
          (order_id, product_id, quantity, unit_price, subtotal) 
          VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.quantity,
            product.price,
            subtotal
          ]
        );

        // Update product stock
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Update order total amount
      await connection.execute(
        'UPDATE orders SET total_amount = ? WHERE order_id = ?',
        [totalAmount, orderId]
      );

      // Add order history entry
      await connection.execute(
        `INSERT INTO order_history 
        (order_id, status, notes, created_by) 
        VALUES (?, ?, ?, ?)`,
        [
          orderId,
          orderData.status || 'pending',
          'Order created',
          orderData.created_by
        ]
      );

      // Commit transaction
      await connection.commit();
      connection.release();

      // Return order data
      return this.findById(orderId);
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Find all orders with pagination
  static async findAll({ page = 1, limit = 10, search = '' }) {
    try {
      const offset = (page - 1) * limit;
  
      let query = `
        SELECT o.*, 
               c.first_name, c.last_name, c.email,
               u.username as created_by_username
          FROM orders o
          LEFT JOIN customers c ON o.customer_id = c.customer_id
          LEFT JOIN users u ON o.created_by = u.user_id
      `;
      const params = [];
  
      if (search) {
        query += ` WHERE c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? `;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Add pagination with direct values instead of parameters
      const numericLimit = parseInt(limit, 10);
      const numericOffset = parseInt(offset, 10);
  
      query += ` ORDER BY customer_id DESC LIMIT ${numericLimit} OFFSET ${numericOffset}`;
  
      const [rows] = await pool.execute(query, params);

      // Get total count
      const [countResult] = await pool.execute(
        `SELECT COUNT(*) as total FROM customers${search ? ` WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?` : ''}`,
        search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []
      );

      const total = countResult[0].total;
  
      return {
        orders: rows,
        pagination: {
          total,
          limit,
          offset,
          page,
          hasMore: offset + rows.length < total
        }
      };
  
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }
  

  // Get order statistics
  static async getStatistics({ start_date = null, end_date = null }) {
    try {
      // Build date condition
      let dateCondition = '';
      const params = [];

      if (start_date && end_date) {
        dateCondition = 'WHERE o.order_date BETWEEN ? AND ?';
        params.push(start_date, end_date);
      } else if (start_date) {
        dateCondition = 'WHERE o.order_date >= ?';
        params.push(start_date);
      } else if (end_date) {
        dateCondition = 'WHERE o.order_date <= ?';
        params.push(end_date);
      }

      // Get total orders and revenue
      const [totalResult] = await pool.execute(
        `SELECT COUNT(*) as totalOrders, COALESCE(SUM(total_amount), 0) as totalRevenue 
        FROM orders o ${dateCondition}`,
        params
      );

      // Get orders by status
      const [statusResult] = await pool.execute(
        `SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue 
        FROM orders o ${dateCondition} 
        GROUP BY status 
        ORDER BY count DESC`,
        params
      );

      // Get orders by payment method
      const [paymentResult] = await pool.execute(
        `SELECT payment_method, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue 
        FROM orders o ${dateCondition} 
        GROUP BY payment_method 
        ORDER BY revenue DESC`,
        params
      );

      // Get top products
      const [productResult] = await pool.execute(
        `SELECT oi.product_id, p.name, SUM(oi.quantity) as total_quantity, 
        COALESCE(SUM(oi.subtotal), 0) as total_revenue 
        FROM order_items oi 
        JOIN orders o ON oi.order_id = o.order_id 
        JOIN products p ON oi.product_id = p.product_id 
        ${dateCondition} 
        GROUP BY oi.product_id, p.name 
        ORDER BY total_revenue DESC 
        LIMIT 10`,
        params
      );

      // Return statistics
      return {
        totalOrders: totalResult[0].totalOrders,
        totalRevenue: totalResult[0].totalRevenue,
        ordersByStatus: statusResult,
        ordersByPaymentMethod: paymentResult,
        topProducts: productResult
      };
    } catch (error) {
      console.error('Error getting order statistics:', error);
      throw error;
    }
  }

  // Find orders by customer ID
  static async findByCustomerId(customerId, { page = 1, limit = 10 }) {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Get orders
      // Convert limit and offset to integers and ensure they're valid numbers
      const numericLimit = parseInt(limit, 10);
      const numericOffset = parseInt(offset, 10);
      
      const [rows] = await pool.execute(
        `SELECT * FROM orders
        WHERE customer_id = ?
        ORDER BY order_id DESC
        LIMIT ${numericLimit} OFFSET ${numericOffset}`,
        [customerId]
      );

      // Get total count
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM orders WHERE customer_id = ?',
        [customerId]
      );
      const total = countResult[0].total;

      // Return orders with pagination info
      return {
        orders: rows,
        pagination: {
          total,
          limit,
          offset,
          page,
          hasMore: offset + rows.length < total
        }
      };
    } catch (error) {
      console.error('Error finding customer orders:', error);
      throw error;
    }
  }

  // Find order by ID
  static async findById(id) {
    try {
      // Get order
      const [orderRows] = await pool.execute(
        `SELECT o.*, 
        c.first_name, c.last_name, c.email, c.phone,
        u.username as created_by_username
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.customer_id
        LEFT JOIN users u ON o.created_by = u.user_id
        WHERE o.order_id = ?`,
        [id]
      );

      if (orderRows.length === 0) {
        return null;
      }

      const order = orderRows[0];

      // Get order items
      const [itemRows] = await pool.execute(
        `SELECT oi.*, p.name as product_name, p.sku
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?`,
        [id]
      );

      // Get order history
      const [historyRows] = await pool.execute(
        `SELECT oh.*, u.username as created_by_username
        FROM order_history oh
        LEFT JOIN users u ON oh.created_by = u.user_id
        WHERE oh.order_id = ?
        ORDER BY oh.created_at DESC`,
        [id]
      );

      // Add items and history to order
      order.items = itemRows;
      order.history = historyRows;

      return order;
    } catch (error) {
      console.error('Error finding order by ID:', error);
      throw error;
    }
  }

  // Update order
  static async update(id, orderData) {
    // Get connection and start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Build query
      const fields = [];
      const values = [];

      // Add fields to update
      if (orderData.status !== undefined) {
        fields.push('status = ?');
        values.push(orderData.status);
      }

      if (orderData.payment_status !== undefined) {
        fields.push('payment_status = ?');
        values.push(orderData.payment_status);
      }

      if (orderData.tracking_number !== undefined) {
        fields.push('tracking_number = ?');
        values.push(orderData.tracking_number);
      }

      if (orderData.notes !== undefined) {
        fields.push('notes = ?');
        values.push(orderData.notes);
      }

      // If no fields to update
      if (fields.length === 0) {
        connection.release();
        return this.findById(id);
      }

      // Add updated_at and updated_by fields
      fields.push('updated_at = CURRENT_TIMESTAMP');
      fields.push('updated_by = ?');
      values.push(orderData.updated_by);

      // Add ID to values
      values.push(id);

      // Execute query
      const [result] = await connection.execute(
        `UPDATE orders SET ${fields.join(', ')} WHERE order_id = ?`,
        values
      );

      // Check if order was updated
      if (result.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return null;
      }

      // Add order history entry if status changed
      if (orderData.status !== undefined) {
        await connection.execute(
          `INSERT INTO order_history 
          (order_id, status, notes, created_by) 
          VALUES (?, ?, ?, ?)`,
          [
            id,
            orderData.status,
            orderData.notes || `Status changed to ${orderData.status}`,
            orderData.updated_by
          ]
        );
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      // Return updated order data
      return this.findById(id);
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Cancel order
  static async cancel(id, notes, userId) {
    // Get connection and start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get order
      const [orderRows] = await connection.execute(
        'SELECT * FROM orders WHERE order_id = ?',
        [id]
      );

      if (orderRows.length === 0) {
        await connection.rollback();
        connection.release();
        return null;
      }

      const order = orderRows[0];

      // Check if order is already cancelled
      if (order.status === 'cancelled') {
        await connection.rollback();
        connection.release();
        return null;
      }

      // Get order items
      const [itemRows] = await connection.execute(
        'SELECT * FROM order_items WHERE order_id = ?',
        [id]
      );

      // Update order status
      const [result] = await connection.execute(
        'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE order_id = ?',
        ['cancelled', userId, id]
      );

      // Check if order was updated
      if (result.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return null;
      }

      // Add order history entry
      await connection.execute(
        `INSERT INTO order_history 
        (order_id, status, notes, created_by) 
        VALUES (?, ?, ?, ?)`,
        [
          id,
          'cancelled',
          notes || 'Order cancelled',
          userId
        ]
      );

      // Restore product stock
      for (const item of itemRows) {
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      // Return cancelled order data
      return this.findById(id);
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
}

module.exports = Order;