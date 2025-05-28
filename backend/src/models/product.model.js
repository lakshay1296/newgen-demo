const { pool } = require('../config/db');

class Product {
  // Create a new product
  static async create(productData) {
    try {
      // Insert product into database
      const [result] = await pool.execute(
        `INSERT INTO products 
        (name, description, price, sku, stock_quantity, category, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productData.name,
          productData.description || null,
          productData.price,
          productData.sku || null,
          productData.stock_quantity || 0,
          productData.category || null,
          productData.image_url || null
        ]
      );

      // Check if product was created
      if (result.affectedRows === 0) {
        return null;
      }

      // Return product data
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Find all products with pagination
  static async findAll({ page = 1, limit = 10, category = '', search = '' }) {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;

      // Build query
      let query = 'SELECT * FROM products';
      const params = [];

      // Add conditions if provided
      const conditions = [];

      if (category) {
        conditions.push('category = ?');
        params.push(category);
      }

      if (search) {
        conditions.push('(name LIKE ? OR description LIKE ? OR sku LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Add WHERE clause if conditions exist
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      // Add pagination with direct values instead of parameters
      const numericLimit = parseInt(limit, 10);
      const numericOffset = parseInt(offset, 10);
      
      query += ` ORDER BY product_id DESC LIMIT ${numericLimit} OFFSET ${numericOffset}`;
      
      // Execute query without limit and offset as parameters
      const [rows] = await pool.execute(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM products';
      const countParams = [];

      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
        countParams.push(...params.slice(0, -2)); // Exclude limit and offset
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      // Return products with pagination info
      return {
        products: rows,
        pagination: {
          total,
          limit,
          offset,
          page,
          hasMore: offset + rows.length < total
        }
      };
    } catch (error) {
      console.error('Error finding products:', error);
      throw error;
    }
  }

  // Get product categories
  static async getCategories() {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
      );

      return rows.map(row => row.category);
    } catch (error) {
      console.error('Error getting product categories:', error);
      throw error;
    }
  }

  // Find product by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE product_id = ?',
        [id]
      );

      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding product by ID:', error);
      throw error;
    }
  }

  // Find product by SKU
  static async findBySku(sku) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE sku = ?',
        [sku]
      );

      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding product by SKU:', error);
      throw error;
    }
  }

  // Update product
  static async update(id, productData) {
    try {
      // Build query
      const fields = [];
      const values = [];

      // Add fields to update
      if (productData.name !== undefined) {
        fields.push('name = ?');
        values.push(productData.name);
      }

      if (productData.description !== undefined) {
        fields.push('description = ?');
        values.push(productData.description);
      }

      if (productData.price !== undefined) {
        fields.push('price = ?');
        values.push(productData.price);
      }

      if (productData.sku !== undefined) {
        fields.push('sku = ?');
        values.push(productData.sku);
      }

      if (productData.stock_quantity !== undefined) {
        fields.push('stock_quantity = ?');
        values.push(productData.stock_quantity);
      }

      if (productData.category !== undefined) {
        fields.push('category = ?');
        values.push(productData.category);
      }

      if (productData.image_url !== undefined) {
        fields.push('image_url = ?');
        values.push(productData.image_url);
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
        `UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`,
        values
      );

      // Check if product was updated
      if (result.affectedRows === 0) {
        return null;
      }

      // Return updated product data
      return this.findById(id);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Update product stock
  static async updateStock(id, quantity) {
    try {
      // Get current product
      const product = await this.findById(id);
      if (!product) {
        return null;
      }

      // Calculate new stock quantity
      const newQuantity = product.stock_quantity + quantity;
      
      // Ensure stock doesn't go below 0
      const finalQuantity = Math.max(0, newQuantity);

      // Update stock
      const [result] = await pool.execute(
        'UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?',
        [finalQuantity, id]
      );

      // Check if product was updated
      if (result.affectedRows === 0) {
        return null;
      }

      // Return updated product data
      return this.findById(id);
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  // Delete product
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM products WHERE product_id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}

module.exports = Product;