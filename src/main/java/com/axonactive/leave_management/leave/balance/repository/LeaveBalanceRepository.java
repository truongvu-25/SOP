package com.axonactive.leave_management.leave.balance.repository;

import com.axonactive.leave_management.leave.balance.entity.LeaveBalance;
import com.axonactive.leave_management.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    Optional<LeaveBalance> findByUserAndYear(User user, int year);
}
