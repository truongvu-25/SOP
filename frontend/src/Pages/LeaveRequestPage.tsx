import { useState, useCallback, useEffect } from "react";
import apiClient from '../services/api';
import type { CSSProperties, MouseEvent } from "react";

const pad = (n: number): string => String(n).padStart(2, "0");
const todayStr: string = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
})();

// Danh sách ngày lễ Việt Nam cố định (MM-DD)
const FIXED_HOLIDAYS: string[] = [
  "01-01", // Tết Dương lịch
  "04-30", // Giải phóng miền Nam
  "05-01", // Quốc tế Lao động
  "09-02", // Quốc khánh
];

// Ngày lễ Âm lịch 2026 (cần cập nhật hàng năm)
const LUNAR_HOLIDAYS_2026: string[] = [
  "2026-02-17", // 29 Tết
  "2026-02-18", // Mùng 1 Tết
  "2026-02-19", // Mùng 2 Tết
  "2026-02-20", // Mùng 3 Tết
  "2026-02-21", // Mùng 4 Tết
  "2026-02-22", // Mùng 5 Tết
  "2026-04-02", // Giỗ Tổ Hùng Vương (10/3 âm)
];

function isHoliday(dateStr: string): boolean {
  const mmdd = dateStr.slice(5); // "MM-DD"
  if (FIXED_HOLIDAYS.includes(mmdd)) return true;
  if (LUNAR_HOLIDAYS_2026.includes(dateStr)) return true;
  return false;
}

function countWorkdays(start: string, end: string): number {
  let count = 0;
  const cur = new Date(start);
  const e = new Date(end);
  while (cur <= e) {
    const day = cur.getDay();
    const dateStr = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
    if (day !== 0 && day !== 6 && !isHoliday(dateStr)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function formatDate(str: string): string {
  return new Date(str).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const LEAVE_TYPES: string[] = ["Phép năm", "Nghỉ ốm", "Nghỉ thai sản", "Nghỉ không lương", "Việc riêng"];

const LEAVE_TYPE_MAP: Record<string, string> = {
  "Phép năm": "ANNUAL",
  "Nghỉ ốm": "SICK",
  "Nghỉ thai sản": "OTHER",
  "Nghỉ không lương": "UNPAID",
  "Việc riêng": "OTHER",
};

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, background: "#0F6E56", color: "#fff",
      padding: "10px 18px", borderRadius: 10, fontSize: 13,
      display: "flex", alignItems: "center", gap: 8, zIndex: 999,
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-8px)",
      transition: "opacity .25s, transform .25s", pointerEvents: "none",
    }}>
      {message}
    </div>
  );
}

function BalanceBar({ balance, used }: { balance: number; used: number }) {
  const total = balance + used;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  return (
    <div style={{ background: "#F0FBF7", border: "0.5px solid #9FE1CB", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 2 }}>Số dư ngày phép hiện tại</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: "#085041", lineHeight: 1 }}>{balance}</span>
          <span style={{ fontSize: 13, color: "#5F5E5A" }}>ngày còn lại</span>
        </div>
        <div style={{ height: 5, background: "#D3D1C7", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "#1D9E75", borderRadius: 99 }} />
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: "#888780" }}>Đã dùng</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#3B3A38" }}>{used}</div>
        <div style={{ fontSize: 11, color: "#888780" }}>ngày</div>
      </div>
    </div>
  );
}

function TypeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 12, padding: "5px 12px", borderRadius: 99,
      border: active ? "1.5px solid #0F6E56" : "0.5px solid #B4B2A9",
      background: active ? "#E1F5EE" : "transparent",
      color: active ? "#085041" : "#5F5E5A",
      cursor: "pointer", fontWeight: active ? 500 : 400, whiteSpace: "nowrap",
    }}>
      {label}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: 13, color: "#5F5E5A", marginBottom: 5, fontWeight: 500 }}>{children}</label>;
}

const inputStyle: CSSProperties = {
  width: "100%", fontSize: 14, padding: "8px 10px", borderRadius: 8,
  border: "0.5px solid #B4B2A9", background: "#fff", color: "#1a1a18",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

function CalcBox({ days, balance }: { days: number | null; balance: number }) {
  let color = "#1a1a18", bg = "#F1EFE8";
  if (days !== null) {
    if (days > balance) { color = "#A32D2D"; bg = "#FCEBEB"; }
    else if (days / balance > 0.7) { color = "#BA7517"; bg = "#FAEEDA"; }
  }
  return (
    <div style={{ background: bg, borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
      <div>
        <div style={{ fontSize: 13, color: "#5F5E5A" }}>Tổng ngày nghỉ (trừ T7, CN, ngày lễ)</div>
        <div style={{ fontSize: 11, color: "#888780", marginTop: 1 }}>
          {days === null ? "Chọn ngày để tính" : days === 0 ? "Toàn ngày lễ / cuối tuần" : days > balance ? "Vượt quá số dư ngày phép" : "Ngày làm việc thực tế"}
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color, minWidth: 40, textAlign: "right" }}>
        {days === null ? "-" : days}
        {days !== null && <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 3 }}>ngày</span>}
      </div>
    </div>
  );
}

export default function LeaveRequestPage() {
  const [balance, setBalance] = useState<number>(12);
  const [used, setUsed] = useState<number>(0);
  const [leaveType, setLeaveType] = useState<string>(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [existingRequests, setExistingRequests] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastError, setToastError] = useState<boolean>(false);

  // Fetch số dư ngày phép
  useEffect(() => {
    apiClient.get('/leave-balance/me')
      .then(res => {
        setBalance(res.data.remainingDays);
        setUsed(res.data.usedDays);
      })
      .catch(err => console.error('Loi tai so du ngay phep:', err));
  }, []);

  // Fetch lịch sử đơn để check trùng ngày
  useEffect(() => {
    apiClient.get('/leave-requests')
      .then(res => setExistingRequests(res.data))
      .catch(err => console.error('Loi tai lich su don:', err));
  }, []);

  const dateError: boolean = Boolean(startDate && endDate && endDate < startDate);
  const days: number | null = startDate && endDate && !dateError ? countWorkdays(startDate, endDate) : null;
  const balanceError: boolean = days !== null && days > balance;
  const zeroError: boolean = days === 0;

  // Check trùng ngày với đơn PENDING hoặc APPROVED
  const overlapError: boolean = (() => {
    if (!startDate || !endDate) return false;
    return existingRequests.some(r => {
      if (r.status !== 'PENDING' && r.status !== 'APPROVED') return false;
      // Kiểm tra overlap: A.start <= B.end && A.end >= B.start
      return startDate <= r.endDate && endDate >= r.startDate;
    });
  })();

  const canSubmit: boolean = days !== null && days > 0 && !dateError && !balanceError && !overlapError;

  const showToast = useCallback((msg: string, isError = false): void => {
    setToastMsg(msg);
    setToastError(isError);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit || days === null) return;
    try {
      await apiClient.post('/leave-requests', {
        leaveType: LEAVE_TYPE_MAP[leaveType] || "OTHER",
        startDate,
        endDate,
        reason: reason.trim() || "Không có lý do",
      });
      // Refresh lại đơn và balance
      const [balanceRes, requestsRes] = await Promise.all([
        apiClient.get('/leave-balance/me'),
        apiClient.get('/leave-requests'),
      ]);
      setBalance(balanceRes.data.remainingDays);
      setUsed(balanceRes.data.usedDays);
      setExistingRequests(requestsRes.data);
      setStartDate("");
      setEndDate("");
      setReason("");
      showToast("Đơn xin nghỉ đã được gửi thành công!");
    } catch (err) {
      showToast("Lỗi khi gửi đơn. Vui lòng thử lại.", true);
      console.error(err);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#1a1a18", minHeight: "100vh", background: "#FAFAF8", padding: "28px 24px" }}>
      <Toast message={toastMsg} visible={toastVisible} />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Đơn xin nghỉ phép</h1>
        <p style={{ fontSize: 13, color: "#5F5E5A", margin: "4px 0 0" }}>SCRUM-23 - Hệ thống quản lý nghỉ phép nhân viên</p>
      </div>

      {/* Chỉ còn 1 cột — bỏ panel lịch sử bên phải theo yêu cầu PO */}
      <div style={{ maxWidth: 560 }}>
        <BalanceBar balance={balance} used={used} />
        <div style={{ background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, padding: "20px 20px 18px" }}>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel>Loại nghỉ</FieldLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {LEAVE_TYPES.map((t) => (
                <TypeChip key={t} label={t} active={leaveType === t} onClick={() => setLeaveType(t)} />
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
            <div>
              <FieldLabel>Ngày bắt đầu</FieldLabel>
              <input type="date" value={startDate} min={todayStr} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <FieldLabel>Ngày kết thúc</FieldLabel>
              <input type="date" value={endDate} min={startDate || todayStr} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {dateError && <p style={{ fontSize: 12, color: "#A32D2D", margin: "0 0 10px" }}>Ngày kết thúc không được trước ngày bắt đầu</p>}

          <div style={{ marginBottom: 4 }}>
            <CalcBox days={days} balance={balance} />
          </div>

          {zeroError && <p style={{ fontSize: 12, color: "#A32D2D", margin: "0 0 10px" }}>Khoảng thời gian này toàn ngày lễ hoặc cuối tuần, không tính ngày phép</p>}
          {balanceError && <p style={{ fontSize: 12, color: "#A32D2D", margin: "0 0 10px" }}>Số ngày xin nghỉ vượt quá số dư ({balance} ngày)</p>}
          {overlapError && <p style={{ fontSize: 12, color: "#A32D2D", margin: "0 0 10px" }}>Bạn đã có đơn nghỉ phép trong khoảng thời gian này</p>}

          <div style={{ marginBottom: 16 }}>
            <FieldLabel>Lý do nghỉ</FieldLabel>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do xin nghỉ phép..." rows={3}
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <button onClick={handleSubmit} disabled={!canSubmit} style={{
            width: "100%", padding: "10px 0", borderRadius: 8, border: "none",
            background: canSubmit ? "#0F6E56" : "#D3D1C7",
            color: canSubmit ? "#fff" : "#888780",
            fontSize: 14, fontWeight: 500, cursor: canSubmit ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit",
          }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (canSubmit) e.currentTarget.style.background = "#085041"; }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (canSubmit) e.currentTarget.style.background = "#0F6E56"; }}
          >
            Gửi đơn xin nghỉ
          </button>
        </div>
      </div>
    </div>
  );
}