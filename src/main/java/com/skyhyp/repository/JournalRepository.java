package com.skyhyp.repository;

import com.skyhyp.dto.DailyPnlResponse;
import com.skyhyp.entity.Journal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface JournalRepository extends JpaRepository<Journal, UUID> {

    List<Journal> findByUser_UserId(UUID userId);

    List<Journal> findByUser_UserIdOrderByDateDesc(UUID userId);

    @Query("""
            SELECT new com.skyhyp.dto.DailyPnlResponse(
                j.date,
                COALESCE(SUM(j.profitLoss), 0),
                COUNT(j)
            )
            FROM Journal j
            WHERE j.user.userId = :userId
              AND j.date BETWEEN :start AND :end
            GROUP BY j.date
            ORDER BY j.date
            """)
    List<DailyPnlResponse> aggregateDailyPnl(
            @Param("userId") UUID userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
}

