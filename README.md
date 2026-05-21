# 🏢 SOP — Leave Management System
> Hệ thống quản lý nghỉ phép nhân viên — Axon Active Vietnam · 

---

## 📋 Mục lục
1. [Tổng quan](#tổng-quan)
2. [Tech Stack](#tech-stack)
3. [Cấu trúc project](#cấu-trúc-project)
4. [Cách chạy local](#cách-chạy-local)
5. [Tài khoản test](#tài-khoản-test)
6. [API Endpoints](#api-endpoints)
7. [Phân công team](#phân-công-team)
8. [Lỗi thường gặp](#lỗi-thường-gặp)

---

## Tổng quan

Hệ thống cho phép:
- **Employee** đăng nhập, tạo đơn xin nghỉ phép, xem lịch sử đơn
- **Manager** xem danh sách đơn PENDING, duyệt hoặc từ chối, xem số dư ngày phép của cả đội

```
Frontend (React + Vite)  →  nginx :3000
         ↓ proxy /api/
Backend (Spring Boot)    →  Tomcat :8080
         ↓ JPA/Hibernate
Database (PostgreSQL)    →  Supabase (cloud)
```

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Axios |
| Backend | Java 17, Spring Boot 3.x, Spring Security, JWT |
| Database | PostgreSQL (Supabase cloud) |
| DevOps | Docker, Docker Compose, nginx |
| API Docs | Swagger UI (`/swagger-ui/index.html`) |

---

## Cấu trúc project

```
SOP/
├── backend/
│   ├── src/main/java/com/axonactive/leave_management/
│   │   ├── auth/           # JWT, Login, Security filter
│   │   ├── config/         # SecurityConfig, SwaggerConfig
│   │   ├── leave/balance/  # LeaveBalance entity, service, controller
│   │   ├── leave_request/  # LeaveRequest entity, DTO, service, controller
│   │   ├── scheduler/      # AnnualLeaveAccumulationJob (cron 1/1)
│   │   └── user/           # User entity, UserRepository
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── Dashboard.tsx       # Trang chủ employee
│   │   │   ├── LeaveRequestPage.tsx # Tạo đơn xin nghỉ
│   │   │   ├── LeaveHistory.tsx    # Lịch sử đơn
│   │   │   ├── LoginPage.tsx       # Đăng nhập
│   │   │   └── Profile.tsx         # Hồ sơ cá nhân
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + JWT interceptor
│   │   ├── ManagerDashboard.jsx    # Portal Manager
│   │   ├── PendingRequests.jsx     # Danh sách đơn chờ duyệt
│   │   ├── RejectModal.jsx         # Modal từ chối đơn
│   │   ├── TeamBalanceTable.jsx    # Bảng số dư ngày phép đội
│   │   └── App.jsx                 # Routes
│   ├── nginx.conf
│   └── Dockerfile
├── migrations/                     # Flyway SQL V1-V4
└── docker-compose.yml
```

---

## Cách chạy local

### Yêu cầu
- Docker Desktop đã cài và đang chạy
- Git

### Bước 1 — Clone repo
```bash
git clone https://github.com/truongvu-25/SOP.git
cd SOP
git checkout main
```

### Bước 2 — Chạy với Docker Compose
```bash
docker-compose up
```

> Lần đầu sẽ mất 3–5 phút để build. Các lần sau nhanh hơn.

### Bước 3 — Truy cập
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui/index.html |

### Lệnh Docker hữu ích
```bash
# Rebuild toàn bộ (khi có thay đổi code)
docker-compose down
docker-compose build --no-cache
docker-compose up

# Chỉ rebuild frontend
docker-compose build --no-cache frontend
docker-compose up

# Chỉ rebuild backend
docker-compose build --no-cache backend
docker-compose up

# Xem log backend
docker logs sop_backend 2>&1 | tail -30
```

---

## Tài khoản test

| Email | Password | Role |
|-------|----------|------|
| `test@test.com` | `password` | EMPLOYEE |
| `emp1@company.com` | `password` | EMPLOYEE |
| `manager1@company.com` | `password` | MANAGER |

> **Lưu ý:** Dùng DB của Tài (`aws-1-ap-southeast-2`). Không dùng DB Dev 4 (`ap-southeast-1`) vì schema không tương thích.

---

## API Endpoints

### Auth
| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| POST | `/api/auth/login` | Đăng nhập, trả JWT token | Public |

### Leave Requests
| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| POST | `/api/leave-requests` | Tạo đơn xin nghỉ | EMPLOYEE |
| GET | `/api/leave-requests` | Xem đơn của mình | EMPLOYEE |
| PUT | `/api/leave-requests/{id}/cancel` | Hủy đơn | EMPLOYEE |
| GET | `/api/leave-requests/pending` | Xem đơn chờ duyệt | MANAGER |
| PUT | `/api/leave-requests/{id}/approve` | Duyệt đơn | MANAGER |
| PUT | `/api/leave-requests/{id}/reject` | Từ chối đơn | MANAGER |

### Leave Balance
| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| GET | `/api/leave-balance/me` | Xem số dư của mình | EMPLOYEE |
| GET | `/api/leave-balance/team` | Xem số dư cả đội | MANAGER |

### Leave Types (enum)
| Giá trị | Ý nghĩa |
|---------|---------|
| `ANNUAL` | Phép năm |
| `SICK` | Nghỉ ốm |
| `UNPAID` | Nghỉ không lương |
| `OTHER` | Khác (nghỉ thai sản, việc riêng...) |

---

## Database

**Đang dùng DB của Tài (Dev 1):**
```
Host:     aws-1-ap-southeast-2.pooler.supabase.com
Port:     5432
Database: postgres
Username: postgres.acrjojwjeuvqtonmklci
```

> ⚠️ Password DB được lưu trong `docker-compose.yml` — không commit password lên GitHub public repo.

**Lưu ý quan trọng:**
- Tất cả ID dùng **UUID** — không dùng Long/bigint
- Password hash dùng **BCrypt**
- BCrypt hash của `"password"` = `$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`

---

## Phân công team

| Dev | Tên | Nhiệm vụ |
|-----|-----|----------|
| D1 | Tài | Backend Auth & Security (JWT), Dev Lead |
| D2 | Huy | Backend Leave Request CRUD |
| D3 | Vinh | Backend Leave Balance & Accumulation |
| D4 | Khôi Nguyên | Database & DevOps |
| D5 | Thy | Frontend Employee Features |
| D6 | Nhi | Frontend Manager Features |

---

## Lỗi thường gặp

### 1. `Bad value for type long` — UUID mismatch
**Nguyên nhân:** Entity dùng `Long` thay vì `UUID`
**Fix:** Đổi tất cả entity sang `private UUID id`

### 2. `Encoded password does not look like BCrypt`
**Nguyên nhân:** Password hash bị vỡ khi update SQL qua PowerShell
**Fix:** Dùng file `.sql` thay vì command line

### 3. Double `/api/api/` trong URL
**Nguyên nhân:** `apiClient` đã có `baseURL = '/api'`, path không được thêm `/api/` prefix
```javascript
// ❌ Sai
apiClient.get('/api/leave-requests')
// ✅ Đúng
apiClient.get('/leave-requests')
```

### 4. Docker dùng image cũ
**Fix:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### 5. Port 8080 bị chiếm bởi process khác
**Triệu chứng:** API call 401 dù token đúng, data lưu vào DB khác
**Fix (Windows):**
```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### 6. Token hết hạn (401 Unauthorized)
**Nguyên nhân:** JWT token mặc định 24h, hết hạn sau khi Docker restart
**Fix:** Logout và login lại để lấy token mới

---

## Git Workflow

```bash
# Xem nhánh hiện tại
git branch

# Tạo nhánh mới từ main
git checkout main
git pull origin main
git checkout -b feature/ten-tinh-nang

# Commit và push
git add .
git commit -m "feat: mô tả thay đổi"
git push origin feature/ten-tinh-nang

# Tạo PR trên GitHub: feature → main
```

---

*Last updated: 21/05/2026 — SCRUM-23 · Axon Active Vietnam*
