-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
  settings_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email_notifications BOOLEAN DEFAULT TRUE,
  dark_mode BOOLEAN DEFAULT FALSE,
  auto_refresh BOOLEAN DEFAULT TRUE,
  refresh_interval INT DEFAULT 5,
  default_page_size INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_settings (user_id)
);

-- Add indexes for performance
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);