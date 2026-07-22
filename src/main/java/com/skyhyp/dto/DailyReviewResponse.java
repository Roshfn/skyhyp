package com.skyhyp.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record DailyReviewResponse(
        UUID reviewId,
        LocalDate date,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}