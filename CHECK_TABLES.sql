-- Quick Check Script for Your Tables
-- Run this in MySQL (academic_erp database)

-- ============================================
-- 1. Check Domains Table Structure
-- ============================================
SELECT '=== DOMAINS TABLE STRUCTURE ===' AS '';
DESCRIBE Domains;

-- ============================================
-- 2. Check Students Table Structure
-- ============================================
SELECT '=== STUDENTS TABLE STRUCTURE ===' AS '';
DESCRIBE Students;

-- ============================================
-- 3. Check if CGPA column exists
-- ============================================
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ CGPA column EXISTS in Students table'
        ELSE '✗ CGPA column MISSING - Need to add it'
    END AS cgpa_status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'academic_erp'
  AND TABLE_NAME = 'Students'
  AND COLUMN_NAME = 'cgpa';

-- ============================================
-- 4. Check Foreign Key Constraint
-- ============================================
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ Foreign key EXISTS (domain_id -> Domains)'
        ELSE '✗ Foreign key MISSING'
    END AS fk_status
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'academic_erp'
  AND TABLE_NAME = 'Students'
  AND COLUMN_NAME = 'domain_id'
  AND REFERENCED_TABLE_NAME = 'Domains';

-- ============================================
-- 5. Show Current Data Counts
-- ============================================
SELECT '=== CURRENT DATA ===' AS '';
SELECT COUNT(*) AS total_domains FROM Domains;
SELECT COUNT(*) AS total_students FROM Students;

-- ============================================
-- 6. If CGPA is missing, run this to add it:
-- ============================================
-- ALTER TABLE Students ADD COLUMN cgpa DOUBLE NULL AFTER photograph_path;

