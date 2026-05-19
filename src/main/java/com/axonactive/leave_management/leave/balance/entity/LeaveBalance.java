package com.axonactive.leave_management.leave.balance.entity;

import com.axonactive.leave_management.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

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

    @Transient
    private int remainingDays = 12;

    private int carriedOverDays = 0;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @PostLoad
    private void calculateRemaining() {
        this.remainingDays = this.totalDays + this.carriedOverDays - this.usedDays;
    }
}
