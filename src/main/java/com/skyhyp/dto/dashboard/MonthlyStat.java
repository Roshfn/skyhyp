package com.skyhyp.dto.dashboard;

import java.math.BigDecimal;

public record MonthlyStat(
        /** ISO "yyyy-MM", e.g. "2026-07". Kept as a plain string so the frontend doesn't need to parse a YearMonth. */
        String month,
        long tradeCount,
        BigDecimal totalPnl
) {
}