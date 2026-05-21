import React, { useState } from 'react';

const RejectModal = ({ request, onConfirm, onCancel }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!note.trim()) {
      alert('Vui long nhap ly do tu choi.');
      return;
    }
    setLoading(true);
    await onConfirm(request.id, note);
    setLoading(false);
  };

  const employeeName = request.employeeName || request.employee?.fullName || 'nhan vien';

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={styles.modalIcon}>⚠️</div>
          <div>
            <h3 style={styles.modalTitle}>Tu choi don nghi phep</h3>
            <p style={styles.modalSubtitle}>
              Don cua: <strong>{employeeName}</strong>
            </p>
          </div>
          <button style={styles.closeBtn} onClick={onCancel}>✕</button>
        </div>

        {/* Info */}
        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Loai nghi:</span>
            <span style={styles.infoValue}>{request.leaveType}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Tu ngay:</span>
            <span style={styles.infoValue}>{request.startDate}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Den ngay:</span>
            <span style={styles.infoValue}>{request.endDate}</span>
          </div>
          {request.reason && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Ly do xin:</span>
              <span style={styles.infoValue}>{request.reason}</span>
            </div>
          )}
        </div>

        {/* Note input */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Ly do tu choi <span style={styles.required}>*</span>
          </label>
          <textarea
            style={styles.textarea}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Nhap ly do tu choi don nghi phep..."
            rows={4}
          />
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onCancel} disabled={loading}>
            Huy
          </button>
          <button style={styles.confirmBtn} onClick={handleConfirm} disabled={loading}>
            {loading ? 'Dang xu ly...' : 'Xac nhan tu choi'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
  },
  modalIcon: {
    fontSize: '28px',
    flexShrink: 0,
  },
  modalTitle: {
    margin: '0 0 2px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  modalSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
  },
  closeBtn: {
    marginLeft: 'auto',
    border: 'none',
    background: 'none',
    color: '#94a3b8',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
    flexShrink: 0,
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    margin: '16px 24px',
    borderRadius: '8px',
    padding: '12px 16px',
  },
  infoRow: {
    display: 'flex',
    gap: '8px',
    padding: '4px 0',
    fontSize: '13px',
  },
  infoLabel: {
    color: '#64748b',
    minWidth: '80px',
    flexShrink: 0,
  },
  infoValue: {
    color: '#1e293b',
    fontWeight: '500',
  },
  formGroup: {
    padding: '0 24px 16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  },
  required: {
    color: '#ef4444',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #f1f5f9',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '8px 20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  confirmBtn: {
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default RejectModal;
