-- SQL Script to Verify and Update Tables
-- Run this in your MySQL database (academic_erp)

-- ============================================
-- 1. CHECK DOMAINS TABLE STRUCTURE
-- ============================================
DESCRIBE Domains;

-- Expected structure:
-- domain_id (INT, PK, AUTO_INCREMENT)
-- program (VARCHAR(100), NOT NULL)
-- batch (VARCHAR(10), NOT NULL)
-- capacity (INT)
-- qualification (VARCHAR(100))

-- ============================================
-- 2. CHECK STUDENTS TABLE STRUCTURE
-- ============================================
DESCRIBE Students;

-- Expected structure:
-- student_id (INT, PK, AUTO_INCREMENT)
-- roll_number (VARCHAR(20), UNIQUE, NOT NULL)
-- first_name (VARCHAR(50))
-- last_name (VARCHAR(50))
-- email (VARCHAR(100), UNIQUE, NOT NULL)
-- photograph_path (VARCHAR(255))
-- cgpa (DOUBLE)  <-- CHECK IF THIS EXISTS
-- total_credits (INT)
-- graduation_year (INT)
-- domain_id (INT, FK to Domains.domain_id, NOT NULL)
-- specialisation_id (INT)
-- placement_id (INT)

-- ============================================
-- 3. ADD MISSING CGPA COLUMN IF NOT EXISTS
-- ============================================
-- Check if cgpa column exists, if not add it
SET @dbname = DATABASE();
SET @tablename = "Students";
SET @columnname = "cgpa";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column cgpa already exists in Students table.' AS result;",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " DOUBLE NULL AFTER photograph_path;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 4. VERIFY FOREIGN KEY CONSTRAINT
-- ============================================
-- Check if foreign key exists
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'academic_erp'
  AND TABLE_NAME = 'Students'
  AND COLUMN_NAME = 'domain_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- If foreign key doesn't exist, add it:
-- ALTER TABLE Students
-- ADD CONSTRAINT fk_student_domain
-- FOREIGN KEY (domain_id) REFERENCES Domains(domain_id);

-- ============================================
-- 5. FINAL VERIFICATION
-- ============================================
-- Show final table structures
SELECT '=== DOMAINS TABLE ===' AS info;
DESCRIBE Domains;

SELECT '=== STUDENTS TABLE ===' AS info;
DESCRIBE Students;

-- Count records
SELECT '=== RECORD COUNTS ===' AS info;
SELECT COUNT(*) AS domain_count FROM Domains;
SELECT COUNT(*) AS student_count FROM Students;

