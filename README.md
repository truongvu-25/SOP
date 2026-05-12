# 🏖️ Hệ Thống Quản Lý Nghỉ Phép Nhân Viên

Ứng dụng web full-stack hỗ trợ quản lý đơn xin nghỉ phép, xây dựng bằng **Java Spring Boot** và **Cơ sở dữ liệu quan hệ (PostgreSQL)**. Phát triển trong khuôn khổ môn học **Information Technology Enterprise** theo phương pháp Agile/Scrum, với yêu cầu thực tế từ [Axon Active Vietnam](https://www.axonactive.com).

---

## 📋 Mục Lục

- [Tầm nhìn dự án](#tầm-nhìn-dự-án)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Tính năng](#tính-năng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [API Endpoints](#api-endpoints)
- [Cơ sở dữ liệu](#cơ-sở-dữ-liệu)
- [Quy trình làm việc](#quy-trình-làm-việc)
- [Thành viên nhóm](#thành-viên-nhóm)

---

## 🎯 Tầm Nhìn Dự Án

Xây dựng một công cụ quản lý ngày nghỉ phép **minh bạch, tự động và đúng luật lao động**, giúp nhân viên chủ động theo dõi số ngày phép và giúp quản lý xét duyệt đơn từ một cách hiệu quả.

**Quy tắc nghiệp vụ cốt lõi:**
- Mỗi nhân viên có mặc định **12 ngày phép/năm** theo quy định pháp luật
- Ngày phép dư cuối năm được **cộng dồn (accumulate)** sang năm tiếp theo (tối đa 6 ngày)
- Manager có thể **duyệt hoặc từ chối** đơn phép kèm ghi chú lý do
- **Job tự động** chạy vào 00:00 ngày 1/1 hàng năm để xử lý cộng dồn phép

---

## 🛠️ Công Nghệ Sử Dụng

| Tầng | Công nghệ |
|---|---|
| Backend | Java 17+, Spring Boot 3.x |
| Bảo mật | Spring Security, JWT |
| Cơ sở dữ liệu | Supabase |
| Migration DB | Flyway |
| Build tool | Maven |
| Frontend | React.js / Angular |
| Test API | Postman |
| Container hóa | Docker, Docker Compose |
| Quản lý mã nguồn | Git, GitHub |
| Quản lý dự án | JIRA (Scrum board) |

---

## ✨ Tính Năng

### Nhân viên (Employee)
- 🔐 Đăng nhập bằng email/password, xác thực qua JWT
- 📅 Gửi đơn xin nghỉ phép (ngày bắt đầu, kết thúc, loại phép, lý do)
- 👀 Xem số ngày phép còn lại (tổng, đã dùng, còn lại, cộng dồn)
- 📋 Xem lịch sử toàn bộ đơn phép theo trạng thái
- ❌ Hủy đơn đang chờ duyệt (PENDING)

### Quản lý (Manager)
- ✅ Duyệt hoặc từ chối đơn phép (bắt buộc ghi lý do khi từ chối)
- 👥 Xem số ngày phép còn lại của từng nhân viên trong team
- 📊 Xem danh sách tất cả đơn đang chờ duyệt
- 🗓️ Xem lịch nghỉ của team theo tháng

### Hệ thống (Tự động)
- 🔄 Job cộng dồn phép cuối năm (chạy mỗi ngày 1/1 lúc 00:00)
- 📧 Gửi email thông báo khi gửi đơn, duyệt đơn, từ chối đơn
- 📝 Ghi đầy đủ audit log cho mọi sự kiện cộng dồn phép

---

## 📁 Cấu Trúc Dự Án

```
leave-management-system/
├── backend/
│   ├── src/
│   │   ├── main/java/com/axonactive/leave/
│   │   │   ├── auth/            # Cấu hình JWT, Spring Security
│   │   │   ├── user/            # Entity, Repository, Service nhân viên
│   │   │   ├── leave/
│   │   │   │   ├── request/     # CRUD đơn phép, state machine
│   │   │   │   └── balance/     # Số dư phép, logic cộng dồn
│   │   │   └── scheduler/       # Job tự động cuối năm
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/    # Flyway SQL scripts
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/            # Gọi API backend (axios)
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu cầu hệ thống

Đảm bảo đã cài đặt đầy đủ các công cụ sau:

| Công cụ | Phiên bản tối thiểu | Kiểm tra |
|---|---|---|
| Java (JDK) | 17+ | `java -version` |
| Node.js | 18+ | `node -v` |
| PostgreSQL | 16+ | `psql --version` |
| Maven | 3.8+ | `mvn -version` |
| Git | Bất kỳ | `git --version` |
| Docker *(tùy chọn)* | 20+ | `docker -v` |

---

### Cách 1 — Chạy bằng Docker Compose *(Khuyến nghị)*

```bash
# 1. Clone repository về máy
git clone https://github.com/your-org/leave-management-system.git
cd leave-management-system

# 2. Khởi động toàn bộ hệ thống
docker-compose up --build
```

Sau khi khởi động xong, truy cập:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080`
- **pgAdmin (quản lý DB):** `http://localhost:5050`

---

### Cách 2 — Chạy thủ công từng phần

**Bước 1 — Tạo database**

```bash
psql -U postgres -c "CREATE DATABASE leave_management;"
```

**Bước 2 — Cấu hình môi trường backend**

Tạo file `backend/src/main/resources/application-local.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/leave_management
    username: postgres
    password: your_password
  jpa:
    hibernate:
      ddl-auto: validate

app:
  jwt:
    secret: your-secret-key-min-256-bits
    expiration: 28800000  # 8 tiếng (tính bằng ms)
```

> ⚠️ **Lưu ý bảo mật:** Không commit file `application-local.yml` lên Git. File này đã được thêm vào `.gitignore`.

**Bước 3 — Chạy backend**

```bash
cd backend
mvn spring-boot:run -Dspring.profiles.active=local
```

Backend sẽ chạy tại `http://localhost:8080`.  
Flyway sẽ tự động tạo các bảng theo schema định nghĩa.

**Bước 4 — Chạy frontend**

```bash
cd frontend
npm install
npm start
```

Frontend sẽ chạy tại `http://localhost:3000`.

---

## 🔌 API Endpoints

### Xác thực
| Method | Endpoint | Mô tả | Cần Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Đăng nhập, trả về JWT token | ❌ |
| POST | `/api/auth/logout` | Vô hiệu hóa token | ✅ |

### Đơn nghỉ phép
| Method | Endpoint | Mô tả | Role |
|---|---|---|---|
| POST | `/api/leave-requests` | Gửi đơn xin nghỉ phép | Employee |
| GET | `/api/leave-requests` | Xem danh sách đơn của bản thân | Employee |
| GET | `/api/leave-requests/{id}` | Xem chi tiết một đơn | Tất cả |
| PUT | `/api/leave-requests/{id}/cancel` | Hủy đơn đang PENDING | Employee |
| PUT | `/api/leave-requests/{id}/approve` | Duyệt đơn | Manager |
| PUT | `/api/leave-requests/{id}/reject` | Từ chối đơn (bắt buộc có ghi chú) | Manager |
| GET | `/api/leave-requests/pending` | Danh sách đơn chờ duyệt | Manager |
| GET | `/api/leave-requests/team` | Toàn bộ đơn của team | Manager |

### Số dư ngày phép
| Method | Endpoint | Mô tả | Role |
|---|---|---|---|
| GET | `/api/leave-balance/me` | Xem số ngày phép của bản thân | Employee |
| GET | `/api/leave-balance/team` | Xem số dư phép toàn team | Manager |
| GET | `/api/leave-balance/{userId}` | Xem số dư phép một nhân viên | Manager |

---

## 🗄️ Cơ Sở Dữ Liệu

```
users                          leave_balances
├── id (UUID PK)               ├── id (UUID PK)
├── email (UNIQUE)             ├── user_id (FK → users)
├── password_hash              ├── year
├── full_name                  ├── total_days (mặc định: 12.0)
├── role (EMPLOYEE|MANAGER)    ├── used_days
└── manager_id (FK → users)    └── carried_over_days

leave_requests                 leave_accumulation_logs
├── id (UUID PK)               ├── id (UUID PK)
├── employee_id (FK → users)   ├── user_id (FK → users)
├── start_date / end_date      ├── from_year / to_year
├── days_count                 ├── days_carried
├── leave_type                 └── days_expired
├── reason
├── status (PENDING|APPROVED
│          |REJECTED|CANCELLED)
├── reviewed_by (FK → users)
└── review_note
```

**Công thức tính số ngày còn lại:**
```
remaining = total_days + carried_over_days - used_days
```

---

## 🔄 Quy Trình Làm Việc (Git Flow)

```
main              ← Production, chỉ merge khi pass CI/CD
└── develop       ← Nhánh tích hợp chính
    ├── feature/US-01-auth-jwt
    ├── feature/US-06-leave-request
    ├── feature/US-03-leave-balance
    ├── feature/DB-schema-migration
    ├── feature/FE-employee-dashboard
    ├── feature/FE-manager-dashboard
    └── feature/testing-integration
```

**Quy tắc bắt buộc:**
- Mỗi Dev chỉ làm việc trên branch của mình
- Tạo Pull Request vào `develop`, cần ít nhất **1 người review** trước khi merge
- Commit message theo format: `type: mô tả ngắn` — ví dụ: `feat: add leave request API`, `fix: correct balance calculation`
- Không commit trực tiếp lên `main` hoặc `develop`

---

## 👥 Thành Viên Nhóm

| Vai trò | Họ tên | Trách nhiệm chính |
|---|---|---|
| Product Owner | Vũ | Quản lý backlog, làm việc với Axon Active |
| Scrum Master | Đào | Điều phối Scrum, gỡ blockers |
| Dev 1 | Tài | Backend — Auth & Spring Security |
| Dev 2 | Huy | Backend — Leave Request CRUD |
| Dev 3 | Vinh | Backend — Leave Balance & Accumulation |
| Dev 4 | Nguyên | Database, Flyway, Docker |
| Dev 5 | Thy | Frontend — Employee features |
| Dev 6 | Nhi | Frontend — Manager features |
| Dev 7 | Duy | Testing & Integration |

---

## 📄 Giấy Phép

Dự án được phát triển phục vụ mục đích học tập trong môn **Information Technology Enterprise**.  
Yêu cầu nghiệp vụ được cung cấp bởi **Axon Active Vietnam Co., Ltd.**

---

> Được xây dựng bằng ☕ Java, 🌱 Spring Boot và phương pháp Scrum.
