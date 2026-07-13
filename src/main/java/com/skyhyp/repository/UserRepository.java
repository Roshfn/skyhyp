package com.skyhyp.repository;

import com.skyhyp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByGmail(String gmail);

    boolean existsByGmail(String gmail);
}