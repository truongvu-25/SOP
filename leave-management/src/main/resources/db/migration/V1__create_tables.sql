-- =============================================
-- BƯỚC 1: XÓA BẢNG CŨ NẾU CÓ
-- =============================================
DROP TABLE IF EXISTS leave_accumulation_logs CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS leave_type_enum CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

-- =============================================
-- BƯỚC 2: TẠO ENUM TYPES
-- =============================================
CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'MANAGER');
CREATE TYPE leave_type_enum AS ENUM ('ANNUAL', 'SICK', 'UNPAID', 'OTHER');
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- =============================================
-- BƯỚC 3: TẠO BẢNG
-- =============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    manager_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leave_balances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INT NOT NULL,
    total_days NUMERIC(4,1) NOT NULL DEFAULT 12.0,
    used_days NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    carried_over_days NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, year)
);

CREATE TABLE leave_requests (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count NUMERIC(4,1) NOT NULL,
    leave_type leave_type_enum NOT NULL,
    reason TEXT,
    status request_status NOT NULL DEFAULT 'PENDING',
    reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    review_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leave_accumulation_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_year INT NOT NULL,
    to_year INT NOT NULL,
    days_carried NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    days_expired NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BƯỚC 4: SEED DATA
-- =============================================
INSERT INTO users (email, password_hash, full_name, role, manager_id) VALUES
('manager1@company.com', 'hash123', 'Nguyễn Văn An', 'MANAGER', NULL),
('manager2@company.com', 'hash123', 'Trần Thị Bình', 'MANAGER', NULL),
('emp1@company.com', 'hash123', 'Phạm Thị Dung', 'EMPLOYEE', 1),
('emp2@company.com', 'hash123', 'Hoàng Văn Em', 'EMPLOYEE', 1),
('emp3@company.com', 'hash123', 'Ngô Thị Phương', 'EMPLOYEE', 1),
('emp4@company.com', 'hash123', 'Vũ Văn Giang', 'EMPLOYEE', 1),
('emp5@company.com', 'hash123', 'Đặng Thị Hoa', 'EMPLOYEE', 1),
('emp6@company.com', 'hash123', 'Bùi Văn Inh', 'EMPLOYEE', 1),
('emp7@company.com', 'hash123', 'Đinh Thị Kim', 'EMPLOYEE', 1),
('emp8@company.com', 'hash123', 'Lý Văn Long', 'EMPLOYEE', 1),
('emp9@company.com', 'hash123', 'Mai Thị My', 'EMPLOYEE', 1),
('emp10@company.com', 'hash123', 'Phan Văn Nam', 'EMPLOYEE', 2),
('emp11@company.com', 'hash123', 'Quách Thị Oanh', 'EMPLOYEE', 2),
('emp12@company.com', 'hash123', 'Trịnh Văn Phúc', 'EMPLOYEE', 2),
('emp13@company.com', 'hash123', 'Dương Thị Quỳnh', 'EMPLOYEE', 2),
('emp14@company.com', 'hash123', 'Hồ Văn Rồng', 'EMPLOYEE', 2),
('emp15@company.com', 'hash123', 'Tô Thị Sen', 'EMPLOYEE', 2),
('emp16@company.com', 'hash123', 'Châu Văn Tài', 'EMPLOYEE', 2),
('emp17@company.com', 'hash123', 'Lương Thị Uyên', 'EMPLOYEE', 2),
('emp18@company.com', 'hash123', 'Võ Văn Xuân', 'EMPLOYEE', 2);

INSERT INTO leave_balances (user_id, year, total_days, used_days, carried_over_days) VALUES
(3, 2026, 12.0, 3.0, 2.0),
(4, 2026, 12.0, 5.0, 0.0),
(5, 2026, 12.0, 0.0, 3.0),
(6, 2026, 12.0, 2.0, 1.0),
(7, 2026, 12.0, 8.0, 0.0),
(8, 2026, 12.0, 1.0, 2.0),
(9, 2026, 12.0, 4.0, 0.0),
(10, 2026, 12.0, 0.0, 1.0),
(11, 2026, 12.0, 6.0, 2.0),
(12, 2026, 12.0, 2.0, 0.0),
(13, 2026, 12.0, 3.0, 3.0),
(14, 2026, 12.0, 0.0, 0.0),
(15, 2026, 12.0, 1.0, 2.0),
(16, 2026, 12.0, 7.0, 0.0),
(17, 2026, 12.0, 2.0, 1.0),
(18, 2026, 12.0, 0.0, 3.0),
(19, 2026, 12.0, 4.0, 0.0),
(20, 2026, 12.0, 1.0, 1.0);

INSERT INTO leave_requests (employee_id, start_date, end_date, days_count, leave_type, reason, status, reviewed_by, review_note) VALUES
(3, '2026-01-05', '2026-01-07', 3.0, 'ANNUAL', 'Nghỉ tết dương lịch', 'APPROVED', 1, 'Đồng ý'),
(4, '2026-02-10', '2026-02-14', 5.0, 'ANNUAL', 'Nghỉ phép năm', 'APPROVED', 1, 'Chấp thuận'),
(5, '2026-03-01', '2026-03-01', 1.0, 'SICK', 'Đi khám bệnh', 'APPROVED', 1, 'OK'),
(6, '2026-03-15', '2026-03-16', 2.0, 'ANNUAL', 'Việc gia đình', 'REJECTED', 1, 'Thiếu nhân sự'),
(7, '2026-04-01', '2026-04-08', 8.0, 'ANNUAL', 'Du lịch gia đình', 'APPROVED', 1, 'Duyệt'),
(8, '2026-04-20', '2026-04-20', 1.0, 'SICK', 'Sốt cao', 'APPROVED', 1, 'Chấp thuận