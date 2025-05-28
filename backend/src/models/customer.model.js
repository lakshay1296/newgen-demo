const { pool } = require('../config/db');

class Customer {
  // Create a new customer
  static async create(customerData) {
    try {
      // Insert customer into database
      const [result] = await pool.execute(
        `INSERT INTO customers 
        (first_name, last_name, email, phone, address, city, state, postal_code, country) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerData.first_name,
          customerData.last_name,
          customerData.email,
          customerData.phone || null,
          customerData.address || null,
          customerData.city || null,
          customerData.state || null,
          customerData.postal_code || null,
          customerData.country || null
        ]
      );

      // Check if customer was created
      if (result.affectedRows === 0) {
        return null;
      }

      // Return customer data
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Find all customers with pagination
  static async findAll({ page = 1, limit = 10, search = '' }) {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Build query
      let query = 'SELECT * FROM customers';
      const params = [];

      // Add search condition if provided
      if (search) {
        query += ` WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Add pagination with direct values instead of parameters
      const numericLimit = parseInt(limit, 10);
      const numericOffset = parseInt(offset, 10);
      
      query += ` ORDER BY customer_id DESC LIMIT ${numericLimit} OFFSET ${numericOffset}`;
      
      // Execute query without limit and offset as parameters
      const [rows] = await pool.execute(query, params);

      // Get total count
      const [countResult] = await pool.execute(
        `SELECT COUNT(*) as total FROM customers${search ? ` WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?` : ''}`,
        search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []
      );

      const total = countResult[0].total;

      // Return customers with pagination info
      return {
        customers: rows,
        pagination: {
          total,
          limit,
          offset,
          page,
          hasMore: offset + rows.length < total
        }
      };
    } catch (error) {
      console.error('Error finding customers:', error);
      throw error;
    }
  }

  // Find customer by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM customers WHERE customer_id = ?',
        [id]
      );

      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding customer by ID:', error);
      throw error;
    }
  }

  // Find customer by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM customers WHERE email = ?',
        [email]
      );

      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding customer by email:', error);
      throw error;
    }
  }

  // Update customer
  static async update(id, customerData) {
    try {
      // Build query
      const fields = [];
      const values = [];

      // Add fields to update
      if (customerData.first_name !== undefined) {
        fields.push('first_name = ?');
        values.push(customerData.first_name);
      }

      if (customerData.last_name !== undefined) {
        fields.push('last_name = ?');
        values.push(customerData.last_name);
      }

      if (customerData.email !== undefined) {
        fields.push('email = ?');
        values.push(customerData.email);
      }

      if (customerData.phone !== undefined) {
        fields.push('phone = ?');
        values.push(customerData.phone);
      }

      if (customerData.address !== undefined) {
        fields.push('address = ?');
        values.push(customerData.address);
      }

      if (customerData.city !== undefined) {
        fields.push('city = ?');
        values.push(customerData.city);
      }

      if (customerData.state !== undefined) {
        fields.push('state = ?');
        values.push(customerData.state);
      }

      if (customerData.postal_code !== undefined) {
        fields.push('postal_code = ?');
        values.push(customerData.postal_code);
      }

      if (customerData.country !== undefined) {
        fields.push('country = ?');
        values.push(customerData.country);
      }

      // If no fields to update
      if (fields.length === 0) {
        return this.findById(id);
      }

      // Add updated_at field
      fields.push('updated_at = CURRENT_TIMESTAMP');

      // Add ID to values
      values.push(id);

      // Execute query
      const [result] = await pool.execute(
        `UPDATE customers SET ${fields.join(', ')} WHERE customer_id = ?`,
        values
      );

      // Check if customer was updated
      if (result.affectedRows === 0) {
        return null;
      }

      // Return updated customer data
      return this.findById(id);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Delete customer
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM customers WHERE customer_id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }
}

module.exports = Customer;