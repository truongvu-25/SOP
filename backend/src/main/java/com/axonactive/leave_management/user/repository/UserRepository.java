package com.axonactive.leave_management.user.repository;

import com.axonactive.leave_management.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByManager(User manager);

    List<User> findByManagerAndFullNameContainingIgnoreCase(
            User manager,
            String fullName);
}