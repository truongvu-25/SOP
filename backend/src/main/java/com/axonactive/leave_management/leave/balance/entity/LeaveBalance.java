package com.axonactive.leave_management.leave.balance.entity;

import com.axonactive.leave_management.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Data
@Entity
@Table(name = "leave_balances")
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int year;

    private int totalDays = 12;

    private int usedDays = 0;

    private int remainingDays = 12;

    private int carriedOverDays = 0;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
/* SCRUM 45 */