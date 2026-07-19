package com.skyhyp.dto.dashboard;

import java.util.List;

public record DashboardResponse(
        SummaryStats summary,
        List<GroupStat> bySetup,
        List<GroupStat> byRiskReward,
        List<GroupStat> byDidFollowPlan,
        List<GroupStat> byEmotionBeforeTrade,
        List<GroupStat> byEmotionDuringTrade,
        List<GroupStat> byDayOfWeek,
        List<MonthlyStat> monthlyPnl,
        /** Plain-English highlights derived from the breakdowns above, e.g. "You perform best on Mondays". */
        List<String> insights
) {
}