import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid as MuiGrid, 
  Divider, 
  Chip, 
  Button, 
  CircularProgress, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { format } from 'date-fns';

// Define types
interface OrderItem {
  order_item_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  sku?: string;
}

interface OrderHistory {
  history_id: number;
  status: string;
  notes: string;
  created_by: number;
  created_by_username: string;
  created_at: string;
}

interface Order {
  order_id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  order_date: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_status: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  tracking_number: string;
  notes: string;
  items: OrderItem[];
  history: OrderHistory[];
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = new URLSearchParams(location.search).get('edit') === 'true';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelNotes, setCancelNotes] = useState('');
  
  const [updateData, setUpdateData] = useState({
    status: '',
    payment_status: '',
    tracking_number: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchOrderDetails(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (order && isEditMode) {
      setUpdateData({
        status: order.status,
        payment_status: order.payment_status,
        tracking_number: order.tracking_number || '',
        notes: order.notes || ''
      });
    }
  }, [order, isEditMode]);

  const fetchOrderDetails = async (orderId: number) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await orderAPI.getById(orderId);
      setOrder(response.data.data.order);
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!order || !id) return;
    
    try {
      setUpdateLoading(true);
      setError('');
      
      await orderAPI.update(parseInt(id), updateData);
      
      // Refresh order details
      fetchOrderDetails(parseInt(id));
      
      // Exit edit mode
      navigate(`/orders/${id}`);
    } catch (err: any) {
      console.error('Error updating order:', err);
      setError(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !id) return;
    
    try {
      setUpdateLoading(true);
      setError('');
      
      await orderAPI.cancel(parseInt(id), cancelNotes);
      
      // Refresh order details
      fetchOrderDetails(parseInt(id));
      
      // Close dialog
      setCancelDialogOpen(false);
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
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

  if (!order) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Order not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Order #{order.order_id}
        </Typography>
        <Box>
          {isEditMode ? (
            <>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/orders/${id}`)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleUpdateOrder}
                disabled={updateLoading}
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/orders')}
                sx={{ mr: 1 }}
              >
                Back to Orders
              </Button>
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Cancel Order
                </Button>
              )}
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate(`/orders/${id}?edit=true`)}
              >
                Edit Order
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Order Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Order Date
            </Typography>
            <Typography variant="body1">
              {format(new Date(order.order_date), 'PPP p')}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Status
            </Typography>
            {isEditMode ? (
              <FormControl sx={{ minWidth: 150 }} size="small">
                <Select
                  name="status"
                  value={updateData.status}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Chip 
                label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                color={getStatusColor(order.status) as any}
              />
            )}
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Payment Method
            </Typography>
            <Typography variant="body1">
              {order.payment_method.replace('_', ' ')}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Payment Status
            </Typography>
            {isEditMode ? (
              <FormControl sx={{ minWidth: 150 }} size="small">
                <Select
                  name="payment_status"
                  value={updateData.payment_status}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body1">
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Total Amount
            </Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(order.total_amount)}
            </Typography>
          </Box>
        </Box>

        {isEditMode && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Tracking Number
            </Typography>
            <TextField
              name="tracking_number"
              value={updateData.tracking_number}
              onChange={handleInputChange}
              placeholder="Enter tracking number"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Notes
            </Typography>
            <TextField
              name="notes"
              value={updateData.notes}
              onChange={handleInputChange}
              placeholder="Add notes about this order"
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        )}
      </Paper>

      {/* Customer Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Customer Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Customer
            </Typography>
            <Typography variant="body1">
              {`${order.first_name} ${order.last_name}`}
            </Typography>
            <Typography variant="body2">
              {order.email}
            </Typography>
            {order.phone && (
              <Typography variant="body2">
                {order.phone}
              </Typography>
            )}
            <Button 
              variant="text" 
              size="small" 
              onClick={() => navigate(`/customers/${order.customer_id}`)}
              sx={{ mt: 1, p: 0 }}
            >
              View Customer
            </Button>
          </Box>
          
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Shipping Address
            </Typography>
            <Typography variant="body1">
              {order.shipping_address}
            </Typography>
            <Typography variant="body2">
              {`${order.shipping_city}, ${order.shipping_state || ''} ${order.shipping_postal_code}`}
            </Typography>
            <Typography variant="body2">
              {order.shipping_country}
            </Typography>
          </Box>
          
          {order.tracking_number && !isEditMode && (
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Tracking Number
              </Typography>
              <Typography variant="body1">
                {order.tracking_number}
              </Typography>
            </Box>
          )}
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
                <TableCell>SKU</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.order_item_id}>
                  <TableCell>
                    <Typography variant="body1">
                      {item.product_name}
                    </Typography>
                    <Button 
                      variant="text" 
                      size="small" 
                      onClick={() => navigate(`/products/${item.product_id}`)}
                      sx={{ p: 0 }}
                    >
                      View Product
                    </Button>
                  </TableCell>
                  <TableCell>{item.sku || 'N/A'}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} align="right">
                  <Typography variant="subtitle1">Total:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatCurrency(order.total_amount)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Order History */}
      {order.history && order.history.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order History
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Updated By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.history.map((entry) => (
                  <TableRow key={entry.history_id}>
                    <TableCell>
                      {format(new Date(entry.created_at), 'PPP p')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.status.charAt(0).toUpperCase() + entry.status.slice(1)} 
                        color={getStatusColor(entry.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{entry.notes || 'No notes'}</TableCell>
                    <TableCell>{entry.created_by_username || 'System'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Cancel Order Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this order? This action cannot be undone.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for cancellation"
            fullWidth
            multiline
            rows={3}
            value={cancelNotes}
            onChange={(e) => setCancelNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            No, Keep Order
          </Button>
          <Button 
            onClick={handleCancelOrder} 
            color="error"
            disabled={updateLoading}
          >
            {updateLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetail;