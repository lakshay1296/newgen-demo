import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Divider,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  TextField,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { settingsAPI } from '../services/api';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    autoRefresh: true,
    refreshInterval: 5,
    defaultPageSize: 10
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { darkMode, setDarkMode } = useTheme();

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await settingsAPI.getSettings();
        const apiSettings = response.data.data.settings;
        
        setSettings({
          emailNotifications: apiSettings.email_notifications,
          darkMode: apiSettings.dark_mode,
          autoRefresh: apiSettings.auto_refresh,
          refreshInterval: apiSettings.refresh_interval,
          defaultPageSize: apiSettings.default_page_size
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Update dark mode in theme context if that's what changed
    if (name === 'darkMode' && type === 'checkbox') {
      setDarkMode(checked);
    }
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setSettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Convert settings to API format
      const apiSettings = {
        email_notifications: settings.emailNotifications,
        dark_mode: settings.darkMode,
        auto_refresh: settings.autoRefresh,
        refresh_interval: settings.refreshInterval,
        default_page_size: settings.defaultPageSize
      };
      
      // Save settings to API
      await settingsAPI.updateSettings(apiSettings);
      
      // Show success message
      setSuccess(true);
      setError(null);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      
      // Reset settings to default via API
      const response = await settingsAPI.resetSettings();
      const defaultSettings = response.data.data.settings;
      
      // Update local state
      setSettings({
        emailNotifications: defaultSettings.email_notifications,
        darkMode: defaultSettings.dark_mode,
        autoRefresh: defaultSettings.auto_refresh,
        refreshInterval: defaultSettings.refresh_interval,
        defaultPageSize: defaultSettings.default_page_size
      });
      
      // Update dark mode in theme context
      setDarkMode(defaultSettings.dark_mode);
      
      // Show success message
      setSuccess(true);
      setError(null);
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError('Failed to reset settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  // Handle loading state
  if (loading && !settings) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleChange}
                name="emailNotifications"
                color="primary"
              />
            }
            label="Email Notifications"
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Receive email notifications for new orders, status changes, and other important events.
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Display Settings
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.darkMode}
                onChange={handleChange}
                name="darkMode"
                color="primary"
              />
            }
            label="Dark Mode"
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
            Switch between light and dark theme.
          </Typography>
          
          <TextField
            label="Default Page Size"
            type="number"
            name="defaultPageSize"
            value={settings.defaultPageSize}
            onChange={handleNumberChange}
            InputProps={{ inputProps: { min: 5, max: 100 } }}
            sx={{ width: 200, mt: 2 }}
            helperText="Number of items to show per page (5-100)"
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Data Refresh
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoRefresh}
                onChange={handleChange}
                name="autoRefresh"
                color="primary"
              />
            }
            label="Auto Refresh"
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
            Automatically refresh data on dashboard and list pages.
          </Typography>
          
          <TextField
            label="Refresh Interval (minutes)"
            type="number"
            name="refreshInterval"
            value={settings.refreshInterval}
            onChange={handleNumberChange}
            disabled={!settings.autoRefresh}
            InputProps={{ inputProps: { min: 1, max: 60 } }}
            sx={{ width: 200, mt: 2 }}
            helperText="How often to refresh data (1-60 minutes)"
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset to Default
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Settings'}
          </Button>
        </Box>
      </Paper>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;