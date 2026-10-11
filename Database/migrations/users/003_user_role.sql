ALTER TABLE user_sign_up ADD COLUMN Role ENUM('user', 'admin') NOT NULL DEFAULT 'user';
