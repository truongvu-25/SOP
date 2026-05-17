-- Bảng users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    manager_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng leave_balances
CREATE TABLE leave_balances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    year INT NOT NULL,
    total_days INT NOT NULL DEFAULT 12,
    used_days INT NOT NULL DEFAULT 0,
    remaining_days INT NOT NULL DEFAULT 12,
    UNIQUE(user_id, year)
);

-- Bảng leave_requests
CREATE TABLE leave_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    working_days INT NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data mẫu
INSERT INTO users (full_name, email, password, role) VALUES
('Manager A', 'manager@axonactive.com', '$2a$10$dummy_hash', 'MANAGER'),
('Employee B', 'employee@axonactive.com', '$2a$10$dummy_hash', 'EMPLOYEE');

INSERT INTO leave_balances (user_id, year, total_days, used_days, remaining_days) VALUES
(2, 2026, 12, 0, 12);