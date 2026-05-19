package com.axonactive.leave_management.leave.balance.service;

import com.axonactive.leave_management.leave.balance.entity.LeaveBalance;
import com.axonactive.leave_management.leave.balance.repository.LeaveBalanceRepository;
import com.axonactive.leave_management.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class LeaveBalanceService {

    private static final int DEFAULT_ANNUAL_LEAVE_DAYS = 12;
    private static final int MAX_CARRY_OVER_DAYS = 6;

    private final LeaveBalanceRepository leaveBalanceRepository;

    public LeaveBalance getOrCreateCurrentYearBalance(User user) {
        int currentYear = Year.now().getValue();

        return leaveBalanceRepository.findByUserAndYear(user, currentYear)
                .orElseGet(() -> {
                    LeaveBalance balance = new LeaveBalance();
                    balance.setUser(user);
                    balance.setYear(currentYear);
                    balance.setTotalDays(DEFAULT_ANNUAL_LEAVE_DAYS);
                    balance.setUsedDays(0);
                    balance.setCarriedOverDays(0);
                    balance.setRemainingDays(DEFAULT_ANNUAL_LEAVE_DAYS);
                    return leaveBalanceRepository.save(balance);
                });
    }

    /* /SCRUM 46 */
    public LeaveBalance deductLeaveDays(User user, int days) {
        LeaveBalance balance = getOrCreateCurrentYearBalance(user);

        if (days <= 0) {
            throw new IllegalArgumentException("Leave days must be greater than 0");
        }

        if (balance.getRemainingDays() < days) {
            throw new IllegalArgumentException("Not enough remaining leave days");
        }

        balance.setUsedDays(balance.getUsedDays() + days);
        balance.setRemainingDays(balance.getRemainingDays() - days);

        return leaveBalanceRepository.save(balance);
    }

    /* SCRUM 47 */
    public int calculateCarryOverDays(LeaveBalance balance) {
        return Math.min(balance.getRemainingDays(), MAX_CARRY_OVER_DAYS);
    }

    public LeaveBalance getCurrentBalance(User user) {
        return getOrCreateCurrentYearBalance(user);
    }
}
