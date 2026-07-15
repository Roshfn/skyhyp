package com.skyhyp.repository;

import com.skyhyp.entity.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, UUID> {

    Optional<PendingRegistration> findByGmail(String gmail);

    void deleteByGmail(String gmail);
}