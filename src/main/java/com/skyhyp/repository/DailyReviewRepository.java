package com.skyhyp.repository;

import com.skyhyp.entity.DailyReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailyReviewRepository extends JpaRepository<DailyReview, UUID> {

    Optional<DailyReview> findByUser_UserIdAndReviewDate(UUID userId, LocalDate reviewDate);

    List<DailyReview> findByUser_UserIdAndReviewDateBetweenOrderByReviewDate(
            UUID userId, LocalDate start, LocalDate end);

    void deleteByUser_UserIdAndReviewDate(UUID userId, LocalDate reviewDate);
}