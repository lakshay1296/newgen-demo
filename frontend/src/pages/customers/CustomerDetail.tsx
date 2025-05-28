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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { customerAPI, orderAPI } from '../../services/api';
import { format } from 'date-fns';

// Define types
interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  order_id: number;
  order_date: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = new URLSearchParams(location.search).get('edit') === 'true';
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  });

  useEffect(() => {
    if (id) {
      fetchCustomerDetails(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postal_code: customer.postal_code || '',
        country: customer.country || ''
      });
    }
  }, [customer]);

  useEffect(() => {
    if (id && tabValue === 1) {
      fetchCustomerOrders(parseInt(id));
    }
  }, [id, tabValue]);

  const fetchCustomerDetails = async (customerId: number) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await customerAPI.getById(customerId);
      setCustomer(response.data.data.customer);
    } catch (err: any) {
      console.error('Error fetching customer details:', err);
      setError(err.response?.data?.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId: number) => {
    try {
      setOrderLoading(true);
      
      const response = await orderAPI.getCustomerOrders(customerId);
      setOrders(response.data.data.orders);
    } catch (err: any) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateCustomer = async () => {
    if (!id) return;
    
    try {
      setUpdateLoading(true);
      setError('');
      
      await customerAPI.update(parseInt(id), formData);
      
      // Refresh customer details
      fetchCustomerDetails(parseInt(id));
      
      // Exit edit mode
      navigate(`/customers/${id}`);
    } catch (err: any) {
      console.error('Error updating customer:', err);
      setError(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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

  if (!customer) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Customer not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Customer' : `${customer.first_name} ${customer.last_name}`}
        </Typography>
        <Box>
          {isEditMode ? (
            <>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/customers/${id}`)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleUpdateCustomer}
                disabled={updateLoading}
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/customers')}
                sx={{ mr: 1 }}
              >
                Back to Customers
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate(`/customers/${id}?edit=true`)}
              >
                Edit Customer
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer tabs">
            <Tab label="Customer Details" id="customer-tab-0" aria-controls="customer-tabpanel-0" />
            <Tab label="Orders" id="customer-tab-1" aria-controls="customer-tabpanel-1" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {isEditMode ? (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    margin="normal"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    margin="normal"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    margin="normal"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Box>
                <Box sx={{ flex: '1 1 100%' }}>
                  <TextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    label="State/Province"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    label="Postal Code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {customer.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {customer.phone || 'Not provided'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="h6" gutterBottom>
                    Address
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body1">
                    {customer.address || 'No address provided'}
                  </Typography>
                  {customer.city && (
                    <Typography variant="body1">
                      {`${customer.city}${customer.state ? `, ${customer.state}` : ''} ${customer.postal_code || ''}`}
                    </Typography>
                  )}
                  {customer.country && (
                    <Typography variant="body1">
                      {customer.country}
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Customer ID
                      </Typography>
                      <Typography variant="body1">
                        {customer.customer_id}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Created On
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(customer.created_at), 'PPP')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(customer.updated_at), 'PPP')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            {orderLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Order History
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/orders/create', { state: { customerId: customer.customer_id } })}
                  >
                    Create New Order
                  </Button>
                </Box>
                
                {orders.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Payment</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.order_id}>
                            <TableCell>#{order.order_id}</TableCell>
                            <TableCell>
                              {format(new Date(order.order_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                                color={getStatusColor(order.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {order.payment_method.replace('_', ' ')}
                              <Typography variant="body2" color="textSecondary">
                                {order.payment_status}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => navigate(`/orders/${order.order_id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    This customer has no orders yet.
                  </Alert>
                )}
              </>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default CustomerDetail;