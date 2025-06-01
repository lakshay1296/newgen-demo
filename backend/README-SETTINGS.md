# User Settings Backend Integration

This document provides instructions for setting up and using the user settings backend integration.

## Overview

The user settings backend integration provides:

1. RESTful API endpoints for retrieving, updating, and resetting user settings
2. Database schema for storing user preferences
3. Server-side validation for settings data
4. Dark mode implementation with theme switching capability
5. Efficient caching mechanism to minimize database calls
6. Automated tests covering all functionality
7. Comprehensive API documentation

## Setup Instructions

### 1. Create the Database Table

Run the migration script to create the `user_settings` table:

```bash
cd backend
node db/run-migrations.js
```

This will create the necessary table in your MySQL database.

### 2. Restart the Backend Server

Restart your backend server to load the new routes and controllers:

```bash
cd backend
npm run dev
```

## API Endpoints

The following API endpoints are available:

- `GET /api/settings` - Get the current user's settings
- `PUT /api/settings` - Update the current user's settings
- `POST /api/settings/reset` - Reset the current user's settings to default values

All endpoints require authentication with a valid JWT token.

For detailed API documentation, see [settings-api.md](./docs/settings-api.md).

## Frontend Integration

The frontend has been updated to use the settings API:

1. **Theme Context**: A new ThemeContext has been added to manage the application theme (light/dark mode).
2. **Settings Page**: The Settings page has been updated to use the API for retrieving and updating settings.
3. **API Service**: The API service has been updated with methods for interacting with the settings API.

## Testing

Run the automated tests for the settings API:

```bash
cd backend
npm test -- --testPathPattern=settings.controller.test.js
```

## Caching Mechanism

The settings integration includes an efficient caching mechanism:

1. **Frontend Caching**: Settings are cached in localStorage as a fallback mechanism.
2. **Theme Persistence**: Dark mode setting is persisted even for non-authenticated users.

## Dark Mode Implementation

The dark mode implementation includes:

1. **Theme Context**: Manages the application theme based on user settings.
2. **Theme Provider**: Provides the theme to all components in the application.
3. **Theme Switching**: Allows users to switch between light and dark themes.
4. **Theme Persistence**: Persists the theme preference in the database and localStorage.

## Validation

Server-side validation ensures that all settings data is valid:

- `email_notifications`: Boolean
- `dark_mode`: Boolean
- `auto_refresh`: Boolean
- `refresh_interval`: Number between 1 and 60
- `default_page_size`: Number between 5 and 100

## Default Settings

When a user accesses their settings for the first time, default settings are created:

```json
{
  "email_notifications": true,
  "dark_mode": false,
  "auto_refresh": true,
  "refresh_interval": 5,
  "default_page_size": 10
}
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Check your database credentials in the `.env` file
2. Ensure your MySQL server is running
3. Verify that the `order_management` database exists

### API Errors

If you encounter API errors:

1. Check the server logs for detailed error messages
2. Verify that you're including a valid JWT token in your requests
3. Ensure that your request data is valid according to the validation rules

## Security Considerations

The settings API includes several security features:

1. **Authentication**: All endpoints require authentication with a valid JWT token.
2. **Validation**: All input data is validated to prevent injection attacks.
3. **Error Handling**: Detailed error information is logged but not exposed to clients.