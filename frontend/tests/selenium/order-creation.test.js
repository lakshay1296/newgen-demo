const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Order Creation Tests', function() {
  let driver;
  
  // Set timeout for tests
  this.timeout(60000);
  
  before(async function() {
    // Set up Chrome options
    const options = new chrome.Options();
    options.addArguments('--headless'); // Run in headless mode
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    // Build the driver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    // Login before running tests
    await login(driver);
  });
  
  after(async function() {
    // Quit the driver
    await driver.quit();
  });
  
  it('should navigate to order creation page', async function() {
    // Navigate to orders page
    await driver.get('http://localhost:3001/orders');
    
    // Click on "New Order" button
    const newOrderButton = await driver.findElement(By.xpath('//button[contains(text(), "New Order")]'));
    await newOrderButton.click();
    
    // Wait for navigation to complete
    await driver.wait(until.urlContains('/orders/create'), 5000);
    
    // Check if we're on the order creation page
    const pageTitle = await driver.findElement(By.css('h1')).getText();
    assert.strictEqual(pageTitle, 'Create New Order', 'Page title should be "Create New Order"');
  });
  
  it('should show validation errors for empty form submission', async function() {
    // Navigate to order creation page
    await driver.get('http://localhost:3001/orders/create');
    
    // Submit the form without entering any data
    const createButton = await driver.findElement(By.xpath('//button[contains(text(), "Create Order")]'));
    await createButton.click();
    
    // Wait for validation errors to appear
    await driver.wait(until.elementLocated(By.css('.MuiAlert-root')), 5000);
    
    // Check if validation error is displayed
    const errorAlert = await driver.findElement(By.css('.MuiAlert-root'));
    const errorText = await errorAlert.getText();
    
    assert.ok(errorText.includes('Please select a customer'), 'Validation error should be displayed');
  });
  
  it('should create a new order successfully', async function() {
    // Navigate to order creation page
    await driver.get('http://localhost:3001/orders/create');
    
    // Select a customer
    await selectCustomer(driver);
    
    // Add an item to the order
    await addOrderItem(driver);
    
    // Select payment method
    await selectPaymentMethod(driver, 'credit_card');
    
    // Fill in shipping information
    await fillShippingInfo(driver);
    
    // Submit the form
    const createButton = await driver.findElement(By.xpath('//button[contains(text(), "Create Order")]'));
    await createButton.click();
    
    // Wait for navigation to order detail page
    await driver.wait(until.urlMatches(/\/orders\/\d+$/), 10000);
    
    // Check if we're on the order detail page
    const pageTitle = await driver.findElement(By.css('h1')).getText();
    assert.ok(pageTitle.includes('Order #'), 'Page title should include "Order #"');
    
    // Check if success message is displayed
    const orderStatus = await driver.findElement(By.css('.MuiChip-root')).getText();
    assert.strictEqual(orderStatus, 'Pending', 'Order status should be "Pending"');
  });
  
  it('should cancel an order', async function() {
    // Navigate to orders page
    await driver.get('http://localhost:3001/orders');
    
    // Click on the first order in the list
    const firstOrderLink = await driver.findElement(By.css('tbody tr:first-child .MuiIconButton-root'));
    await firstOrderLink.click();
    
    // Wait for navigation to order detail page
    await driver.wait(until.urlMatches(/\/orders\/\d+$/), 5000);
    
    // Click on "Cancel Order" button
    const cancelButton = await driver.findElement(By.xpath('//button[contains(text(), "Cancel Order")]'));
    await cancelButton.click();
    
    // Wait for confirmation dialog
    await driver.wait(until.elementLocated(By.css('.MuiDialog-root')), 5000);
    
    // Enter cancellation reason
    const reasonField = await driver.findElement(By.css('.MuiDialog-root textarea'));
    await reasonField.sendKeys('Test cancellation');
    
    // Confirm cancellation
    const confirmButton = await driver.findElement(By.xpath('//button[contains(text(), "Yes, Cancel Order")]'));
    await confirmButton.click();
    
    // Wait for page to update
    await driver.sleep(2000);
    
    // Check if order status is updated to "Cancelled"
    const orderStatus = await driver.findElement(By.css('.MuiChip-root')).getText();
    assert.strictEqual(orderStatus, 'Cancelled', 'Order status should be "Cancelled"');
  });
});

// Helper functions
async function login(driver) {
  // Navigate to login page
  await driver.get('http://localhost:3001/login');
  
  // Enter credentials
  const emailField = await driver.findElement(By.id('email'));
  const passwordField = await driver.findElement(By.id('password'));
  const loginButton = await driver.findElement(By.css('button[type="submit"]'));
  
  await emailField.sendKeys('admin@example.com');
  await passwordField.sendKeys('password123');
  await loginButton.click();
  
  // Wait for login to complete
  await driver.wait(until.urlIs('http://localhost:3001/'), 5000);
}

async function selectCustomer(driver) {
  // Click on customer autocomplete
  const customerField = await driver.findElement(By.css('input[placeholder="Select Customer"]'));
  await customerField.click();
  
  // Wait for dropdown to appear
  await driver.sleep(1000);
  
  // Select the first customer in the dropdown
  const firstCustomer = await driver.findElement(By.css('.MuiAutocomplete-option'));
  await firstCustomer.click();
}

async function addOrderItem(driver) {
  // Click "Add Item" button
  const addItemButton = await driver.findElement(By.xpath('//button[contains(text(), "Add Item")]'));
  await addItemButton.click();
  
  // Wait for item row to appear
  await driver.sleep(1000);
  
  // Select a product
  const productField = await driver.findElement(By.css('input[placeholder="Select Product"]'));
  await productField.click();
  
  // Wait for dropdown to appear
  await driver.sleep(1000);
  
  // Select the first product in the dropdown
  const firstProduct = await driver.findElement(By.css('.MuiAutocomplete-option'));
  await firstProduct.click();
  
  // Set quantity
  const quantityField = await driver.findElement(By.css('input[type="number"]'));
  await quantityField.clear();
  await quantityField.sendKeys('2');
}

async function selectPaymentMethod(driver, method) {
  // Click on payment method dropdown
  const paymentMethodField = await driver.findElement(By.id('payment-method-label')).click();
  
  // Wait for dropdown to appear
  await driver.sleep(1000);
  
  // Select the specified payment method
  const paymentOption = await driver.findElement(By.xpath(`//li[contains(text(), "${method.replace('_', ' ')}")]`));
  await paymentOption.click();
}

async function fillShippingInfo(driver) {
  // Fill in shipping address fields
  const addressFields = {
    'Address': '123 Main St',
    'City': 'Anytown',
    'Postal Code': '12345',
    'Country': 'USA'
  };
  
  for (const [label, value] of Object.entries(addressFields)) {
    const field = await driver.findElement(By.xpath(`//label[contains(text(), "${label}")]/following-sibling::div/input`));
    await field.clear();
    await field.sendKeys(value);
  }
}