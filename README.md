# Order Management System

A comprehensive order management system with a Node.js backend and React.js frontend.

## Features

### Backend (Node.js, Express, MySQL)

- **Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Role-based access control (Admin, Staff, Customer)

- **Customer Management**
  - Create, read, update, and delete customers
  - Search and filter customers
  - Customer order history

- **Product Management**
  - Create, read, update, and delete products
  - Manage product inventory
  - Product categorization
  - Search and filter products

- **Order Management**
  - Create and process orders
  - Order status tracking
  - Order history
  - Order cancellation
  - Payment processing

- **Dashboard & Analytics**
  - Sales statistics
  - Order metrics
  - Product performance

### Frontend (React.js, Material-UI)

- **Responsive Design**
  - Mobile-friendly interface
  - Adaptive layouts

- **User Interface**
  - Dashboard with order metrics
  - Order management interface
  - Customer management interface
  - Product management interface
  - User profile management

- **Advanced Features**
  - Data visualization with charts
  - Filtering and sorting
  - Pagination
  - Form validation
  - Error handling
  - Loading states

## Tech Stack

### Backend
- Node.js
- Express.js
- MySQL
- JWT for authentication
- bcrypt for password hashing
- Express Validator for input validation

### Frontend
- React.js
- Material-UI
- React Router
- Axios for API requests
- React Context API for state management
- Recharts for data visualization

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd order-management-system/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a MySQL database:
   ```bash
   mysql -u root -p < db/schema.sql
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and JWT secret

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd order-management-system/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the API URL if needed

4. Start the development server:
   ```bash
   npm start
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile

### Customer Endpoints
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/stock` - Update product stock

### Order Endpoints
- `GET /api/orders` - Get all orders
- `GET /api/orders/statistics` - Get order statistics
- `GET /api/orders/customer/:customerId` - Get customer orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id` - Update order
- `POST /api/orders/:id/cancel` - Cancel order

## Testing

### Backend Tests

Run backend tests:
```bash
cd order-management-system/backend
npm test
```

Generate test coverage report:
```bash
npm run test:coverage
```

### Frontend Tests

Run frontend tests:
```bash
cd order-management-system/frontend
npm test
```

Run Selenium end-to-end tests:
```bash
npm run test:selenium
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.