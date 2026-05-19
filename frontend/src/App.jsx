import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ==========================================
// 1. COMPONENT: REJECT MODAL (Backlog 3)
// ==========================================
const RejectModal = ({ isOpen, onClose, onConfirm, applicantName }) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (note.trim()) {
      onConfirm(note);
      setNote(''); // Reset ô nhập liệu
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Từ chối đơn xin nghỉ</h3>
        <p className="text-sm text-gray-500 mb-4">
          Bạn đang thực hiện từ chối đơn xin nghỉ của <span className="font-semibold text-gray-700">{applicantName}</span>.
        </p>
        
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lý do từ chối <span className="text-red-500">* (Bắt buộc nhập lý do theo DoD)</span>
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
              disabled={!note.trim()} // Ràng buộc Validation nghiêm ngặt của DoD
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

// ==========================================
// 2. COMPONENT: PENDING REQUESTS (Backlog 3)
// ==========================================
const PendingRequests = ({ onActionSuccess, isMock }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchPendingRequests = async () => {
    setLoading(true);
    if (isMock) {
      // Dữ liệu giả lập để chạy thử độc lập
      const mockRequests = [
        { id: 'req_01', employeeName: 'Trần Văn Hoàng', leaveType: 'ANNUAL', startDate: '2026-06-01', endDate: '2026-06-03', daysCount: 3, reason: 'Giải quyết công việc gia đình.' },
        { id: 'req_02', employeeName: 'Lê Thị Mai', leaveType: 'SICK', startDate: '2026-05-20', endDate: '2026-05-21', daysCount: 1, reason: 'Đi khám bệnh định kỳ.' }
      ];
      setRequests(mockRequests);
      setLoading(false);
    } else {
      // Gọi đến API thật của Backend
      try {
        const response = await axios.get('/api/leave-requests/pending');
        setRequests(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn thật từ API:', error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [isMock]);

  const handleApprove = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn phê duyệt đơn này không?')) {
      if (isMock) {
        alert('Đã phê duyệt đơn thành công! (Chạy chế độ giả lập)');
        setRequests(requests.filter(req => req.id !== id));
        onActionSuccess(); // Kích hoạt reload bảng số dư thời gian thực
      } else {
        try {
          await axios.put(`/api/leave-requests/${id}/approve`);
          alert('Đã phê duyệt đơn thành công trên hệ thống!');
          fetchPendingRequests();
          onActionSuccess();
        } catch (error) {
          alert('Lỗi kết nối API phê duyệt!');
        }
      }
    }
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleRejectConfirm = async (reviewNote) => {
    if (isMock) {
      alert(`Đã từ chối đơn của ${selectedRequest.employeeName}.\nLý do: "${reviewNote}"`);
      setIsModalOpen(false);
      setRequests(requests.filter(req => req.id !== selectedRequest.id));
      setSelectedRequest(null);
      onActionSuccess();
    } else {
      try {
        await axios.put(`/api/leave-requests/${selectedRequest.id}/reject`, { reviewNote });
        alert('Đã từ chối đơn thành công trên hệ thống!');
        setIsModalOpen(false);
        setSelectedRequest(null);
        fetchPendingRequests();
        onActionSuccess();
      } catch (error) {
        alert('Lỗi khi cập nhật trạng thái từ chối qua API!');
      }
    }
  };

  if (loading) return <div className="text-gray-500 py-4">Đang tải danh sách đơn...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📥 Danh Sách Đơn Chờ Phê Duyệt</h3>
      {requests.length === 0 ? (
        <div className="text-center py-6 text-gray-400">Không có đơn xin nghỉ nào cần xử lý.</div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="p-4 border border-gray-100 rounded-md bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between transition-all hover:shadow-sm">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">{req.employeeName}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded">{req.leaveType}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  📅 Thời gian: <span className="font-medium text-gray-800">{req.startDate}</span> đến <span className="font-medium text-gray-800">{req.endDate}</span> ({req.daysCount} ngày)
                </p>
                <p className="text-sm text-gray-500 italic mt-1">📝 Lý do: "{req.reason}"</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <button 
                  onClick={() => handleApprove(req.id)} 
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Đồng ý
                </button>
                <button 
                  onClick={() => handleRejectClick(req)} 
                  className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <RejectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleRejectConfirm} applicantName={selectedRequest?.employeeName || ''} />
    </div>
  );
};

// ==========================================
// 3. COMPONENT: TEAM BALANCE TABLE (Backlog 1)
// ==========================================
const TeamBalanceTable = ({ refreshTrigger, isMock }) => {
  const [balances, setBalances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTeamBalances = async () => {
    setLoading(true);
    if (isMock) {
      // Giả lập dữ liệu bảng số dư (Có bạn Nhi và teammate Anh Thy ở HCMUTE)
      const mockBalances = [
        { id: '1', fullName: 'Nguyễn Anh Thy', totalDays: 15, usedDays: 3 },
        { id: '2', fullName: 'Nguyễn Yến Nhi', totalDays: 12, usedDays: 0 },
        { id: '3', fullName: 'Trần Văn Hoàng', totalDays: 12, usedDays: 5 },
        { id: '4', fullName: 'Lê Thị Mai', totalDays: 18, usedDays: 2 }
      ];
      setBalances(mockBalances);
      setLoading(false);
    } else {
      try {
        const response = await axios.get('/api/leave-balance/team');
        setBalances(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu số dư thật từ API:', error);
        setBalances([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTeamBalances();
  }, [refreshTrigger, isMock]);

  // Tìm kiếm nhân viên theo tên
  const filteredBalances = balances.filter((item) =>
    item.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-gray-500 py-4">Đang tải số dư ngày phép...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📊 Số Dư Ngày Phép Của Đội Ngũ</h3>
        <input
          type="text"
          placeholder="🔍 Tìm nhân viên theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">Nhân Viên</th>
              <th className="px-6 py-3 font-medium text-gray-500">Tổng Ngày Phép</th>
              <th className="px-6 py-3 font-medium text-gray-500">Số Ngày Đã Nghỉ</th>
              <th className="px-6 py-3 font-medium text-gray-500">Số Ngày Còn Lại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBalances.length > 0 ? (
              filteredBalances.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.fullName}</td>
                  <td className="px-6 py-4 text-gray-600">{item.totalDays} ngày</td>
                  <td className="px-6 py-4 text-gray-600">{item.usedDays} ngày</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                      {item.totalDays - item.usedDays} ngày
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">Không tìm thấy nhân viên.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN APPLICATION: APP
// ==========================================
export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMock, setIsMock] = useState(true); // Mặc định bật Mock dữ liệu để dễ test UI

  const handleRefreshBalances = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Thanh công cụ quản lý trạng thái Mock Data dành cho Nhi khi cần demo */}
        <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-blue-900 font-bold text-sm sm:text-base">🛠️ Chế độ Kiểm thử Frontend (Dev 6)</h2>
            <p className="text-xs text-blue-700 mt-0.5">Nhi có thể bật ON để test giao diện ngay, hoặc OFF để kết nối API thật của nhóm.</p>
          </div>
          <button
            onClick={() => setIsMock(!isMock)}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm ${
              isMock ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-700 hover:bg-slate-800'
            }`}
          >
            Mock Data: {isMock ? '🟢 ON (Chạy thử)' : '⚫ OFF (Kết nối API)'}
          </button>
        </div>

        {/* Tiêu đề ứng dụng */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🏖️ Employees Leave Management System</h1>
          <p className="text-xs sm:text-sm text-gray-500">Màn hình Quản lý của Manager (Giao diện phụ trách bởi Dev 6)</p>
        </div>

        {/* Khối chức năng Backlog 3: Phê duyệt/Từ chối đơn */}
        <PendingRequests onActionSuccess={handleRefreshBalances} isMock={isMock} />

        {/* Khối chức năng Backlog 1: Xem bảng danh sách và tìm kiếm số dư */}
        <TeamBalanceTable refreshTrigger={refreshTrigger} isMock={isMock} />

      </div>
    </div>
  );
}