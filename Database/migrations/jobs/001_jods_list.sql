-- Preserve the legacy table and column names expected by server.js.
CREATE TABLE jods_list (
  ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  Job_category VARCHAR(150) NOT NULL,
  Job_title VARCHAR(200) NOT NULL,
  Job_location VARCHAR(200) NOT NULL,
  Job_span VARCHAR(100) NOT NULL,
  Job_description TEXT NOT NULL,
  Job_requirements TEXT NULL,
  Job_additionInfo TEXT NULL,
  Created_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_jobs_category_location (Job_category, Job_location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
