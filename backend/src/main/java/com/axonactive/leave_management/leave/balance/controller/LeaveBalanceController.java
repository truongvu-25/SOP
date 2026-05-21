package com.axonactive.leave_management.leave.balance.controller;

import com.axonactive.leave_management.leave.balance.dto.LeaveBalanceResponse;
import com.axonactive.leave_management.leave.balance.dto.LeaveBalanceTeamResponse;
import com.axonactive.leave_management.leave.balance.entity.LeaveBalance;
import com.axonactive.leave_management.leave.balance.service.LeaveBalanceService;
import com.axonactive.leave_management.user.entity.User;
import com.axonactive.leave_management.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leave-balance")
@RequiredArgsConstructor
public class LeaveBalanceController {

        private final LeaveBalanceService leaveBalanceService;
        private final UserRepository userRepository;

        @GetMapping("/test")
        public LeaveBalanceResponse testBalance() {
                LeaveBalance balance = new LeaveBalance();

                balance.setYear(2026);
                balance.setTotalDays(12);
                balance.setUsedDays(3);
                balance.setRemainingDays(9);
                balance.setCarriedOverDays(2);

                return toResponse(balance);
        }

        @GetMapping("/me")
        public LeaveBalanceResponse getMyLeaveBalance(Authentication authentication) {
                String email = authentication.getName();

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                LeaveBalance balance = leaveBalanceService.getCurrentBalance(user);

                return toResponse(balance);
        }

        @GetMapping("/{userId}")
        public LeaveBalanceResponse getEmployeeLeaveBalance(@PathVariable UUID userId) {
                User employee = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Employee not found"));

                LeaveBalance balance = leaveBalanceService.getCurrentBalance(employee);

                return toResponse(balance);
        }

        @GetMapping("/team")
        public List<LeaveBalanceTeamResponse> getTeamLeaveBalances(
                        Authentication authentication,
                        @RequestParam(required = false) String search) {

                String email = authentication.getName();

                User manager = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Manager not found"));

                List<User> employees;

                if (search != null && !search.isBlank()) {
                        employees = userRepository.findByManagerAndFullNameContainingIgnoreCase(manager, search);
                } else {
                        employees = userRepository.findByManager(manager);
                }

                return employees.stream()
                                .map(employee -> {
                                        LeaveBalance balance = leaveBalanceService.getCurrentBalance(employee);

                                        return new LeaveBalanceTeamResponse(
                                                        employee.getFullName(),
                                                        balance.getYear(),
                                                        balance.getTotalDays(),
                                                        balance.getUsedDays(),
                                                        balance.getRemainingDays(),
                                                        balance.getCarriedOverDays());
                                })
                                .toList();
        }

        private LeaveBalanceResponse toResponse(LeaveBalance balance) {
                return new LeaveBalanceResponse(
                                balance.getYear(),
                                balance.getTotalDays(),
                                balance.getUsedDays(),
                                balance.getRemainingDays(),
                                balance.getCarriedOverDays());
        }
}