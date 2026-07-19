package com.skyhyp.dto.dashboard;

import java.math.BigDecimal;

public record SummaryStats(
        long totalTrades,
        long closedTrades,
        long openTrades,
        long wins,
        long losses,
        long breakeven,
        BigDecimal winRatePercent,
        BigDecimal totalPnl,
        BigDecimal avgPnlPerTrade,
        BigDecimal avgWin,
        BigDecimal avgLoss,
        BigDecimal largestWin,
        BigDecimal largestLoss,
        /** Gross profit / gross loss. Null when there are no losing trades (undefined, not infinite). */
        BigDecimal profitFactor
) {
}