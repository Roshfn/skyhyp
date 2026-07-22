package com.skyhyp.dto;

import jakarta.validation.constraints.NotBlank;

public record DailyReviewRequest(
        @NotBlank(message = "content is required")
        String content
) {
}