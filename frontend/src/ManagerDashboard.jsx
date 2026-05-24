import React, { useState, useEffect } from 'react';
import PendingRequests from './PendingRequests';
import TeamBalanceTable from './TeamBalanceTable';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [refreshKey, setRefreshKey] = useState(0);
  const managerName = localStorage.getItem('fullName') || 'Manager';

  const handleActionSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.bgDecoration} />

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>A</span>
            <span style={styles.logoText}>Axon Active</span>
          </div>
        </div>
        <div style={styles.headerCenter}>
          <h1 style={styles.headerTitle}>Manager Portal</h1>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>{managerName.charAt(0).toUpperCase()}</div>
            <span style={styles.userName}>{managerName}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Dang xuat
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <StatsBar key={refreshKey} refreshKey={refreshKey} />

        <div style={styles.tabContainer}>
          <button
            style={activeTab === 'pending' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab('pending')}
          >
            <span style={styles.tabIcon}>📋</span>
            Don cho phe duyet
          </button>
          <button
            style={activeTab === 'balance' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab('balance')}
          >
            <span style={styles.tabIcon}>📊</span>
            So du ngay phep doi
          </button>
        </div>

        <div style={styles.tabContent}>
          {activeTab === 'pending' && (
            <PendingRequests onActionSuccess={handleActionSuccess} key={refreshKey} />
          )}
          {activeTab === 'balance' && (
            <TeamBalanceTable key={refreshKey} />
          )}
        </div>
      </main>
    </div>
  );
};

/* ---- Stats Bar component ---- */
const StatsBar = ({ refreshKey }) => {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const today = new Date().toLocaleDateString('en-CA');

    const fetchPending = fetch('/api/leave-requests/pending', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []);

    const fetchTeam = fetch('/api/leave-requests/team', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []);

    Promise.all([fetchPending, fetchTeam])
      .then(([pending, team]) => {
        const pendingCount = Array.isArray(pending) ? pending.length : 0;

        const approvedToday = Array.isArray(team)
          ? team.filter(r => {
              if (r.status !== 'APPROVED' || !r.updatedAt) return false;
              const localDate = new Date(r.updatedAt + 'Z').toLocaleDateString('en-CA');
              return localDate === today;
            }).length
          : 0;

        const rejectedToday = Array.isArray(team)
          ? team.filter(r => {
              if (r.status !== 'REJECTED' || !r.updatedAt) return false;
              const localDate = new Date(r.updatedAt + 'Z').toLocaleDateString('en-CA');
              return localDate === today;
            }).length
          : 0;

        setStats({ pending: pendingCount, approved: approvedToday, rejected: rejectedToday });
      })
      .catch(() => {});
  }, [refreshKey]);

  const cards = [
    { label: 'Don cho xu ly', value: stats.pending, color: '#f59e0b', icon: '⏳' },
    { label: 'Da duyet hom nay', value: stats.approved, color: '#10b981', icon: '✅' },
    { label: 'Da tu choi', value: stats.rejected, color: '#ef4444', icon: '❌' },
  ];

  return (
    <div style={styles.statsBar}>
      {cards.map((card, i) => (
        <div key={i} style={{ ...styles.statCard, borderTop: `3px solid ${card.color}` }}>
          <span style={styles.statIcon}>{card.icon}</span>
          <div>
            <div style={{ ...styles.statValue, color: card.color }}>{card.value}</div>
            <div style={styles.statLabel}>{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ---- Styles ---- */
const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecoration: {
    position: 'fixed',
    top: '-200px',
    right: '-200px',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '64px',
    backgroundColor: '#1e293b',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    position: 'relative',
    zIndex: 10,
  },
  headerLeft: { flex: 1 },
  headerCenter: { flex: 2, textAlign: 'center' },
  headerRight: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '16px',
    lineHeight: '32px',
    textAlign: 'center',
  },
  logoText: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: '14px',
    letterSpacing: '0.5px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    letterSpacing: '0.5px',
  },
  userBadge: { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    lineHeight: '32px',
    textAlign: 'center',
  },
  userName: { color: '#cbd5e1', fontSize: '14px', fontWeight: '500' },
  logoutBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid #475569',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 24px',
    position: 'relative',
    zIndex: 1,
  },
  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  statIcon: { fontSize: '28px' },
  statValue: { fontSize: '28px', fontWeight: '700', lineHeight: 1 },
  statLabel: { fontSize: '13px', color: '#64748b', marginTop: '4px' },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#3b82f6',
    borderBottom: '2px solid #3b82f6',
    backgroundColor: '#eff6ff',
  },
  tabIcon: { fontSize: '16px' },
  tabContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
};

export default ManagerDashboard;