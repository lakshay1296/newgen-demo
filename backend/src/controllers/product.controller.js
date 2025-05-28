const Product = require('../models/product.model');
const { validationResult } = require('express-validator');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || '';
    const search = req.query.search || '';

    // Get products
    const result = await Product.findAll({ page, limit, category, search });

    // Return products
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting products',
      error: error.message,
      data: {
        products: [],
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

// Get product categories
exports.getCategories = async (req, res) => {
  try {
    // Get categories
    const categories = await Product.getCategories();

    // Return categories
    res.status(200).json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error getting product categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting product categories',
      error: error.message
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get product
    const product = await Product.findById(parseInt(id));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Return product
    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting product',
      error: error.message
    });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if SKU is already used
    if (req.body.sku) {
      const existingProduct = await Product.findBySku(req.body.sku);
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'SKU is already in use'
        });
      }
    }

    // Create product
    const product = await Product.create(req.body);
    if (!product) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create product'
      });
    }

    // Return product data
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(parseInt(id));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if SKU is already used
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findBySku(req.body.sku);
      if (existingProduct && existingProduct.product_id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'SKU is already in use'
        });
      }
    }

    // Update product
    const updatedProduct = await Product.update(parseInt(id), req.body);
    if (!updatedProduct) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update product'
      });
    }

    // Return updated product data
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(parseInt(id));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product
    const deleted = await Product.delete(parseInt(id));
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete product'
      });
    }

    // Return success message
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Update product stock
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    if (quantity === undefined || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required and must be a number'
      });
    }

    // Check if product exists
    const product = await Product.findById(parseInt(id));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update stock
    const updatedProduct = await Product.updateStock(parseInt(id), parseInt(quantity));
    if (!updatedProduct) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update stock'
      });
    }

    // Return updated product data
    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: error.message
    });
  }
};