# Settings API Documentation

This document provides information about the Settings API endpoints, request/response formats, and integration points.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:5000/api
```

## Authentication

All Settings API endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Get User Settings

Retrieves the current user's settings.

- **URL**: `/settings`
- **Method**: `GET`
- **Auth Required**: Yes

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "data": {
    "settings": {
      "settings_id": 1,
      "user_id": 1,
      "email_notifications": true,
      "dark_mode": false,
      "auto_refresh": true,
      "refresh_interval": 5,
      "default_page_size": 10,
      "created_at": "2025-06-01T05:30:00.000Z",
      "updated_at": "2025-06-01T05:30:00.000Z"
    }
  }
}
```

#### Error Response

- **Code**: `401 Unauthorized`
- **Content**:

```json
{
  "success": false,
  "message": "Authentication required. No token provided."
}
```

OR

- **Code**: `500 Internal Server Error`
- **Content**:

```json
{
  "success": false,
  "message": "Error getting user settings",
  "error": "Error message details"
}
```

### Update User Settings

Updates the current user's settings.

- **URL**: `/settings`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Data Constraints**:

```json
{
  "email_notifications": boolean,
  "dark_mode": boolean,
  "auto_refresh": boolean,
  "refresh_interval": number (1-60),
  "default_page_size": number (5-100)
}
```

All fields are optional. Only the fields that are provided will be updated.

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "settings": {
      "settings_id": 1,
      "user_id": 1,
      "email_notifications": true,
      "dark_mode": true,
      "auto_refresh": true,
      "refresh_interval": 10,
      "default_page_size": 20,
      "created_at": "2025-06-01T05:30:00.000Z",
      "updated_at": "2025-06-01T05:35:00.000Z"
    }
  }
}
```

#### Error Response

- **Code**: `400 Bad Request`
- **Content**:

```json
{
  "success": false,
  "errors": [
    {
      "value": "invalid",
      "msg": "Refresh interval must be between 1 and 60 minutes",
      "param": "refresh_interval",
      "location": "body"
    }
  ]
}
```

OR

- **Code**: `401 Unauthorized`
- **Content**:

```json
{
  "success": false,
  "message": "Authentication required. No token provided."
}
```

OR

- **Code**: `500 Internal Server Error`
- **Content**:

```json
{
  "success": false,
  "message": "Error updating user settings",
  "error": "Error message details"
}
```

### Reset User Settings

Resets the current user's settings to default values.

- **URL**: `/settings/reset`
- **Method**: `POST`
- **Auth Required**: Yes

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "message": "Settings reset to default",
  "data": {
    "settings": {
      "settings_id": 1,
      "user_id": 1,
      "email_notifications": true,
      "dark_mode": false,
      "auto_refresh": true,
      "refresh_interval": 5,
      "default_page_size": 10,
      "created_at": "2025-06-01T05:30:00.000Z",
      "updated_at": "2025-06-01T05:40:00.000Z"
    }
  }
}
```

#### Error Response

- **Code**: `401 Unauthorized`
- **Content**:

```json
{
  "success": false,
  "message": "Authentication required. No token provided."
}
```

OR

- **Code**: `500 Internal Server Error`
- **Content**:

```json
{
  "success": false,
  "message": "Error resetting user settings",
  "error": "Error message details"
}
```

## Integration Points

### Frontend Integration

The Settings API is integrated with the frontend through the following components:

1. **Settings Page**: The main interface for users to view and update their settings.
   - File: `frontend/src/pages/Settings.tsx`

2. **Theme Context**: Manages the application theme (light/dark mode) based on user settings.
   - File: `frontend/src/contexts/ThemeContext.tsx`

3. **API Service**: Provides methods to interact with the Settings API.
   - File: `frontend/src/services/api.ts`

### Caching

The Settings API implements caching to minimize database calls:

1. **Frontend Caching**: Settings are cached in localStorage as a fallback mechanism.
2. **Theme Persistence**: Dark mode setting is persisted even for non-authenticated users.

### Error Handling

The API includes comprehensive error handling:

1. **Validation Errors**: Returns detailed validation errors for invalid input.
2. **Authentication Errors**: Returns appropriate errors for unauthenticated requests.
3. **Server Errors**: Logs detailed error information and returns user-friendly error messages.

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