package com.skyhyp.dto;

import com.skyhyp.entity.enums.RiskReward;
import com.skyhyp.entity.enums.Setup;
import com.skyhyp.entity.enums.DidFollowPlan;
import com.skyhyp.entity.enums.Emotion;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request payload for creating or updating a Journal entry.
 * userId is NOT included here - it comes from the path (and later, from the JWT principal).
 */
public record JournalRequest(

        @NotNull(message = "setup is required")
        Setup setup,

        @NotNull(message = "date is required")
        LocalDate date,

        @NotNull(message = "derivative is required")
        String derivative,

        @NotNull(message = "entryPoint is required")
        BigDecimal entryPoint,

        @NotNull(message = "stopLoss is required")
        BigDecimal stopLoss,

        @NotNull(message = "target is required")
        BigDecimal target,

        BigDecimal takeProfit,

        @NotNull(message = "riskReward is required")
        RiskReward riskReward,

        BigDecimal profitLoss,

        String whyIEntered,

        @NotNull(message = "didIFollowMyPlan is required")
        DidFollowPlan didIFollowMyPlan,

        @NotNull(message = "emotionBeforeTrade is required")
        Emotion emotionBeforeTrade,

        @NotNull(message = "emotionDuringTrade is required")
        Emotion emotionDuringTrade,

        String mistakesMade,

        String lessonsLearned
) {
}