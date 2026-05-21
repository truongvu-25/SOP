import { useState, useEffect } from "react";
import apiClient from '../services/api';
import { useNavigate } from "react-router-dom";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  reviewNote: string;
  createdAt: string;
}

function formatDate(str: string): string {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getLeaveTypeLabel(type: string): string {
  const map: Record<string, string> = {
    ANNUAL: "Phép năm",
    SICK: "Nghỉ ốm",
    MATERNITY: "Nghỉ thai sản",
    UNPAID: "Nghỉ không lương",
    OTHER: "Khác",
  };
  return map[type] || type;
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, { bg: string; color: string; label: string }> = {
    PENDING:   { bg: "#FAEEDA", color: "#854F0B", label: "Chờ duyệt" },
    APPROVED:  { bg: "#EAF3DE", color: "#3B6D11", label: "Đã duyệt" },
    REJECTED:  { bg: "#FCEBEB", color: "#A32D2D", label: "Từ chối" },
    CANCELLED: { bg: "#F3F4F6", color: "#6B7280", label: "Đã hủy" },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span style={{
      fontSize: 11, padding: "3px 10px", borderRadius: 99,
      background: s.bg, color: s.color, fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

function getTypeColor(type: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    ANNUAL:   { bg: "#FAEEDA", color: "#BA7517" },
    SICK:     { bg: "#E6F1FB", color: "#185FA5" },
    MATERNITY:{ bg: "#FBEAF0", color: "#993556" },
    UNPAID:   { bg: "#F1EFE8", color: "#5F5E5A" },
    OTHER:    { bg: "#EEEDFE", color: "#534AB7" },
  };
  return map[type] || { bg: "#F1EFE8", color: "#5F5E5A" };
}

export default function LeaveHistory() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    apiClient.get('/leave-requests')
      .then(res => {
        setRequests(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filters = [
    { value: "ALL", label: "Tất cả" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "REJECTED", label: "Từ chối" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  const filtered = filter === "ALL" ? requests : requests.filter(r => r.status === filter);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#1a1a18", minHeight: "100vh", background: "#FAFAF8", padding: "28px 24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Lịch sử nghỉ phép</h1>
          <p style={{ fontSize: 13, color: "#5F5E5A", margin: "4px 0 0" }}>Tất cả đơn xin nghỉ của bạn</p>
        </div>
        <button
          onClick={() => navigate("/leave-request")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: "#0F6E56", color: "#fff", fontSize: 13,
            fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          + Tạo đơn mới
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 13,
              border: filter === f.value ? "1.5px solid #0F6E56" : "0.5px solid #D3D1C7",
              background: filter === f.value ? "#E1F5EE" : "#fff",
              color: filter === f.value ? "#085041" : "#5F5E5A",
              cursor: "pointer", fontWeight: filter === f.value ? 500 : 400,
              fontFamily: "inherit",
            }}
          >
            {f.label}
            {f.value !== "ALL" && (
              <span style={{ marginLeft: 6, fontSize: 11, color: filter === f.value ? "#085041" : "#888780" }}>
                ({requests.filter(r => r.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888780" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: "3px solid #0F6E56", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
          Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ color: "#888780", fontSize: 14, margin: 0 }}>
            {filter === "ALL" ? "Chưa có đơn xin nghỉ nào" : `Không có đơn nào ở trạng thái này`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 800 }}>
          {filtered.map(req => {
            const typeColor = getTypeColor(req.leaveType);
            return (
              <div key={req.id} style={{
                background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12,
                padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
              }}>
                {/* Type icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: typeColor.bg, color: typeColor.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  {req.leaveType === "ANNUAL" ? "☀️" : req.leaveType === "SICK" ? "🏥" : req.leaveType === "UNPAID" ? "📅" : "📝"}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{getLeaveTypeLabel(req.leaveType)}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <div style={{ fontSize: 12, color: "#5F5E5A" }}>
                    📅 {formatDate(req.startDate)} → {formatDate(req.endDate)} · {req.daysCount} ngày làm việc
                  </div>
                  {req.reason && (
                    <div style={{ fontSize: 12, color: "#888780", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      💬 {req.reason}
                    </div>
                  )}
                  {req.reviewNote && (
                    <div style={{ fontSize: 12, color: "#A32D2D", marginTop: 2 }}>
                      ℹ️ Ghi chú: {req.reviewNote}
                    </div>
                  )}
                </div>

                {/* Date submitted */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: "#888780" }}>Gửi lúc</div>
                  <div style={{ fontSize: 12, color: "#5F5E5A", fontWeight: 500 }}>{formatDate(req.createdAt)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
