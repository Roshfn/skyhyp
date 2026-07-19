package com.skyhyp.dto.dashboard;

import java.math.BigDecimal;

public record GroupStat(
        String label,
        long tradeCount,
        long wins,
        BigDecimal totalPnl,
        BigDecimal avgPnl,
        BigDecimal winRatePercent
) {
}