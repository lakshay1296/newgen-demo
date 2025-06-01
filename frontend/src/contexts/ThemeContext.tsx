import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { settingsAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Define the light and dark themes
const getTheme = (mode: PaletteMode): Theme => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#3a7bd5',
        light: '#5e9cf6',
        dark: '#2c5ea0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#00bcd4',
        light: '#33c9dc',
        dark: '#008394',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'light' ? '#f8f9fa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#2d3748' : '#e0e0e0',
        secondary: mode === 'light' ? '#718096' : '#a0a0a0',
      },
      error: {
        main: '#e53e3e',
      },
      warning: {
        main: '#ed8936',
      },
      info: {
        main: '#4299e1',
      },
      success: {
        main: '#48bb78',
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 600,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
            borderRadius: 12,
            overflow: 'hidden',
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: '16px 20px',
          },
          title: {
            fontSize: '1.125rem',
            fontWeight: 600,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '20px',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            backgroundColor: mode === 'light' ? '#f8fafc' : '#2a2a2a',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
    },
  });
};

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => Promise<void>;
  setDarkMode: (enabled: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize theme from localStorage or API
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        if (isAuthenticated && user) {
          // If user is authenticated, get settings from API
          const response = await settingsAPI.getSettings();
          const { dark_mode } = response.data.data.settings;
          setDarkModeState(dark_mode);
        } else {
          // If not authenticated, get from localStorage
          const storedDarkMode = localStorage.getItem('darkMode');
          if (storedDarkMode !== null) {
            setDarkModeState(storedDarkMode === 'true');
          }
        }
      } catch (error) {
        console.error('Error initializing theme:', error);
        // Fallback to localStorage if API fails
        const storedDarkMode = localStorage.getItem('darkMode');
        if (storedDarkMode !== null) {
          setDarkModeState(storedDarkMode === 'true');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, [isAuthenticated, user]);

  // Toggle dark mode
  const toggleDarkMode = async (): Promise<void> => {
    try {
      const newDarkMode = !darkMode;
      
      // Update state immediately for responsive UI
      setDarkModeState(newDarkMode);
      
      // Save to localStorage for non-authenticated users or as fallback
      localStorage.setItem('darkMode', String(newDarkMode));
      
      // If authenticated, save to API
      if (isAuthenticated && user) {
        await settingsAPI.updateSettings({ dark_mode: newDarkMode });
      }
    } catch (error) {
      console.error('Error toggling dark mode:', error);
      // Revert state if API call fails
      setDarkModeState(darkMode);
    }
  };

  // Set dark mode directly
  const setDarkMode = async (enabled: boolean): Promise<void> => {
    try {
      // Update state immediately for responsive UI
      setDarkModeState(enabled);
      
      // Save to localStorage for non-authenticated users or as fallback
      localStorage.setItem('darkMode', String(enabled));
      
      // If authenticated, save to API
      if (isAuthenticated && user) {
        await settingsAPI.updateSettings({ dark_mode: enabled });
      }
    } catch (error) {
      console.error('Error setting dark mode:', error);
      // Revert state if API call fails
      setDarkModeState(darkMode);
    }
  };

  // Create theme based on current mode
  const theme = getTheme(darkMode ? 'dark' : 'light');

  // Show loading state or render children
  if (isLoading) {
    return <div>Loading theme...</div>;
  }

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        setDarkMode,
      }}
    >
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};