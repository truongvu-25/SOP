import React, { useState } from 'react';
import PendingRequests from '../components/PendingRequests';
import TeamBalanceTable from '../components/TeamBalanceTable';

const ManagerDashboard = () => {
  // Biến dùng để trigger reload Table số dư mỗi khi có hành động phê duyệt/từ chối đơn thành công
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefreshBalances = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Dashboard */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">💻 Manager Portal</h1>
          <p className="text-sm text-gray-600">Hệ thống quản lý phê duyệt đơn nghỉ phép của phòng ban - Hợp tác Axon Active</p>
        </div>

        {/* Khối chức năng 1: Xử lý các đơn xin nghỉ đang chờ (Backlog 3) */}
        <PendingRequests onActionSuccess={handleRefreshBalances} />

        {/* Khối chức năng 2: Theo dõi số dư ngày phép của nhân viên (Backlog 1) */}
        <TeamBalanceTable refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default ManagerDashboard;