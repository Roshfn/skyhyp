package com.skyhyp.dto;

import com.skyhyp.entity.enums.RiskReward;
import com.skyhyp.entity.enums.Setup;
import com.skyhyp.entity.enums.DidFollowPlan;
import com.skyhyp.entity.enums.Emotion;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record JournalResponse(

        UUID journalId,
        UUID userId,
        Setup setup,
        LocalDate date,
        String derivative,
        BigDecimal entryPoint,
        BigDecimal stopLoss,
        BigDecimal target,
        BigDecimal takeProfit,
        RiskReward riskReward,
        String customRiskReward,
        BigDecimal profitLoss,
        String whyIEntered,
        DidFollowPlan didIFollowMyPlan,
        Emotion emotionBeforeTrade,
        Emotion emotionDuringTrade,
        String mistakesMade,
        String lessonsLearned,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}