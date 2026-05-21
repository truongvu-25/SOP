package com.axonactive.leave_management.leave_request.controller;

import com.axonactive.leave_management.common.exception.ResourceNotFoundException;
import com.axonactive.leave_management.leave_request.dto.LeaveRequestDTO;
import com.axonactive.leave_management.leave_request.dto.LeaveRequestResponse;
import com.axonactive.leave_management.leave_request.dto.RejectRequestDTO;
import com.axonactive.leave_management.leave_request.service.LeaveRequestService;
import com.axonactive.leave_management.user.entity.User;
import com.axonactive.leave_management.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;
    private final UserRepository userRepository;

    // ── EMPLOYEE endpoints ──────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveRequestResponse> submit(
            @Valid @RequestBody LeaveRequestDTO dto,
            @AuthenticationPrincipal UserDetails principal) {
        UUID employeeId = resolveUserId(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveRequestService.submit(dto, employeeId));
    }

    @GetMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<LeaveRequestResponse>> getMyRequests(
            @AuthenticationPrincipal UserDetails principal) {
        UUID employeeId = resolveUserId(principal);
        return ResponseEntity.ok(leaveRequestService.getMyRequests(employeeId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER')")
    public ResponseEntity<LeaveRequestResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(leaveRequestService.getById(id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveRequestResponse> cancel(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal) {
        UUID employeeId = resolveUserId(principal);
        return ResponseEntity.ok(leaveRequestService.cancel(id, employeeId));
    }

    // ── MANAGER endpoints ───────────────────────────────────────────────────

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<LeaveRequestResponse> approve(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal) {
        UUID managerId = resolveUserId(principal);
        String reviewNote = (body != null) ? body.get("reviewNote") : null;
        return ResponseEntity.ok(leaveRequestService.approve(id, managerId, reviewNote));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<LeaveRequestResponse> reject(
            @PathVariable UUID id,
            @Valid @RequestBody RejectRequestDTO dto,
            @AuthenticationPrincipal UserDetails principal) {
        UUID managerId = resolveUserId(principal);
        return ResponseEntity.ok(leaveRequestService.reject(id, managerId, dto.getNote()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<LeaveRequestResponse>> getPendingRequests(
            @AuthenticationPrincipal UserDetails principal) {
        UUID managerId = resolveUserId(principal);
        return ResponseEntity.ok(leaveRequestService.getPendingRequests(managerId));
    }

    @GetMapping("/team")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<LeaveRequestResponse>> getTeamRequests(
            @AuthenticationPrincipal UserDetails principal) {
        UUID managerId = resolveUserId(principal);
        return ResponseEntity.ok(leaveRequestService.getTeamRequests(managerId));
    }

    // ── helper ──────────────────────────────────────────────────────────────

    private UUID resolveUserId(UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getUsername()));
        return user.getId();
    }
}
