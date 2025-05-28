import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  TextField, 
  CircularProgress, 
  Alert,
  Chip
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { format } from 'date-fns';

// Define types
interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock_quantity: number;
  category: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = new URLSearchParams(location.search).get('edit') === 'true';
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [stockUpdateLoading, setStockUpdateLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    stock_quantity: '',
    category: '',
    image_url: ''
  });

  const [stockAdjustment, setStockAdjustment] = useState('');

  useEffect(() => {
    if (id) {
      fetchProductDetails(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        sku: product.sku || '',
        stock_quantity: product.stock_quantity.toString(),
        category: product.category || '',
        image_url: product.image_url || ''
      });
    }
  }, [product]);

  const fetchProductDetails = async (productId: number) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await productAPI.getById(productId);
      setProduct(response.data.data.product);
    } catch (err: any) {
      console.error('Error fetching product details:', err);
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProduct = async () => {
    if (!id) return;
    
    try {
      setUpdateLoading(true);
      setError('');
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        sku: formData.sku,
        stock_quantity: parseInt(formData.stock_quantity),
        category: formData.category,
        image_url: formData.image_url
      };
      
      await productAPI.update(parseInt(id), productData);
      
      // Refresh product details
      fetchProductDetails(parseInt(id));
      
      // Exit edit mode
      navigate(`/products/${id}`);
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!id || !stockAdjustment) return;
    
    try {
      setStockUpdateLoading(true);
      setError('');
      
      await productAPI.updateStock(parseInt(id), parseInt(stockAdjustment));
      
      // Refresh product details
      fetchProductDetails(parseInt(id));
      
      // Clear stock adjustment
      setStockAdjustment('');
    } catch (err: any) {
      console.error('Error updating stock:', err);
      setError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setStockUpdateLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStockStatusColor = (quantity: number) => {
    if (quantity <= 0) {
      return 'error';
    } else if (quantity < 10) {
      return 'warning';
    } else {
      return 'success';
    }
  };

  const getStockStatusText = (quantity: number) => {
    if (quantity <= 0) {
      return 'Out of Stock';
    } else if (quantity < 10) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!product) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Product not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Product' : product.name}
        </Typography>
        <Box>
          {isEditMode ? (
            <>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/products/${id}`)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleUpdateProduct}
                disabled={updateLoading}
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/products')}
                sx={{ mr: 1 }}
              >
                Back to Products
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate(`/products/${id}?edit=true`)}
              >
                Edit Product
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        {isEditMode ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Product Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
              
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
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
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Stock Quantity"
                  name="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
                
                <TextField
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Box>
              
              <TextField
                label="Image URL"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                fullWidth
                placeholder="https://example.com/image.jpg"
              />
            </Box>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Product Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {product.category && (
                  <Chip 
                    label={product.category} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ mb: 2 }}
                  />
                )}
                
                {product.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1">
                      {product.description}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Price
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(product.price)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      SKU
                    </Typography>
                    <Typography variant="body1">
                      {product.sku || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Stock Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={`${product.stock_quantity} units`} 
                        color={getStockStatusColor(product.stock_quantity) as any}
                        size="small"
                      />
                      <Typography variant="body2">
                        {getStockStatusText(product.stock_quantity)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    Product ID
                  </Typography>
                  <Typography variant="body1">
                    {product.product_id}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Created On
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(product.created_at), 'PPP')}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(product.updated_at), 'PPP')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {product.image_url && (
                <Box sx={{ ml: 2, maxWidth: 200 }}>
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      borderRadius: 8,
                      border: '1px solid #eee'
                    }} 
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {!isEditMode && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Inventory Management
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            <TextField
              label="Adjust Stock"
              type="number"
              value={stockAdjustment}
              onChange={(e) => setStockAdjustment(e.target.value)}
              helperText="Use positive values to add stock, negative to remove"
              sx={{ width: 200 }}
            />
            
            <Button 
              variant="contained" 
              onClick={handleUpdateStock}
              disabled={!stockAdjustment || stockUpdateLoading}
            >
              {stockUpdateLoading ? 'Updating...' : 'Update Stock'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ProductDetail;