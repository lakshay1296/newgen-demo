import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import OrderCreate from './pages/orders/OrderCreate';
import CustomerList from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import CustomerCreate from './pages/customers/CustomerCreate';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import ProductCreate from './pages/products/ProductCreate';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';


// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Staff/Admin route component
const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// Admin route component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" /> : <Register />
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Order routes */}
        <Route path="/orders" element={
          <ProtectedRoute>
            <Layout>
              <OrderList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <Layout>
              <OrderDetail />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/orders/create" element={
          <ProtectedRoute>
            <Layout>
              <OrderCreate />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Customer routes */}
        <Route path="/customers" element={
          <ProtectedRoute>
            <Layout>
              <CustomerList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/customers/:id" element={
          <ProtectedRoute>
            <Layout>
              <CustomerDetail />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/customers/create" element={
          <StaffRoute>
            <Layout>
              <CustomerCreate />
            </Layout>
          </StaffRoute>
        } />

        {/* Product routes */}
        <Route path="/products" element={
          <ProtectedRoute>
            <Layout>
              <ProductList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/products/:id" element={
          <ProtectedRoute>
            <Layout>
              <ProductDetail />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/products/create" element={
          <StaffRoute>
            <Layout>
              <ProductCreate />
            </Layout>
          </StaffRoute>
        } />

        {/* User routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <AdminRoute>
            <Layout>
              <Settings />
            </Layout>
          </AdminRoute>
        } />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};
const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
