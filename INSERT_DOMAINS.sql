-- SQL Script to Insert Domains
-- Run this in your MySQL database (academic_erp)

INSERT INTO Domains (program, batch, capacity, qualification) VALUES
('M.Tech CSE', '2025', 50, 'MTC'),
('iM.Tech CSE', '2025', 50, 'IMT'),
('B.Tech CSE', '2025', 60, 'BTC'),
('B.Tech ECE', '2025', 55, 'BTE'),
('M.Tech ECE', '2025', 45, 'MTE'),
('iM.Tech ECE', '2025', 50, 'IME'),
('MS', '2025', 30, 'MS');

-- Verify domains were inserted
SELECT * FROM Domains;

