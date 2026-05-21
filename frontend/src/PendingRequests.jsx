import React, { useState, useEffect } from 'react';
import apiClient from './services/api';
import RejectModal from './RejectModal';

const PendingRequests = ({ onActionSuccess }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/leave-requests/pending');
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Loi khi tai danh sach:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApprove = async (requestId) => {
    setActionLoading(requestId + '_approve');
    try {
      await apiClient.put(`/leave-requests/${requestId}/approve`);
      await fetchPendingRequests();
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      alert('Loi khi duyet don. Vui long thu lai.');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleRejectConfirm = async (requestId, note) => {
    setActionLoading(requestId + '_reject');
    try {
      await apiClient.put(`/leave-requests/${requestId}/reject`, { note: note });
      setIsModalOpen(false);
      setSelectedRequest(null);
      await fetchPendingRequests();
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      alert('Loi khi tu choi don. Vui long thu lai.');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getLeaveTypeLabel = (type) => {
    const map = {
      ANNUAL: 'Nghi phep nam',
      SICK: 'Nghi benh',
      UNPAID: 'Nghi khong luong',
      MATERNITY: 'Nghi thai san',
      OTHER: 'Khac',
    };
    return map[type] || type;
  };

  const getLeaveTypeColor = (type) => {
    const map = {
      ANNUAL: { bg: '#dbeafe', text: '#1d4ed8' },
      SICK: { bg: '#fee2e2', text: '#991b1b' },
      UNPAID: { bg: '#f3f4f6', text: '#374151' },
      MATERNITY: { bg: '#fce7f3', text: '#9d174d' },
      OTHER: { bg: '#ede9fe', text: '#5b21b6' },
    };
    return map[type] || { bg: '#f3f4f6', text: '#374151' };
  };

  if (loading) {
    return (
      <div style={styles.centerBox}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Dang tai danh sach don...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div style={styles.centerBox}>
        <div style={styles.emptyIcon}>🎉</div>
        <h3 style={styles.emptyTitle}>Khong co don nao can xu ly</h3>
        <p style={styles.emptyDesc}>Tat ca don nghi phep da duoc xu ly.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tableHeader}>
        <h2 style={styles.tableTitle}>Don cho phe duyet</h2>
        <span style={styles.badge}>{requests.length} don</span>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Nhan vien</th>
              <th style={styles.th}>Loai nghi</th>
              <th style={styles.th}>Tu ngay</th>
              <th style={styles.th}>Den ngay</th>
              <th style={styles.th}>So ngay</th>
              <th style={styles.th}>Ly do</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Hanh dong</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => {
              const typeColor = getLeaveTypeColor(req.leaveType);
              return (
                <tr
                  key={req.id}
                  style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                >
                  <td style={styles.td}>
                    <div style={styles.employeeCell}>
                      <div style={styles.miniAvatar}>
                        {(req.employeeName || req.employee?.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span style={styles.employeeName}>
                        {req.employeeName || req.employee?.fullName || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.typeBadge, backgroundColor: typeColor.bg, color: typeColor.text }}>
                      {getLeaveTypeLabel(req.leaveType)}
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(req.startDate)}</td>
                  <td style={styles.td}>{formatDate(req.endDate)}</td>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#1e293b' }}>
                    {req.daysCount || '-'} ngay
                  </td>
                  <td style={{ ...styles.td, maxWidth: '200px' }}>
                    <span style={styles.reasonText} title={req.reason}>
                      {req.reason || '-'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={styles.actionGroup}>
                      <button
                        style={styles.approveBtn}
                        disabled={actionLoading !== null}
                        onClick={() => handleApprove(req.id)}
                        title="Duyet don"
                      >
                        {actionLoading === req.id + '_approve' ? '...' : '✓ Duyet'}
                      </button>
                      <button
                        style={styles.rejectBtn}
                        disabled={actionLoading !== null}
                        onClick={() => handleRejectClick(req)}
                        title="Tu choi don"
                      >
                        {actionLoading === req.id + '_reject' ? '...' : '✕ Tu choi'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedRequest && (
        <RejectModal
          request={selectedRequest}
          onConfirm={handleRejectConfirm}
          onCancel={() => { setIsModalOpen(false); setSelectedRequest(null); }}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '0',
  },
  centerBox: {
    padding: '60px 20px',
    textAlign: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '14px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    color: '#1e293b',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px',
  },
  emptyDesc: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0,
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #f1f5f9',
  },
  tableTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  thead: {
    backgroundColor: '#f8fafc',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  trEven: {
    backgroundColor: '#ffffff',
    transition: 'background-color 0.15s',
  },
  trOdd: {
    backgroundColor: '#f8fafc',
    transition: 'background-color 0.15s',
  },
  td: {
    padding: '14px 16px',
    color: '#374151',
    borderBottom: '1px solid #f1f5f9',
    whiteSpace: 'nowrap',
  },
  employeeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  miniAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
    lineHeight: '28px',
    textAlign: 'center',
  },
  employeeName: {
    fontWeight: '500',
    color: '#1e293b',
  },
  typeBadge: {
    fontSize: '12px',
    fontWeight: '500',
    padding: '3px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
  },
  reasonText: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '200px',
    color: '#64748b',
  },
  actionGroup: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  approveBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#10b981',
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
  },
  rejectBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
  },
};

export default PendingRequests;
