import { useState, useCallback, useEffect } from "react";
import apiClient from '../services/api';
import type { CSSProperties, MouseEvent } from "react";

const pad = (n: number): string => String(n).padStart(2, "0");
const todayStr: string = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
})();

function countWorkdays(start: string, end: string): number {
  let count = 0;
  const cur = new Date(start);
  const e = new Date(end);
  while (cur <= e) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
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

const INITIAL_BALANCE = 12;
const INITIAL_USED = 3;

type LeaveStatus = "pending" | "approved" | "rejected";

interface LeaveEntry {
  id: number;
  type: string;
  start: string;
  end: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  submitted: string;
}

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
  const pct = Math.round((used / total) * 100);
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
        <div style={{ fontSize: 13, color: "#5F5E5A" }}>Tổng ngày nghỉ (trừ T7, CN)</div>
        <div style={{ fontSize: 11, color: "#888780", marginTop: 1 }}>
          {days === null ? "Chọn ngày để tính" : days > balance ? "Vượt quá số dư ngày phép" : "Ngày làm việc thực tế"}
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color, minWidth: 40, textAlign: "right" }}>
        {days === null ? "-" : days}
        {days !== null && <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 3 }}>ngày</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, { bg: string; color: string; label: string }> = {
    pending:  { bg: "#FAEEDA", color: "#854F0B", label: "PENDING" },
    approved: { bg: "#EAF3DE", color: "#3B6D11", label: "APPROVED" },
    rejected: { bg: "#FCEBEB", color: "#A32D2D", label: "REJECTED" },
  };
  const s = map[status] ?? map.pending;
  return <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>;
}

function LeaveHistoryItem({ item }: { item: LeaveEntry }) {
  return (
    <div style={{ padding: "12px 18px", borderBottom: "0.5px solid #E8E6E0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{item.type}</span>
        <StatusBadge status={item.status} />
      </div>
      <div style={{ fontSize: 12, color: "#5F5E5A" }}>{formatDate(item.start)} - {formatDate(item.end)}</div>
      <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>{item.days} ngày - Gửi {item.submitted}</div>
      {item.reason && <div style={{ fontSize: 12, color: "#5F5E5A", marginTop: 3 }}>{item.reason}</div>}
    </div>
  );
}

export default function LeaveRequestPage() {
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [used, setUsed] = useState<number>(INITIAL_USED);
  const [leaveType, setLeaveType] = useState<string>(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [history, setHistory] = useState<LeaveEntry[]>([]);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  useEffect(() => {
    apiClient.get('/leave-balance/me')
      .then(res => {
        setBalance(res.data.remainingDays);
        setUsed(res.data.usedDays);
      })
      .catch(err => console.error('Loi tai so du ngay phep:', err));
  }, []);

  const dateError: boolean = Boolean(startDate && endDate && endDate < startDate);
  const days: number | null = startDate && endDate && !dateError ? countWorkdays(startDate, endDate) : null;
  const balanceError: boolean = days !== null && days > balance;
  const canSubmit: boolean = days !== null && !dateError && !balanceError;

  const showToast = useCallback((msg: string): void => {
    setToastMsg(msg);
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
      const entry: LeaveEntry = {
        id: Date.now(),
        type: leaveType,
        start: startDate,
        end: endDate,
        days,
        reason: reason.trim() || "Không có lý do",
        status: "pending",
        submitted: new Date().toLocaleDateString("vi-VN"),
      };
      setHistory((prev) => [entry, ...prev]);
      setBalance((b) => b - days);
      setUsed((u) => u + days);
      setStartDate("");
      setEndDate("");
      setReason("");
      showToast("Đơn xin nghỉ đã được gửi thành công!");
    } catch (err) {
      showToast("Lỗi khi gửi đơn. Vui lòng thử lại.");
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: 20, maxWidth: 1000 }}>
        <div>
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

            {balanceError && <p style={{ fontSize: 12, color: "#A32D2D", margin: "0 0 10px" }}>Số ngày xin nghỉ vượt quá số dư ({balance} ngày)</p>}

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

        <div>
          <div style={{ background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "0.5px solid #E8E6E0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Lịch sử nghỉ phép</span>
              <span style={{ fontSize: 12, color: "#888780" }}>{history.length} đơn</span>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: "40px 18px", textAlign: "center", color: "#B4B2A9" }}>
                <p style={{ margin: 0, fontSize: 13 }}>Chưa có đơn xin nghỉ nào</p>
              </div>
            ) : (
              <div style={{ maxHeight: 480, overflowY: "auto" }}>
                {history.map((item) => <LeaveHistoryItem key={item.id} item={item} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
