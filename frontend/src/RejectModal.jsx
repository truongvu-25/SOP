import React, { useState } from 'react';

const RejectModal = ({ isOpen, onClose, onConfirm, applicantName }) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (note.trim()) {
      onConfirm(note);
      setNote(''); // Reset form
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Từ chối đơn xin nghỉ</h3>
        <p className="text-sm text-gray-500 mb-4">
          Bạn đang thực hiện từ chối đơn xin nghỉ của <span className="font-semibold text-gray-700">{applicantName}</span>.
        </p>
        
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lý do từ chối <span className="text-red-500">* (Bắt buộc)</span>
          </label>
          <textarea
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập lý do cụ thể gửi cho nhân viên..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          
          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!note.trim()} // Ràng buộc Validation của DoD & Backlog: Trống thì không cho bấm
              className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                note.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'
              }`}
            >
              Xác nhận Từ chối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;