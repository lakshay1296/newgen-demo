import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  CircularProgress, 
  Alert,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';

const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    stock_quantity: '',
    category: '',
    image_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        sku: formData.sku,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
        category: formData.category,
        image_url: formData.image_url
      };
      
      const response = await productAPI.create(productData);
      const newProductId = response.data.data.product.product_id;
      
      // Navigate to the new product
      navigate(`/products/${newProductId}`);
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Create New Product
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/products')}
        >
          Cancel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Product Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <TextField
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ mb: 3 }}
          />
          
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              fullWidth
              required
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
              }}
            />
            
            <TextField
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              fullWidth
              placeholder="Unique product identifier"
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Initial Stock Quantity"
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              fullWidth
              placeholder="0"
            />
            
            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              fullWidth
              placeholder="e.g. Electronics, Clothing, etc."
            />
          </Box>
          
          <TextField
            label="Image URL"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            fullWidth
            placeholder="https://example.com/image.jpg"
            sx={{ mb: 4 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Product'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductCreate;