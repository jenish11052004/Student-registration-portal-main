-- SQL Script to Clear All Tables
-- Run this in your MySQL database (academic_erp)

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear Students table
TRUNCATE TABLE Students;

-- Clear Domains table (if you want to clear domains too)
-- TRUNCATE TABLE Domains;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify tables are empty
SELECT COUNT(*) as student_count FROM Students;
SELECT COUNT(*) as domain_count FROM Domains;

