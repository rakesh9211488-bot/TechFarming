CREATE TABLE user_sessions (
  Token_Hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  User_ID BIGINT UNSIGNED NOT NULL,
  Expires_At DATETIME(3) NOT NULL,
  KEY idx_sessions_expiry (Expires_At),
  CONSTRAINT fk_session_user FOREIGN KEY (User_ID) REFERENCES user_sign_up(ID) ON DELETE CASCADE
) ENGINE=InnoDB;
