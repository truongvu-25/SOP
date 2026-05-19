package com.axonactive.leave_management.leave.balance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaveBalanceTeamResponse {

    private String employeeName;
    private int year;
    private int totalDays;
    private int usedDays;
    private int remainingDays;
    private int carriedOverDays;
}
