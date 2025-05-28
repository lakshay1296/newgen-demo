-- Drop database if exists and create a new one
DROP DATABASE IF EXISTS order_management;
CREATE DATABASE order_management;
USE order_management;

-- Users table
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  stock_quantity INT NOT NULL DEFAULT 0,
  category VARCHAR(50),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery') NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  shipping_address VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(100),
  tracking_number VARCHAR(100),
  notes TEXT,
  created_by INT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id),
  FOREIGN KEY (updated_by) REFERENCES users(user_id)
);

-- Order items table
CREATE TABLE order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Order history table
CREATE TABLE order_history (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL,
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Insert admin user
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@example.com', '$2b$10$1JlHU4vy0P5B5Hh.JrGQ4OYgQzKJmZvJ3jqL3RGpPdQIqzK.vvhF.', 'admin');
-- Password: password123

-- Insert sample customers
INSERT INTO customers (first_name, last_name, email, phone, address, city, state, postal_code, country)
VALUES 
('John', 'Doe', 'john@example.com', '555-123-4567', '123 Main St', 'Anytown', 'CA', '12345', 'USA'),
('Jane', 'Smith', 'jane@example.com', '555-987-6543', '456 Oak Ave', 'Somewhere', 'NY', '67890', 'USA'),
('Bob', 'Johnson', 'bob@example.com', '555-555-5555', '789 Pine Rd', 'Nowhere', 'TX', '54321', 'USA');

-- Insert sample products
INSERT INTO products (name, description, price, sku, stock_quantity, category, image_url)
VALUES 
('Laptop', 'High-performance laptop with 16GB RAM', 999.99, 'TECH-001', 10, 'Electronics', 'https://example.com/laptop.jpg'),
('Smartphone', 'Latest model with 128GB storage', 699.99, 'TECH-002', 15, 'Electronics', 'https://example.com/smartphone.jpg'),
('Headphones', 'Noise-cancelling wireless headphones', 199.99, 'TECH-003', 20, 'Electronics', 'https://example.com/headphones.jpg'),
('T-shirt', 'Cotton t-shirt, available in multiple colors', 19.99, 'CLOTH-001', 50, 'Clothing', 'https://example.com/tshirt.jpg'),
('Jeans', 'Slim fit jeans, available in multiple sizes', 49.99, 'CLOTH-002', 30, 'Clothing', 'https://example.com/jeans.jpg'),
('Sneakers', 'Comfortable sneakers for everyday wear', 79.99, 'SHOE-001', 25, 'Footwear', 'https://example.com/sneakers.jpg'),
('Coffee Maker', 'Automatic coffee maker with timer', 89.99, 'HOME-001', 12, 'Home Appliances', 'https://example.com/coffeemaker.jpg'),
('Blender', 'High-speed blender for smoothies and more', 69.99, 'HOME-002', 8, 'Home Appliances', 'https://example.com/blender.jpg'),
('Desk Lamp', 'Adjustable LED desk lamp', 29.99, 'HOME-003', 18, 'Home Decor', 'https://example.com/lamp.jpg'),
('Backpack', 'Durable backpack with multiple compartments', 39.99, 'ACC-001', 22, 'Accessories', 'https://example.com/backpack.jpg');

-- Insert sample orders
INSERT INTO orders (customer_id, total_amount, status, payment_method, payment_status, shipping_address, shipping_city, shipping_state, shipping_postal_code, shipping_country, created_by)
VALUES 
(1, 1199.98, 'delivered', 'credit_card', 'paid', '123 Main St', 'Anytown', 'CA', '12345', 'USA', 1),
(2, 699.99, 'shipped', 'paypal', 'paid', '456 Oak Ave', 'Somewhere', 'NY', '67890', 'USA', 1),
(3, 219.98, 'processing', 'debit_card', 'paid', '789 Pine Rd', 'Nowhere', 'TX', '54321', 'USA', 1),
(1, 119.98, 'pending', 'bank_transfer', 'pending', '123 Main St', 'Anytown', 'CA', '12345', 'USA', 1);

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
VALUES 
(1, 1, 1, 999.99, 999.99),
(1, 3, 1, 199.99, 199.99),
(2, 2, 1, 699.99, 699.99),
(3, 4, 1, 19.99, 19.99),
(3, 10, 5, 39.99, 199.99),
(4, 5, 1, 49.99, 49.99),
(4, 9, 1, 29.99, 29.99),
(4, 4, 2, 19.99, 39.98);

-- Insert sample order history
INSERT INTO order_history (order_id, status, notes, created_by)
VALUES 
(1, 'pending', 'Order created', 1),
(1, 'processing', 'Payment confirmed', 1),
(1, 'shipped', 'Order shipped via UPS', 1),
(1, 'delivered', 'Order delivered', 1),
(2, 'pending', 'Order created', 1),
(2, 'processing', 'Payment confirmed', 1),
(2, 'shipped', 'Order shipped via FedEx', 1),
(3, 'pending', 'Order created', 1),
(3, 'processing', 'Payment confirmed', 1),
(4, 'pending', 'Order created', 1);