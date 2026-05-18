-- Bảng users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('EMPLOYEE', 'MANAGER')),
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng leave_balances
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    year INT NOT NULL,
    total_days NUMERIC NOT NULL DEFAULT 12.0,
    used_days NUMERIC NOT NULL DEFAULT 0,
    carried_over_days NUMERIC NOT NULL DEFAULT 0,
    UNIQUE(user_id, year)
);

-- Bảng leave_requests
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count NUMERIC NOT NULL,
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('ANNUAL', 'SICK', 'UNPAID', 'OTHER')),
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    reviewed_by UUID REFERENCES users(id),
    review_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng leave_accumulation_logs
CREATE TABLE leave_accumulation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    from_year INT NOT NULL,
    to_year INT NOT NULL,
    days_carried NUMERIC NOT NULL,
    days_expired NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data mẫu
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'manager@axonactive.com', '$2a$10$dummy_hash', 'Manager A', 'MANAGER'),
('22222222-2222-2222-2222-222222222222', 'employee@axonactive.com', '$2a$10$dummy_hash', 'Employee B', 'EMPLOYEE');

UPDATE users SET manager_id = '11111111-1111-1111-1111-111111111111' 
WHERE id = '22222222-2222-2222-2222-222222222222';

INSERT INTO leave_balances (user_id, year, total_days, used_days, carried_over_days) VALUES
('22222222-2222-2222-2222-222222222222', 2026, 12.0, 0, 0);