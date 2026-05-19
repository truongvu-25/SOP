import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RejectModal from './RejectModal';

const PendingRequests = ({ onActionSuccess }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Modal Từ chối
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leave-requests/pending');
      setRequests(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn chờ duyệt:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // Xử lý khi Manager chọn ĐỒNG Ý
  const handleApprove = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn phê duyệt đơn này không?')) {
      try {
        await axios.put(`/api/leave-requests/${id}/approve`);
        alert('Đã phê duyệt đơn thành công!');
        fetchPendingRequests(); // Refresh danh sách đơn chờ duyệt
        onActionSuccess(); // Gọi hàm cập nhật Real-time bảng số dư của Dev 3
      } catch (error) {
        alert('Phê duyệt thất bại. Vui lòng thử lại!');
      }
    }
  };

  // Mở modal bắt buộc nhập lý do khi chọn TỪ CHỐI
  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // Xác nhận TỪ CHỐI từ modal (đã có kèm note)
  const handleRejectConfirm = async (reviewNote) => {
    try {
      await axios.put(`/api/leave-requests/${selectedRequest.id}/reject`, {
        reviewNote: reviewNote // Đính kèm lý do bắt buộc
      });
      alert('Đã từ chối đơn xin nghỉ.');
      setIsModalOpen(false);
      setSelectedRequest(null);
      fetchPendingRequests(); // Refresh danh sách đơn chờ duyệt
      onActionSuccess(); // Đồng bộ lại giao diện
    } catch (error) {
      alert('Thao tác thất bại. Vui lòng kiểm tra lại!');
    }
  };

  if (loading) return <div className="text-gray-500 py-4">Đang tải danh sách đơn xin nghỉ...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📥 Danh Sách Đơn Chờ Phê Duyệt</h3>
      
      {requests.length === 0 ? (
        <div className="text-center py-6 text-gray-400">Hiện tại không có đơn xin nghỉ nào cần xử lý.</div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="p-4 border border-gray-100 rounded-md bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between transition-all hover:shadow-md">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">{req.employeeName}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded">
                    {req.leaveType}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  📅 Thời gian: <span className="font-medium text-gray-800">{req.startDate}</span> đến <span className="font-medium text-gray-800">{req.endDate}</span> 
                  <span className="ml-1 text-gray-500">({req.daysCount} ngày)</span>
                </p>
                <p className="text-sm text-gray-500 italic mt-1">📝 Lý do: "{req.reason}"</p>
              </div>

              {/* Nhóm hành động Duyệt / Từ chối */}
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

      {/* Reusable Modal đi kèm */}
      <RejectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRejectConfirm}
        applicantName={selectedRequest?.employeeName || ''}
      />
    </div>
  );
};

export default PendingRequests;