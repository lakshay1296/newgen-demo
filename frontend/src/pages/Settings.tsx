import React, { useState } from 'react';
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
  Snackbar
} from '@mui/material';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    autoRefresh: true,
    refreshInterval: 5,
    defaultPageSize: 10
  });
  
  const [success, setSuccess] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  const handleSave = () => {
    // In a real app, this would save to backend or localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSuccess(true);
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

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
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </Box>
      </Paper>
      
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