import React, { useState, useEffect } from 'react';
import apiClient from './services/api';

const TeamBalanceTable = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTeamBalance = async () => {
      try {
        setLoading(true);
        // Endpoint: GET /api/leave-balances/team (hoac tuong duong)
        const response = await apiClient.get('/leave-balance/team');
        const data = Array.isArray(response.data) ? response.data : [];
        setMembers(data);
      } catch (err) {
        console.error('Loi khi tai so du ngay phep:', err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamBalance();
  }, []);

  const filtered = members.filter(m =>
    (m.fullName || m.employeeName || '').toLowerCase().includes(search.toLowerCase())
  );

  const getUsageColor = (used, total) => {
    if (!total) return '#94a3b8';
    const pct = (used / total) * 100;
    if (pct >= 80) return '#ef4444';
    if (pct >= 50) return '#f59e0b';
    return '#10b981';
  };

  if (loading) {
    return (
      <div style={styles.centerBox}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Dang tai so du ngay phep...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div style={styles.centerBox}>
        <div style={styles.emptyIcon}>📊</div>
        <h3 style={styles.emptyTitle}>Chua co du lieu</h3>
        <p style={styles.emptyDesc}>Khong tim thay thong tin so du ngay phep cua doi.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tableHeader}>
        <div style={styles.headerLeft}>
          <h2 style={styles.tableTitle}>So du ngay phep - Doi ngu</h2>
          <span style={styles.badge}>{members.length} thanh vien</span>
        </div>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="Tim kiem nhan vien..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Nhan vien</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Tong ngay phep</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Da su dung</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Con lai</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Chuyen ky</th>
              <th style={{ ...styles.th, minWidth: '160px' }}>Ti le su dung</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, idx) => {
              const name = m.fullName || m.employeeName || 'N/A';
              const total = m.totalDays ?? 0;
              const used = m.usedDays ?? 0;
              const remaining = m.remainingDays ?? (total - used);
              const carried = m.carriedOverDays ?? 0;
              const pct = total > 0 ? Math.round((used / total) * 100) : 0;
              const barColor = getUsageColor(used, total);

              return (
                <tr
                  key={m.id || idx}
                  style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                >
                  <td style={styles.td}>
                    <div style={styles.employeeCell}>
                      <div style={styles.miniAvatar}>{name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={styles.employeeName}>{name}</div>
                        {m.email && <div style={styles.employeeEmail}>{m.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center', fontWeight: '600' }}>
                    {total}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{ color: used > 0 ? '#f59e0b' : '#94a3b8', fontWeight: '600' }}>
                      {used}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{
                      color: remaining <= 3 ? '#ef4444' : '#10b981',
                      fontWeight: '700',
                      fontSize: '15px',
                    }}>
                      {remaining}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center', color: '#64748b' }}>
                    {carried > 0 ? `+${carried}` : carried}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.progressWrapper}>
                      <div style={styles.progressBar}>
                        <div style={{
                          ...styles.progressFill,
                          width: `${pct}%`,
                          backgroundColor: barColor,
                        }} />
                      </div>
                      <span style={{ ...styles.progressPct, color: barColor }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={styles.noResults}>
            Khong tim thay ket qua cho "{search}"
          </div>
        )}
      </div>
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
    justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
  searchInput: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    color: '#1e293b',
    outline: 'none',
    width: '220px',
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
  },
  employeeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  miniAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
    lineHeight: '32px',
    textAlign: 'center',
  },
  employeeName: {
    fontWeight: '500',
    color: '#1e293b',
    fontSize: '14px',
  },
  employeeEmail: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '1px',
  },
  progressWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  progressBar: {
    flex: 1,
    height: '8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    overflow: 'hidden',
    minWidth: '80px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressPct: {
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '34px',
  },
  noResults: {
    padding: '32px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px',
  },
};

export default TeamBalanceTable;
