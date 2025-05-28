const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Dashboard and Navigation Tests', function() {
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
  
  it('should display dashboard with statistics', async function() {
    // Navigate to dashboard
    await driver.get('http://localhost:3001/');
    
    // Wait for dashboard to load
    await driver.wait(until.elementLocated(By.css('h1')), 5000);
    
    // Check if dashboard title is displayed
    const pageTitle = await driver.findElement(By.css('h1')).getText();
    assert.strictEqual(pageTitle, 'Dashboard', 'Page title should be "Dashboard"');
    
    // Check if statistics cards are displayed
    const statCards = await driver.findElements(By.css('.MuiPaper-root'));
    assert.ok(statCards.length >= 4, 'Dashboard should display at least 4 statistic cards');
    
    // Check if charts are displayed
    const charts = await driver.findElements(By.css('.recharts-responsive-container'));
    assert.ok(charts.length >= 2, 'Dashboard should display at least 2 charts');
  });
  
  it('should filter dashboard by time range', async function() {
    // Navigate to dashboard
    await driver.get('http://localhost:3001/');
    
    // Wait for dashboard to load
    await driver.wait(until.elementLocated(By.css('h1')), 5000);
    
    // Click on "Last Week" filter button
    const lastWeekButton = await driver.findElement(By.xpath('//button[contains(text(), "Last Week")]'));
    await lastWeekButton.click();
    
    // Wait for dashboard to update
    await driver.sleep(2000);
    
    // Check if the button is now active (contained variant)
    const isActive = await lastWeekButton.getAttribute('class');
    assert.ok(isActive.includes('MuiButton-contained'), 'Last Week button should be active');
  });
  
  it('should navigate to orders page from sidebar', async function() {
    // Navigate to dashboard
    await driver.get('http://localhost:3001/');
    
    // Click on Orders link in sidebar
    const ordersLink = await driver.findElement(By.xpath('//a[contains(@href, "/orders")]'));
    await ordersLink.click();
    
    // Wait for navigation to complete
    await driver.wait(until.urlIs('http://localhost:3001/orders'), 5000);
    
    // Check if we're on the orders page
    const pageTitle = await driver.findElement(By.css('h1')).getText();
    assert.strictEqual(pageTitle, 'Orders', 'Page title should be "Orders"');
  });
  
  it('should navigate to customers page from sidebar', async function() {
    // Navigate to dashboard
    await driver.get('http://localhost:3001/');
    
    // Click on Customers link in sidebar
    const customersLink = await driver.findElement(By.xpath('//a[contains(@href, "/customers")]'));
    await customersLink.click();
    
    // Wait for navigation to complete
    await driver.wait(until.urlIs('http://localhost:3001/customers'), 5000);
    
    // Check if we're on the customers page
    const pageTitle = await driver.findElement(By.css('h1')).getText();
    assert.strictEqual(pageTitle, 'Customers', 'Page title should be "Customers"');
  });
  
  it('should navigate to products page from sidebar', async function() {
    // Navigate to dashboard
    await driver.get('http://localhost:3001/');
    
    // Click on Products link in sidebar
    const productsLink = await driver.findElement(By.xpath('//a[contains(@href, "/products")]'));
    await productsLink.click();
    
    // Wait for navigation to complete
    await driver.wait(until.urlIs('http://localhost:3001/products'), 5000);
    
    // Check if we're on the products page
    const pageTitle = await driver.findElement(By.css('h1')).getText();
    assert.strictEqual(pageTitle, 'Products', 'Page title should be "Products"');
  });
  
  it('should navigate to settings page from sidebar', async function() {
    // Navigate to dashboard
    await driver.get('http://localhost:3001/');
    
    // Click on Settings link in sidebar
    const settingsLink = await driver.findElement(By.xpath('//a[contains(@href, "/settings")]'));
    await settingsLink.click();
    
    // Wait for navigation to complete
    await driver.wait(until.urlIs('http://localhost:3001/settings'), 5000);
    
    // Check if we're on the settings page
    const pageTitle = await driver.findElement(By.css('h1')).getText();
    assert.strictEqual(pageTitle, 'Settings', 'Page title should be "Settings"');
  });
  
  it('should navigate to profile page from user menu', async function() {
    // Navigate to dashboard
    await driver.get('http://localhost:3001/');
    
    // Click on user avatar to open menu
    const userAvatar = await driver.findElement(By.css('.MuiAvatar-root'));
    await userAvatar.click();
    
    // Wait for menu to appear
    await driver.wait(until.elementLocated(By.css('.MuiMenu-paper')), 5000);
    
    // Click on Profile link
    const profileLink = await driver.findElement(By.xpath('//li[contains(text(), "Profile")]'));
    await profileLink.click();
    
    // Wait for navigation to complete
    await driver.wait(until.urlIs('http://localhost:3001/profile'), 5000);
    
    // Check if we're on the profile page
    const pageTitle = await driver.findElement(By.css('h1')).getText();
    assert.strictEqual(pageTitle, 'Profile', 'Page title should be "Profile"');
  });
  
  it('should logout successfully', async function() {
    // Navigate to dashboard
    await driver.get('http://localhost:3001/');
    
    // Click on user avatar to open menu
    const userAvatar = await driver.findElement(By.css('.MuiAvatar-root'));
    await userAvatar.click();
    
    // Wait for menu to appear
    await driver.wait(until.elementLocated(By.css('.MuiMenu-paper')), 5000);
    
    // Click on Logout link
    const logoutLink = await driver.findElement(By.xpath('//li[contains(text(), "Logout")]'));
    await logoutLink.click();
    
    // Wait for navigation to login page
    await driver.wait(until.urlIs('http://localhost:3001/login'), 5000);
    
    // Check if we're on the login page
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    const buttonText = await loginButton.getText();
    
    assert.strictEqual(buttonText, 'Sign In', 'Login button should have text "Sign In"');
  });
});

// Helper function
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