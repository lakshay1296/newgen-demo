# Order Management System Tests

This directory contains tests for the Order Management System frontend application.

## Unit Tests

Unit tests are written using Jest and React Testing Library. These tests verify the functionality of individual components in isolation.

To run unit tests:

```bash
npm test
```

## Selenium Tests

Selenium tests are end-to-end tests that simulate user interactions with the application in a real browser. These tests verify that the application works correctly from a user's perspective.

### Prerequisites

To run Selenium tests, you need:

1. Chrome browser installed
2. ChromeDriver installed and available in your PATH
3. The backend server running on http://localhost:5000
4. The frontend server running on http://localhost:3001
5. Test data in the database (users, customers, products)

### Running Selenium Tests

To run all Selenium tests:

```bash
npm run test:selenium
```

To run a specific test file:

```bash
npx mocha tests/selenium/login.test.js
```

### Test Files

- `login.test.js`: Tests for the login page and authentication flow
- `order-creation.test.js`: Tests for creating and canceling orders
- `dashboard.test.js`: Tests for dashboard functionality and navigation

## Test Coverage

To generate a test coverage report:

```bash
npm test -- --coverage
```

The coverage report will be available in the `coverage` directory.

## Continuous Integration

These tests are designed to be run in a CI/CD pipeline. The Selenium tests can run in headless mode, which is suitable for CI environments.

## Troubleshooting

If you encounter issues with Selenium tests:

1. Make sure both backend and frontend servers are running
2. Verify that ChromeDriver version matches your Chrome browser version
3. Check that test data exists in the database
4. Increase timeouts if tests are failing due to slow response times