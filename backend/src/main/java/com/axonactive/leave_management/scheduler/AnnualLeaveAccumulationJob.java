package com.axonactive.leave_management.scheduler;

import com.axonactive.leave_management.leave.balance.entity.LeaveBalance;
import com.axonactive.leave_management.leave.balance.repository.LeaveBalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.axonactive.leave_management.leave.balance.log.entity.LeaveAccumulationLog;
import com.axonactive.leave_management.leave.balance.log.repository.LeaveAccumulationLogRepository;

import java.time.Year;

@Component
@RequiredArgsConstructor
public class AnnualLeaveAccumulationJob {

    private static final int DEFAULT_ANNUAL_LEAVE_DAYS = 12;
    private static final int MAX_CARRY_OVER_DAYS = 6;

    private final LeaveBalanceRepository leaveBalanceRepository;

    private final LeaveAccumulationLogRepository logRepository;

    @Scheduled(cron = "0 0 0 1 1 *")
    public void accumulateAnnualLeave() {
        int previousYear = Year.now().getValue() - 1;
        int currentYear = Year.now().getValue();

        leaveBalanceRepository.findAll().stream()
                .filter(balance -> balance.getYear() == previousYear)
                .forEach(balance -> {
                    int carryOverDays = Math.min(balance.getRemainingDays(), MAX_CARRY_OVER_DAYS);

                    LeaveBalance newYearBalance = new LeaveBalance();
                    newYearBalance.setUser(balance.getUser());
                    newYearBalance.setYear(currentYear);
                    newYearBalance.setCarriedOverDays(carryOverDays);
                    newYearBalance.setTotalDays(DEFAULT_ANNUAL_LEAVE_DAYS + carryOverDays);
                    newYearBalance.setUsedDays(0);
                    newYearBalance.setRemainingDays(DEFAULT_ANNUAL_LEAVE_DAYS + carryOverDays);

                    leaveBalanceRepository.save(newYearBalance);
                    int expiredDays = balance.getRemainingDays() - carryOverDays;

                    LeaveAccumulationLog log = new LeaveAccumulationLog();

                    log.setUser(balance.getUser());
                    log.setFromYear(previousYear);
                    log.setToYear(currentYear);
                    log.setDaysCarried(carryOverDays);
                    log.setDaysExpired(Math.max(expiredDays, 0));

                    logRepository.save(log);
                });
    }
}