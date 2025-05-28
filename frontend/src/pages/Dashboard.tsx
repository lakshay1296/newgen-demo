import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { orderAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Define types for statistics
interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Array<{
    status: string;
    count: number;
    revenue: number;
  }>;
  ordersByPaymentMethod: Array<{
    payment_method: string;
    count: number;
    revenue: number;
  }>;
  topProducts: Array<{
    product_id: number;
    name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const STATUS_COLORS: Record<string, string> = {
  pending: '#FFBB28',
  processing: '#0088FE',
  shipped: '#00C49F',
  delivered: '#8884D8',
  cancelled: '#FF8042'
};

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'week', 'month', 'year'
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Prepare date range parameters
      let params = {};
      const now = new Date();
      
      if (timeRange === 'week') {
        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 7);
        params = { start_date: lastWeek.toISOString().split('T')[0] };
      } else if (timeRange === 'month') {
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        params = { start_date: lastMonth.toISOString().split('T')[0] };
      } else if (timeRange === 'year') {
        const lastYear = new Date(now);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        params = { start_date: lastYear.toISOString().split('T')[0] };
      }
      
      const response = await orderAPI.getStatistics(params);
      setStatistics(response.data.data);
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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

  if (!statistics) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No data available
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Box>
          <Button 
            variant={timeRange === 'all' ? 'contained' : 'outlined'} 
            onClick={() => setTimeRange('all')}
            sx={{ mr: 1 }}
          >
            All Time
          </Button>
          <Button 
            variant={timeRange === 'week' ? 'contained' : 'outlined'} 
            onClick={() => setTimeRange('week')}
            sx={{ mr: 1 }}
          >
            Last Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'contained' : 'outlined'} 
            onClick={() => setTimeRange('month')}
            sx={{ mr: 1 }}
          >
            Last Month
          </Button>
          <Button 
            variant={timeRange === 'year' ? 'contained' : 'outlined'} 
            onClick={() => setTimeRange('year')}
          >
            Last Year
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h3">
              {statistics.totalOrders}
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h3">
              {formatCurrency(statistics.totalRevenue || 0)}
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Avg. Order Value
            </Typography>
            <Typography variant="h3">
              {statistics.totalOrders 
                ? formatCurrency(statistics.totalRevenue / statistics.totalOrders) 
                : formatCurrency(0)}
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Pending Orders
            </Typography>
            <Typography variant="h3">
              {statistics.ordersByStatus.find(s => s.status === 'pending')?.count || 0}
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Charts Row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Orders by Status */}
          <Box sx={{ flex: '1 1 400px' }}>
            <Card>
              <CardHeader title="Orders by Status" />
              <Divider />
              <CardContent sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statistics.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statistics.ordersByStatus.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Orders']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          {/* Revenue by Payment Method */}
          <Box sx={{ flex: '1 1 400px' }}>
            <Card>
              <CardHeader title="Revenue by Payment Method" />
              <Divider />
              <CardContent sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statistics.ordersByPaymentMethod}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="payment_method" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Top Products */}
        <Box>
          <Card>
            <CardHeader 
              title="Top Products" 
              action={
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/products')}
                >
                  View All Products
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statistics.topProducts.slice(0, 5)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'total_revenue') {
                        return [formatCurrency(value as number), 'Revenue'];
                      }
                      return [value, 'Quantity'];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="total_quantity" fill="#8884d8" name="Quantity" />
                  <Bar yAxisId="right" dataKey="total_revenue" fill="#82ca9d" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;