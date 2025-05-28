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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Dashboard
        </Typography>
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 2,
          p: 0.5
        }}>
          <Button
            variant={timeRange === 'all' ? 'contained' : 'text'}
            onClick={() => setTimeRange('all')}
            sx={{
              borderRadius: 1.5,
              px: 2,
              py: 0.75,
              minWidth: 'auto',
              fontWeight: 500,
              boxShadow: timeRange === 'all' ? 2 : 'none',
              '&.MuiButton-text': {
                color: 'text.secondary',
              }
            }}
            disableElevation={timeRange !== 'all'}
          >
            All Time
          </Button>
          <Button
            variant={timeRange === 'week' ? 'contained' : 'text'}
            onClick={() => setTimeRange('week')}
            sx={{
              borderRadius: 1.5,
              px: 2,
              py: 0.75,
              minWidth: 'auto',
              fontWeight: 500,
              boxShadow: timeRange === 'week' ? 2 : 'none',
              '&.MuiButton-text': {
                color: 'text.secondary',
              }
            }}
            disableElevation={timeRange !== 'week'}
          >
            Last Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'contained' : 'text'}
            onClick={() => setTimeRange('month')}
            sx={{
              borderRadius: 1.5,
              px: 2,
              py: 0.75,
              minWidth: 'auto',
              fontWeight: 500,
              boxShadow: timeRange === 'month' ? 2 : 'none',
              '&.MuiButton-text': {
                color: 'text.secondary',
              }
            }}
            disableElevation={timeRange !== 'month'}
          >
            Last Month
          </Button>
          <Button
            variant={timeRange === 'year' ? 'contained' : 'text'}
            onClick={() => setTimeRange('year')}
            sx={{
              borderRadius: 1.5,
              px: 2,
              py: 0.75,
              minWidth: 'auto',
              fontWeight: 500,
              boxShadow: timeRange === 'year' ? 2 : 'none',
              '&.MuiButton-text': {
                color: 'text.secondary',
              }
            }}
            disableElevation={timeRange !== 'year'}
          >
            Last Year
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 220px' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(58, 123, 213, 0.08) 0%, rgba(58, 123, 213, 0.03) 100%)',
              border: '1px solid',
              borderColor: 'rgba(58, 123, 213, 0.1)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              Total Orders
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
              {statistics.totalOrders}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All time orders
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 220px' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.08) 0%, rgba(0, 188, 212, 0.03) 100%)',
              border: '1px solid',
              borderColor: 'rgba(0, 188, 212, 0.1)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              Total Revenue
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 600, color: 'secondary.main', mb: 1 }}>
              {formatCurrency(statistics.totalRevenue || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All time revenue
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 220px' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.08) 0%, rgba(72, 187, 120, 0.03) 100%)',
              border: '1px solid',
              borderColor: 'rgba(72, 187, 120, 0.1)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              Avg. Order Value
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
              {statistics.totalOrders
                ? formatCurrency(statistics.totalRevenue / statistics.totalOrders)
                : formatCurrency(0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Revenue per order
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 220px' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(237, 137, 54, 0.08) 0%, rgba(237, 137, 54, 0.03) 100%)',
              border: '1px solid',
              borderColor: 'rgba(237, 137, 54, 0.1)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              Pending Orders
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 600, color: 'warning.main', mb: 1 }}>
              {statistics.ordersByStatus.find(s => s.status === 'pending')?.count || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Awaiting processing
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
              <CardHeader
                title="Orders by Status"
                titleTypographyProps={{
                  variant: 'h6',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              />
              <Divider />
              <CardContent sx={{ height: 300, pt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statistics.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      paddingAngle={2}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statistics.ordersByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, 'Orders']}
                      contentStyle={{
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: 'none'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span style={{ color: '#718096', fontSize: '0.875rem' }}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          {/* Revenue by Payment Method */}
          <Box sx={{ flex: '1 1 400px' }}>
            <Card>
              <CardHeader
                title="Revenue by Payment Method"
                titleTypographyProps={{
                  variant: 'h6',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              />
              <Divider />
              <CardContent sx={{ height: 300, pt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statistics.ordersByPaymentMethod}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="payment_method"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#718096', fontSize: 12 }}
                      tickFormatter={(value) => value.replace('_', ' ')}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#718096', fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value).split('.')[0]}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                      contentStyle={{
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: 'none'
                      }}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span style={{ color: '#718096', fontSize: '0.875rem' }}>
                          {value}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#3a7bd5"
                      radius={[4, 4, 0, 0]}
                      name="Revenue"
                    />
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
              titleTypographyProps={{
                variant: 'h6',
                fontWeight: 600,
                color: 'text.primary'
              }}
              action={
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/products')}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  View All Products
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ height: 400, pt: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statistics.topProducts.slice(0, 5)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  barSize={20}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#718096', fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#3a7bd5"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#718096', fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#00bcd4"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#718096', fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value).split('.')[0]}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'Revenue') {
                        return [formatCurrency(value as number), 'Revenue'];
                      }
                      return [value, 'Quantity'];
                    }}
                    contentStyle={{
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: 'none'
                    }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                      <span style={{ color: '#718096', fontSize: '0.875rem' }}>
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="total_quantity"
                    fill="#3a7bd5"
                    name="Quantity"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="total_revenue"
                    fill="#00bcd4"
                    name="Revenue"
                    radius={[4, 4, 0, 0]}
                  />
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