const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Database connection config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'order_management',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
};

async function runMigration() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'user_settings.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    console.log('Running migration...');
    await connection.query(sql);
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the migration
runMigration();