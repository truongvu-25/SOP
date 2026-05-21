package com.axonactive.leave_management.leave.balance.log.repository;

import com.axonactive.leave_management.leave.balance.log.entity.LeaveAccumulationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LeaveAccumulationLogRepository
        extends JpaRepository<LeaveAccumulationLog, UUID> {
}