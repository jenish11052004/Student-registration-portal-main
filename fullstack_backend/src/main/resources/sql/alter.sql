
-- =======================
--   Modify Domains Table
-- =======================

-- Add new column
-- ALTER TABLE Domains ADD COLUMN description VARCHAR(255);

-- Modify existing column
-- ALTER TABLE Domains MODIFY COLUMN program VARCHAR(150);

-- =======================
--   Modify Students Table
-- =======================

-- Add new column
-- ALTER TABLE Students ADD COLUMN cgpa DOUBLE;

-- Add timestamp columns
-- ALTER TABLE Students ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE Students ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Modify existing column
-- ALTER TABLE Students MODIFY COLUMN photograph_path VARCHAR(500);

-- =======================
--   Add Indexes
-- =======================

-- Add indexes for better performance
-- CREATE INDEX idx_student_email ON Students(email);
-- CREATE INDEX idx_student_roll_number ON Students(roll_number);
-- CREATE INDEX idx_domain_id ON Students(domain_id);


