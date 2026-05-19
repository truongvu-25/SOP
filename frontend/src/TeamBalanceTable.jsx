import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeamBalanceTable = ({ refreshTrigger }) => {
  const [balances, setBalances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Gọi API lấy số dư ngày phép của Team (Endpoint từ README)
  const fetchTeamBalances = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leave-balance/team');
      setBalances(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy số dư ngày phép của team:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động load lại khi Manager vừa duyệt/từ chối xong một đơn bất kỳ (Real-time update)
  useEffect(() => {
    fetchTeamBalances();
  }, [refreshTrigger]);

  // Bộ lọc tìm kiếm nhân viên theo tên (Yêu cầu của Backlog 1)
  const filteredBalances = balances.filter((item) =>
    item.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-gray-500 py-4">Đang tải số dư ngày phép của đội ngũ...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📊 Số Dư Ngày Phép Của Đội Ngũ</h3>
        
        {/* Thanh tìm kiếm theo tên nhân viên */}
        <input
          type="text"
          placeholder="🔍 Tìm nhân viên theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">Nhân Viên</th>
              <th className="px-6 py-3 font-medium text-gray-500">Tổng Ngày Phép (12 + Cộng dồn)</th>
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
                    <span className={`font-semibold px-2 py-1 rounded ${item.remainingDays > 3 ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}`}>
                      {item.totalDays - item.usedDays} ngày
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">Không tìm thấy nhân viên phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamBalanceTable;