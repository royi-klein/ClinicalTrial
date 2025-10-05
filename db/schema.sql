-- Create the issues table
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  site VARCHAR(100),
  severity ENUM('minor', 'major', 'critical') NOT NULL DEFAULT 'minor',
  status ENUM('open', 'in_progress', 'resolved') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_severity (severity),
  INDEX idx_created_at (created_at DESC),
  FULLTEXT INDEX idx_title_search (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data from the assignment
INSERT INTO issues (title, description, site, severity, status, created_at) VALUES
('Missing consent form', 'Consent form not in file for patient 003', 'Site-101', 'major', 'open', '2025-05-01 09:00:00'),
('Late visit', 'Visit week 4 occurred on week 6', 'Site-202', 'minor', 'in_progress', '2025-05-03 12:30:00'),
('Drug temp excursion', 'IP stored above max temp for 6 hours', 'Site-101', 'critical', 'open', '2025-05-10 08:15:00'),
('Unblinded email', 'Coordinator emailed treatment arm to CRA', 'Site-303', 'major', 'resolved', '2025-05-14 16:00:00');