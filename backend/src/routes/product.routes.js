const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, isStaffOrAdmin } = require('../middleware/auth.middleware');
const { validateProductCreation } = require('../middleware/validation.middleware');

// Get all products
router.get('/', productController.getAllProducts);

// Get product categories
router.get('/categories', productController.getCategories);

// Get product by ID
router.get('/:id', productController.getProductById);

// Create a new product (staff/admin only)
router.post('/', authenticate, isStaffOrAdmin, validateProductCreation, productController.createProduct);

// Update product (staff/admin only)
router.put('/:id', authenticate, isStaffOrAdmin, productController.updateProduct);

// Delete product (staff/admin only)
router.delete('/:id', authenticate, isStaffOrAdmin, productController.deleteProduct);

// Update product stock (staff/admin only)
router.patch('/:id/stock', authenticate, isStaffOrAdmin, productController.updateStock);

module.exports = router;