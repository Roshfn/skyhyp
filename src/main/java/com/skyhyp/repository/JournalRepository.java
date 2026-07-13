package com.skyhyp.repository;

import com.skyhyp.entity.Journal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JournalRepository extends JpaRepository<Journal, UUID> {

    List<Journal> findByUser_UserId(UUID userId);

    List<Journal> findByUser_UserIdOrderByDateDesc(UUID userId);
}

