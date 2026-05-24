# 🏢 SOP — Leave Management System
> Hệ thống quản lý nghỉ phép nhân viên — Axon Active Vietnam

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
- **Employee** đăng nhập, tạo đơn xin nghỉ phép, xem lịch sử đơn, nhận thông báo in-app khi đơn được duyệt/từ chối
- **Manager** xem danh sách đơn PENDING, duyệt hoặc từ chối, xem số dư ngày phép của cả đội, theo dõi stats hôm nay

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
│   │   │   ├── Dashboard.tsx        # Trang chủ employee
│   │   │   ├── LeaveRequestPage.tsx # Tạo đơn (check ngày lễ, check trùng ngày)
│   │   │   ├── LeaveHistory.tsx     # Lịch sử đơn + in-app notification
│   │   │   ├── LoginPage.tsx        # Đăng nhập
│   │   │   └── Profile.tsx          # Hồ sơ cá nhân
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + JWT interceptor
│   │   ├── ManagerDashboard.jsx     # Portal Manager + stats hôm nay
│   │   ├── PendingRequests.jsx      # Danh sách đơn chờ duyệt
│   │   ├── RejectModal.jsx          # Modal từ chối đơn
│   │   ├── TeamBalanceTable.jsx     # Bảng số dư ngày phép đội
│   │   └── App.jsx                  # Routes
│   ├── nginx.conf
│   └── Dockerfile
├── migrations/                      # Flyway SQL V1-V4
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

### Manager
| Email | Password |
|-------|----------|
| `manager1@company.com` | `password` |
| `manager2@company.com` | `password` |

### Employee (thuộc Manager One)
| Email | Password |
|-------|----------|
| `emp1@company.com` | `password` |
| `nguyen.van.an@company.com` | `password` |
| `tran.thi.bich@company.com` | `password` |
| `le.hoang.minh@company.com` | `password` |
| `pham.ngoc.linh@company.com` | `password` |
| `hoang.duc.tuan@company.com` | `password` |
| `vo.thi.thu@company.com` | `password` |
| `test@test.com` | `password` |

### Employee (thuộc Manager Two)
| Email | Password |
|-------|----------|
| `nguyen.thi.mai@company.com` | `password` |
| `tran.quoc.bao@company.com` | `password` |
| `ly.thi.kim.anh@company.com` | `password` |
| `phan.van.duc@company.com` | `password` |
| `do.thi.ngoc@company.com` | `password` |
| `truong.minh.hieu@company.com` | `password` |
| `cao.thi.lan@company.com` | `password` |

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
| PUT | `/api/leave-requests/{id}/cancel` | Hủy đơn PENDING | EMPLOYEE |
| GET | `/api/leave-requests/pending` | Xem đơn chờ duyệt của team | MANAGER |
| GET | `/api/leave-requests/team` | Xem tất cả đơn của team | MANAGER |
| PUT | `/api/leave-requests/{id}/approve` | Duyệt đơn | MANAGER |
| PUT | `/api/leave-requests/{id}/reject` | Từ chối đơn (bắt buộc có note) | MANAGER |

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

## Tính năng đã hoàn thành

### Employee
- ✅ Đăng nhập bằng email công ty
- ✅ Xem số dư ngày phép hiện tại (12 ngày/năm)
- ✅ Tạo đơn xin nghỉ với các loại: Phép năm, Nghỉ ốm, Nghỉ thai sản, Nghỉ không lương, Việc riêng
- ✅ Tự động tính ngày làm việc thực tế (trừ T7, CN, ngày lễ Việt Nam)
- ✅ Validation: không cho chọn ngày kết thúc trước ngày bắt đầu
- ✅ Validation: không cho gửi nếu vượt số dư ngày phép
- ✅ Validation: không cho gửi nếu trùng ngày với đơn PENDING/APPROVED đã có
- ✅ Xem lịch sử đơn với filter theo trạng thái
- ✅ In-app notification khi đơn được duyệt hoặc từ chối

### Manager
- ✅ Xem danh sách đơn PENDING của team
- ✅ Duyệt đơn → balance tự động bị trừ
- ✅ Từ chối đơn với lý do (bắt buộc)
- ✅ Stats realtime: số đơn chờ xử lý, đã duyệt hôm nay, đã từ chối hôm nay
- ✅ Xem số dư ngày phép của toàn đội
- ✅ Tìm kiếm nhân viên theo tên

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
- Nếu user mới bị lỗi login, chạy: `UPDATE users SET is_active = true WHERE is_active IS NULL;`

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
| D7 | Duy | Tester |

---

## Lỗi thường gặp

### 1. Token hết hạn — 401 sau Docker restart
**Nguyên nhân:** JWT token 24h, hết hạn sau khi Docker restart
**Fix:** Logout → login lại để lấy token mới

### 2. Port 8080 bị chiếm bởi process khác
**Triệu chứng:** API call 401 dù token đúng, data lưu vào DB khác
**Fix (Windows):**
```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### 3. `is_active = NULL` — lỗi khi query team
**Triệu chứng:** `/api/leave-balance/team` trả lỗi
**Fix:**
```sql
UPDATE users SET is_active = true WHERE is_active IS NULL;
```

### 4. Double `/api/api/` trong URL
**Nguyên nhân:** `apiClient` đã có `baseURL = '/api'`
```javascript
// ❌ Sai
apiClient.get('/api/leave-requests')
// ✅ Đúng
apiClient.get('/leave-requests')
```

### 5. Docker dùng image cũ sau khi sửa code
**Fix:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### 6. Password hash bị vỡ khi update qua PowerShell
**Nguyên nhân:** PowerShell escape ký tự `$` làm hỏng BCrypt hash
**Fix:** Dùng biến PowerShell:
```powershell
$hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
psql ... -c "UPDATE users SET password_hash = '$hash' WHERE role = 'EMPLOYEE';"
```

---

## Git Workflow

```bash
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

*Last updated: 25/05/2026 — Tai Huynh - Dev1
