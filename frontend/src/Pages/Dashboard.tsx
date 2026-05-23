import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from '../services/api';
import './Dashboard.css';

export type LeaveStatus = "pending" | "approved" | "rejected";

export interface HistoryItem {
  id: number;
  type: string;
  start: string;
  end: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  submitted: string;
}

const MOCK_BALANCE = 12;
const MOCK_USED = 3;

const MOCK_HISTORY: HistoryItem[] = [
  { id: 1, type: "Phép năm", start: "2026-05-12", end: "2026-05-13", days: 2, reason: "", status: "pending", submitted: "10/05/2026" },
  { id: 2, type: "Phép năm", start: "2026-04-28", end: "2026-04-30", days: 3, reason: "", status: "approved", submitted: "25/04/2026" },
  { id: 3, type: "Nghỉ ốm", start: "2026-03-10", end: "2026-03-10", days: 1, reason: "", status: "approved", submitted: "10/03/2026" },
  { id: 4, type: "Phép năm", start: "2026-05-20", end: "2026-05-21", days: 2, reason: "", status: "pending", submitted: "15/05/2026" },
];

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function getTodayLabel() {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, { bg: string; color: string; label: string }> = {
    pending:  { bg: "#FAEEDA", color: "#BA7517", label: "PENDING" },
    approved: { bg: "#EAF3DE", color: "#3B6D11", label: "APPROVED" },
    rejected: { bg: "#FCEBEB", color: "#A32D2D", label: "REJECTED" },
  };
  const s = map[status];
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function StatCard({ label, value, sub, icon, valueColor }: { label: string; value: number; sub: string; icon: string; valueColor?: string }) {
  return (
    <div className="db-statCard">
      <div style={{ fontSize: 12, color: '#8fa3b0', display: 'flex', gap: 8, alignItems: 'center' }}>
        <i className={`ti ${icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: valueColor || '#1a2e44', marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#888780', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function BalanceBar({ balance, used, total }: { balance: number; used: number; total: number }) {
  const pct = Math.round((used / total) * 100);
  const isWarn = balance / total < 0.3;
  return (
    <div className="db-balanceWrap">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: '#5F5E5A' }}>Tình trạng ngày phép năm 2026</div>
        <div style={{ fontSize: 12, color: '#6b808f' }}>{used}/{total} đã dùng</div>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: '#E8EAF0', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: isWarn ? '#EF9F27' : '#1D9E75' }} />
      </div>
    </div>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderBottom: '0.5px solid #E8E6E0' }}>
      <div style={{ width: 44, height: 44, borderRadius: 8, background: '#F1EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="ti ti-calendar" style={{ fontSize: 16, color: '#5F5E5A' }} aria-hidden="true" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.type}</div>
        <div style={{ fontSize: 12, color: '#888780' }}>{formatDate(item.start)} → {formatDate(item.end)} · {item.days} ngày</div>
      </div>
      <StatusBadge status={item.status} />
    </div>
  );
}

function QuickButton({ label, sub, iconBg, iconColor, icon, onClick }: { label: string; sub: string; iconBg: string; iconColor: string; icon: string; onClick: () => void }) {
  return (
    <button style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, borderRadius: 8, border: '1px solid #E8EAF0', background: '#fff', cursor: 'pointer' }} onClick={onClick}>
      <div style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg }}>
        <i className={`ti ${icon}`} style={{ fontSize: 16, color: iconColor }} aria-hidden="true" />
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#888780' }}>{sub}</div>
      </div>
      <i className="ti ti-chevron-right" style={{ marginLeft: 'auto', color: '#888780' }} aria-hidden="true" />
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem('fullName') || 'User';
  const role = localStorage.getItem('role') || 'EMPLOYEE';

  const [balance, setBalance] = useState(MOCK_BALANCE);
  const [used, setUsed] = useState(MOCK_USED);
  const total = balance + used;

  useEffect(() => {
    apiClient.get('/leave-balance/me')
      .then(res => {
        setBalance(res.data.remainingDays);
        setUsed(res.data.usedDays);
      })
      .catch(() => {});
  }, []);

  const recentHistory = MOCK_HISTORY.slice(0, 4);
  const pendingCount = MOCK_HISTORY.filter((i) => i.status === "pending").length;
  const approvedCount = MOCK_HISTORY.filter((i) => i.status === "approved").length;

  return (
    <div className="db-page">
      <div className="db-topBar">
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Xin chào, {fullName}</div>
          <div style={{ fontSize: 13, color: '#888780' }}>{role === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="db-dateChip"><i className="ti ti-calendar" style={{ fontSize: 13 }} /> {getTodayLabel()}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: '#0F6E56', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>New</button>
            <button style={{ background: 'transparent', border: '1px solid #D3D1C7', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Export</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        <StatCard label="Ngày phép còn lại" value={balance} sub={`/ ${total} ngày tổng`} icon="ti-calendar-event" valueColor="#0F6E56" />
        <StatCard label="Đã sử dụng" value={used} sub="ngày trong năm" icon="ti-calendar-minus" />
        <StatCard label="Đang chờ duyệt" value={pendingCount} sub="đơn pending" icon="ti-clock-hour-4" valueColor="#BA7517" />
        <StatCard label="Đã được duyệt" value={approvedCount} sub="đơn approved" icon="ti-circle-check" valueColor="#3B6D11" />
      </div>

      <BalanceBar balance={balance} used={used} total={total} />

      <div className="db-twoCol" style={{ marginTop: 16 }}>
        <div className="db-card">
          <div className="db-cardHeader">
            <span style={{ fontSize: 14, fontWeight: 700 }}><i className="ti ti-clock-hour-4" style={{ marginRight: 8 }} /> Đơn gần đây</span>
            <span style={{ fontSize: 13, color: '#6b808f', cursor: 'pointer' }} onClick={() => navigate('/leave-history')}>Xem tất cả →</span>
          </div>
          <div>
            {recentHistory.length === 0 ? <div className="db-empty">Chưa có đơn xin nghỉ nào</div> : recentHistory.map((item) => <HistoryRow key={item.id} item={item} />)}
          </div>
        </div>

        <div className="db-card">
          <div className="db-cardHeader">
            <span style={{ fontSize: 14, fontWeight: 700 }}><i className="ti ti-bolt" style={{ marginRight: 8 }} /> Thao tác nhanh</span>
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <QuickButton label="Tạo đơn xin nghỉ" sub="Điền form và gửi manager" icon="ti-file-plus" iconBg="#E1F5EE" iconColor="#0F6E56" onClick={() => navigate('/leave-request')} />
            <QuickButton label="Lịch sử nghỉ phép" sub="Xem tất cả đơn đã gửi" icon="ti-clock-hour-4" iconBg="#E6F1FB" iconColor="#185FA5" onClick={() => navigate('/leave-history')} />
            <QuickButton label="Hồ sơ cá nhân" sub="Thông tin tài khoản" icon="ti-user-circle" iconBg="#EEEDFE" iconColor="#534AB7" onClick={() => navigate('/profile')} />
          </div>
        </div>
      </div>
    </div>
  );
}
