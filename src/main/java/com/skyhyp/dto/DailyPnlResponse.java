package com.skyhyp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyPnlResponse(
        LocalDate date,
        BigDecimal totalPnl,
        long tradeCount
) {
}