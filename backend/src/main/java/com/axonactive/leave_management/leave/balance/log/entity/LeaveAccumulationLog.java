package com.axonactive.leave_management.leave.balance.log.entity;

import com.axonactive.leave_management.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "leave_accumulation_logs")
@Data
public class LeaveAccumulationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private int fromYear;

    private int toYear;

    private int daysCarried;

    private int daysExpired;

    private LocalDateTime createdAt = LocalDateTime.now();
}