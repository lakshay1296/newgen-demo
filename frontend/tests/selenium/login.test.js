const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Login Page Tests', function() {
  let driver;
  
  // Set timeout for tests
  this.timeout(30000);
  
  beforeEach(async function() {
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
    
    // Navigate to the login page
    await driver.get('http://localhost:3001/login');
  });
  
  afterEach(async function() {
    // Quit the driver
    await driver.quit();
  });
  
  it('should display login form', async function() {
    // Check if the login form elements are present
    const emailField = await driver.findElement(By.id('email'));
    const passwordField = await driver.findElement(By.id('password'));
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    
    assert.ok(emailField, 'Email field should be present');
    assert.ok(passwordField, 'Password field should be present');
    assert.ok(loginButton, 'Login button should be present');
    
    // Check the login button text
    const buttonText = await loginButton.getText();
    assert.strictEqual(buttonText, 'Sign In', 'Login button should have text "Sign In"');
  });
  
  it('should show validation errors for empty fields', async function() {
    // Click the login button without entering any data
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    await loginButton.click();
    
    // Wait for validation errors to appear
    await driver.wait(until.elementLocated(By.css('.MuiAlert-root')), 5000);
    
    // Check if validation error is displayed
    const errorAlert = await driver.findElement(By.css('.MuiAlert-root'));
    const errorText = await errorAlert.getText();
    
    assert.ok(errorText.includes('Please fill in all required fields'), 'Validation error should be displayed');
  });
  
  it('should show error for invalid credentials', async function() {
    // Enter invalid credentials
    const emailField = await driver.findElement(By.id('email'));
    const passwordField = await driver.findElement(By.id('password'));
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    
    await emailField.sendKeys('invalid@example.com');
    await passwordField.sendKeys('wrongpassword');
    await loginButton.click();
    
    // Wait for error message to appear
    await driver.wait(until.elementLocated(By.css('.MuiAlert-root')), 5000);
    
    // Check if error message is displayed
    const errorAlert = await driver.findElement(By.css('.MuiAlert-root'));
    const errorText = await errorAlert.getText();
    
    assert.ok(errorText.includes('Invalid credentials'), 'Invalid credentials error should be displayed');
  });
  
  it('should navigate to register page when clicking register link', async function() {
    // Find and click the register link
    const registerLink = await driver.findElement(By.linkText('Don\'t have an account? Sign up'));
    await registerLink.click();
    
    // Wait for navigation to complete
    await driver.wait(until.urlContains('/register'), 5000);
    
    // Check if we're on the register page
    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes('/register'), 'Should navigate to register page');
    
    // Check if register form is displayed
    const registerButton = await driver.findElement(By.css('button[type="submit"]'));
    const buttonText = await registerButton.getText();
    
    assert.strictEqual(buttonText, 'Sign Up', 'Register button should have text "Sign Up"');
  });
});