-- =======================
--   TABLE: Domains
-- =======================
CREATE TABLE if not exists Domains(
    domain_id INT PRIMARY KEY AUTO_INCREMENT,
    program VARCHAR(100),
    batch VARCHAR(10),
    capacity INT,
    qualification VARCHAR(100)
);

-- =======================
--   TABLE: Students
-- =======================
CREATE TABLE if not exists Students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    photograph_path VARCHAR(255),
    total_credits INT,
    graduation_year INT,
    domain_id INT,
    specialisation_id INT,
    placement_id INT,
    FOREIGN KEY (domain_id) REFERENCES Domains(domain_id)
);
