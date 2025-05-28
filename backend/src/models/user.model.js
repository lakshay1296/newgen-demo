const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  // Create a new user
  static async create(userData) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Insert user into database
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [userData.username, userData.email, hashedPassword, userData.role || 'customer']
      );

      // Check if user was created
      if (result.affectedRows === 0) {
        return null;
      }

      // Return user data
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT user_id, username, email, role, created_at, updated_at FROM users WHERE user_id = ?',
        [id]
      );

      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Update user fields
        const fields = [];
        const values = [];

        // Handle password separately
        if (userData.password) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(userData.password, salt);
          
          await connection.execute(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [hashedPassword, id]
          );
        }

        // Handle other fields
        if (userData.username) {
          fields.push('username = ?');
          values.push(userData.username);
        }

        if (userData.email) {
          fields.push('email = ?');
          values.push(userData.email);
        }

        if (userData.role) {
          fields.push('role = ?');
          values.push(userData.role);
        }

        // If there are fields to update
        if (fields.length > 0) {
          const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
          values.push(id);

          const [result] = await connection.execute(query, values);

          // Check if user was updated
          if (result.affectedRows === 0) {
            await connection.rollback();
            connection.release();
            return null;
          }
        }

        // Commit transaction
        await connection.commit();
        connection.release();

        // Return updated user data
        return this.findById(id);
      } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE user_id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }
}

module.exports = User;