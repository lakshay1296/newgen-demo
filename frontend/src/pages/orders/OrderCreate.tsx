import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  CircularProgress, 
  Alert,
  Divider,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { orderAPI, customerAPI, productAPI } from '../../services/api';

// Define types
interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface Product {
  product_id: number;
  name: string;
  price: number;
  sku?: string;
  stock_quantity: number;
}

interface OrderItem {
  product_id: number;
  product: Product | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const OrderCreate: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');
  const [notes, setNotes] = useState('');
  
  // Data loading state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Load customers and products on component mount
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);
  
  // Update shipping address when customer changes
  useEffect(() => {
    if (customer) {
      setShippingAddress(customer.address || '');
      setShippingCity(customer.city || '');
      setShippingState(customer.state || '');
      setShippingPostalCode(customer.postal_code || '');
      setShippingCountry(customer.country || '');
    }
  }, [customer]);
  
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await customerAPI.getAll({ limit: 100 });
      setCustomers(response.data.data.customers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productAPI.getAll({ limit: 100 });
      setProducts(response.data.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };
  
  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      {
        product_id: 0,
        product: null,
        quantity: 1,
        unit_price: 0,
        subtotal: 0
      }
    ]);
  };
  
  const handleRemoveItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };
  
  const handleProductChange = (index: number, product: Product | null) => {
    const newItems = [...orderItems];
    if (product) {
      newItems[index] = {
        ...newItems[index],
        product_id: product.product_id,
        product,
        unit_price: product.price,
        subtotal: product.price * newItems[index].quantity
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        product_id: 0,
        product: null,
        unit_price: 0,
        subtotal: 0
      };
    }
    setOrderItems(newItems);
  };
  
  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      quantity,
      subtotal: newItems[index].unit_price * quantity
    };
    setOrderItems(newItems);
  };
  
  const handlePaymentMethodChange = (event: SelectChangeEvent) => {
    setPaymentMethod(event.target.value);
  };
  
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.subtotal, 0);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const validateForm = () => {
    if (!customer) {
      setError('Please select a customer');
      return false;
    }
    
    if (orderItems.length === 0) {
      setError('Please add at least one item to the order');
      return false;
    }
    
    if (orderItems.some(item => !item.product)) {
      setError('Please select a product for all order items');
      return false;
    }
    
    if (orderItems.some(item => item.quantity <= 0)) {
      setError('Quantity must be greater than 0 for all items');
      return false;
    }
    
    if (!paymentMethod) {
      setError('Please select a payment method');
      return false;
    }
    
    if (!shippingAddress || !shippingCity || !shippingPostalCode || !shippingCountry) {
      setError('Please provide complete shipping information');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const orderData = {
        customer_id: customer!.customer_id,
        payment_method: paymentMethod,
        payment_status: 'pending',
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_postal_code: shippingPostalCode,
        shipping_country: shippingCountry,
        notes,
        order_items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };
      
      const response = await orderAPI.create(orderData);
      const newOrderId = response.data.data.order.order_id;
      
      // Navigate to the new order
      navigate(`/orders/${newOrderId}`);
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Create New Order
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/orders')}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained" 
            color="primary"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Order'}
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Customer Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Customer Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Autocomplete
          options={customers}
          loading={loadingCustomers}
          getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Customer"
              required
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingCustomers ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          value={customer}
          onChange={(_, newValue) => setCustomer(newValue)}
          sx={{ mb: 3 }}
        />
        
        <Typography variant="subtitle1" gutterBottom>
          Shipping Address
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Address"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
            fullWidth
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="City"
              value={shippingCity}
              onChange={(e) => setShippingCity(e.target.value)}
              required
              fullWidth
            />
            
            <TextField
              label="State/Province"
              value={shippingState}
              onChange={(e) => setShippingState(e.target.value)}
              fullWidth
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Postal Code"
              value={shippingPostalCode}
              onChange={(e) => setShippingPostalCode(e.target.value)}
              required
              fullWidth
            />
            
            <TextField
              label="Country"
              value={shippingCountry}
              onChange={(e) => setShippingCountry(e.target.value)}
              required
              fullWidth
            />
          </Box>
        </Box>
      </Paper>
      
      {/* Order Items */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ minWidth: 300 }}>
                    <Autocomplete
                      options={products}
                      loading={loadingProducts}
                      getOptionLabel={(option) => `${option.name} (${option.sku || 'No SKU'})`}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Product"
                          required
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      value={item.product}
                      onChange={(_, newValue) => handleProductChange(index, newValue)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.unit_price)}
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                      inputProps={{ min: 1 }}
                      size="small"
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveItem(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              
              {orderItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No items added to this order
                  </TableCell>
                </TableRow>
              )}
              
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <Typography variant="subtitle1">Total:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatCurrency(calculateTotal())}
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{ mt: 2 }}
        >
          Add Item
        </Button>
      </Paper>
      
      {/* Payment and Notes */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment and Notes
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="payment-method-label">Payment Method *</InputLabel>
          <Select
            labelId="payment-method-label"
            value={paymentMethod}
            label="Payment Method *"
            onChange={handlePaymentMethodChange}
            required
          >
            <MenuItem value="credit_card">Credit Card</MenuItem>
            <MenuItem value="debit_card">Debit Card</MenuItem>
            <MenuItem value="paypal">PayPal</MenuItem>
            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            <MenuItem value="cash_on_delivery">Cash on Delivery</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          label="Order Notes"
          multiline
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
          placeholder="Add any special instructions or notes about this order"
        />
      </Paper>
    </Box>
  );
};

export default OrderCreate;