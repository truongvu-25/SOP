/*Repository này giúp bạn tìm số ngày phép của nhân viên theo năm */
package com.axonactive.leave_management.leave.balance.repository;

import com.axonactive.leave_management.leave.balance.entity.LeaveBalance;
import com.axonactive.leave_management.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID> {

    Optional<LeaveBalance> findByUserAndYear(User user, int year); /* lấy phép của user theo năm. */
}
