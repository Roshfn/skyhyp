package com.skyhyp.service;

import com.skyhyp.dto.dashboard.*;
import com.skyhyp.entity.Journal;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.format.TextStyle;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Stateless and DB-agnostic on purpose: it only knows about java.util.List<Journal>
 * in memory. That makes it trivial to unit test (build a List<Journal> by hand,
 * assert on the DashboardResponse) without spinning up a database, and keeps every
 * derived number traceable back to the same source-of-truth rows the rest of the
 * app reads - no separate "analytics table" to drift out of sync.
 */
@Component
public class DashboardCalculator {

    private static final int SCALE = 2;
    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(SCALE, RoundingMode.HALF_UP);

    public DashboardResponse calculate(List<Journal> journals) {
        SummaryStats summary = computeSummary(journals);

        List<GroupStat> bySetup = groupBy(journals, j -> j.getSetup().name());
        List<GroupStat> byRiskReward = groupBy(journals, j -> j.getRiskReward().name());
        List<GroupStat> byDidFollowPlan = groupBy(journals, j -> j.getDidIFollowMyPlan().name());
        List<GroupStat> byEmotionBeforeTrade = groupBy(journals, j -> j.getEmotionBeforeTrade().name());
        List<GroupStat> byEmotionDuringTrade = groupBy(journals, j -> j.getEmotionDuringTrade().name());
        List<GroupStat> byDayOfWeek = groupByDayOfWeek(journals);
        List<MonthlyStat> monthlyPnl = computeMonthly(journals);

        List<String> insights = generateInsights(byDayOfWeek, bySetup, byDidFollowPlan,
                byEmotionBeforeTrade, monthlyPnl, summary);

        return new DashboardResponse(
                summary, bySetup, byRiskReward, byDidFollowPlan,
                byEmotionBeforeTrade, byEmotionDuringTrade, byDayOfWeek, monthlyPnl, insights
        );
    }

    // ---------------------------------------------------------------------

    private SummaryStats computeSummary(List<Journal> journals) {
        long totalTrades = journals.size();

        List<Journal> closed = journals.stream()
                .filter(j -> j.getProfitLoss() != null)
                .toList();

        long closedTrades = closed.size();
        long openTrades = totalTrades - closedTrades;

        List<BigDecimal> pnls = closed.stream().map(Journal::getProfitLoss).toList();

        long wins = pnls.stream().filter(p -> p.signum() > 0).count();
        long losses = pnls.stream().filter(p -> p.signum() < 0).count();
        long breakeven = closedTrades - wins - losses;

        BigDecimal totalPnl = sum(pnls);
        BigDecimal avgPnl = average(totalPnl, closedTrades);

        BigDecimal grossProfit = sum(pnls.stream().filter(p -> p.signum() > 0).toList());
        BigDecimal grossLoss = sum(pnls.stream().filter(p -> p.signum() < 0).toList()).abs();

        BigDecimal avgWin = average(grossProfit, wins);
        BigDecimal avgLoss = average(grossLoss, losses);

        BigDecimal largestWin = pnls.stream().max(Comparator.naturalOrder()).orElse(ZERO);
        BigDecimal largestLoss = pnls.stream().min(Comparator.naturalOrder()).orElse(ZERO);

        BigDecimal winRate = percent(wins, closedTrades);
        BigDecimal profitFactor = grossLoss.signum() == 0
                ? null
                : grossProfit.divide(grossLoss, SCALE, RoundingMode.HALF_UP);

        return new SummaryStats(
                totalTrades, closedTrades, openTrades, wins, losses, breakeven,
                winRate, totalPnl, avgPnl, avgWin, avgLoss, largestWin, largestLoss, profitFactor
        );
    }

    /**
     * Generic breakdown: groups closed trades by whatever key the caller extracts
     * (setup name, emotion name, etc.) and computes the same stat shape for each
     * bucket. This is the one function every "by X" breakdown routes through, so
     * every insight is computed the exact same way - no per-dimension copy-paste
     * that could quietly drift (e.g. one breakdown rounding differently than another).
     */
    private List<GroupStat> groupBy(List<Journal> journals, Function<Journal, String> keyFn) {
        Map<String, List<Journal>> grouped = journals.stream()
                .filter(j -> j.getProfitLoss() != null)
                .collect(Collectors.groupingBy(keyFn, LinkedHashMap::new, Collectors.toList()));

        return grouped.entrySet().stream()
                .map(entry -> toGroupStat(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(GroupStat::totalPnl).reversed())
                .toList();
    }

    private List<GroupStat> groupByDayOfWeek(List<Journal> journals) {
        Map<DayOfWeek, List<Journal>> grouped = journals.stream()
                .filter(j -> j.getProfitLoss() != null)
                .collect(Collectors.groupingBy(j -> j.getDate().getDayOfWeek()));

        return Arrays.stream(DayOfWeek.values())
                .filter(grouped::containsKey)
                .map(day -> toGroupStat(day.getDisplayName(TextStyle.FULL, Locale.ENGLISH), grouped.get(day)))
                .sorted(Comparator.comparing(GroupStat::totalPnl).reversed())
                .toList();
    }

    private GroupStat toGroupStat(String label, List<Journal> trades) {
        List<BigDecimal> pnls = trades.stream().map(Journal::getProfitLoss).toList();
        long wins = pnls.stream().filter(p -> p.signum() > 0).count();
        BigDecimal totalPnl = sum(pnls);
        BigDecimal avgPnl = average(totalPnl, trades.size());
        BigDecimal winRate = percent(wins, trades.size());

        return new GroupStat(label, trades.size(), wins, totalPnl, avgPnl, winRate);
    }

    private List<MonthlyStat> computeMonthly(List<Journal> journals) {
        Map<String, List<Journal>> grouped = journals.stream()
                .filter(j -> j.getProfitLoss() != null)
                .collect(Collectors.groupingBy(
                        j -> j.getDate().getYear() + "-" + String.format("%02d", j.getDate().getMonthValue()),
                        TreeMap::new,
                        Collectors.toList()
                ));

        return grouped.entrySet().stream()
                .map(e -> new MonthlyStat(e.getKey(), e.getValue().size(), sum(e.getValue().stream().map(Journal::getProfitLoss).toList())))
                .toList();
    }

    /**
     * Highlights are deliberately few and specific ("best day", "plan adherence
     * delta") rather than one line per breakdown - a wall of auto-generated
     * sentences is exactly the "noise" the dashboard is meant to cut through.
     */
    private List<String> generateInsights(
            List<GroupStat> byDayOfWeek,
            List<GroupStat> bySetup,
            List<GroupStat> byDidFollowPlan,
            List<GroupStat> byEmotionBeforeTrade,
            List<MonthlyStat> monthlyPnl,
            SummaryStats summary) {

        List<String> insights = new ArrayList<>();

        if (summary.closedTrades() == 0) {
            insights.add("Log a few closed trades to start seeing insights here.");
            return insights;
        }

        topBy(byDayOfWeek, GroupStat::totalPnl)
                .ifPresent(g -> insights.add(
                        "You're most profitable on %ss, averaging %s per trade over %d trades."
                                .formatted(g.label(), formatSigned(g.avgPnl()), g.tradeCount())));

        topBy(bySetup, GroupStat::winRatePercent)
                .ifPresent(g -> insights.add(
                        "Your \"%s\" setup has your highest win rate at %s%% across %d trades."
                                .formatted(labelize(g.label()), g.winRatePercent(), g.tradeCount())));

        Map<String, GroupStat> planMap = byDidFollowPlan.stream()
                .collect(Collectors.toMap(GroupStat::label, g -> g));
        GroupStat followedPlan = planMap.get("YES");
        GroupStat brokePlan = planMap.get("NO");
        if (followedPlan != null && brokePlan != null) {
            BigDecimal delta = followedPlan.avgPnl().subtract(brokePlan.avgPnl());
            insights.add(delta.signum() > 0
                    ? "You average %s more per trade when you follow your plan (%s vs %s)."
                    .formatted(formatSigned(delta), formatSigned(followedPlan.avgPnl()), formatSigned(brokePlan.avgPnl()))
                    : "Surprisingly, you average %s per trade when you deviate from your plan, vs %s when you follow it - worth digging into."
                    .formatted(formatSigned(brokePlan.avgPnl()), formatSigned(followedPlan.avgPnl())));
        }

        topBy(byEmotionBeforeTrade, GroupStat::avgPnl)
                .ifPresent(g -> insights.add(
                        "You trade best when you feel \"%s\" beforehand, averaging %s per trade."
                                .formatted(labelize(g.label()), formatSigned(g.avgPnl()))));

        if (monthlyPnl.size() >= 2) {
            MonthlyStat bestMonth = monthlyPnl.stream()
                    .max(Comparator.comparing(MonthlyStat::totalPnl))
                    .orElse(null);
            if (bestMonth != null) {
                insights.add("Your best month so far is %s with %s total P&L."
                        .formatted(bestMonth.month(), formatSigned(bestMonth.totalPnl())));
            }
        }

        return insights;
    }

    private <T> Optional<GroupStat> topBy(List<GroupStat> stats, Function<GroupStat, T> key) {
        return stats.stream()
                .filter(g -> g.tradeCount() > 0)
                .max(Comparator.comparing(key, comparableComparator()));
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private <T> Comparator<T> comparableComparator() {
        return (a, b) -> ((Comparable) a).compareTo(b);
    }

    private String labelize(String enumName) {
        String[] words = enumName.split("_");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (!sb.isEmpty()) sb.append(' ');
            sb.append(word.charAt(0)).append(word.substring(1).toLowerCase());
        }
        return sb.toString();
    }

    private String formatSigned(BigDecimal value) {
        return (value.signum() >= 0 ? "+" : "") + value;
    }

    private BigDecimal sum(List<BigDecimal> values) {
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add).setScale(SCALE, RoundingMode.HALF_UP);
    }

    private BigDecimal average(BigDecimal total, long count) {
        if (count == 0) return ZERO;
        return total.divide(BigDecimal.valueOf(count), SCALE, RoundingMode.HALF_UP);
    }

    private BigDecimal percent(long part, long whole) {
        if (whole == 0) return ZERO;
        return BigDecimal.valueOf(part)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(whole), SCALE, RoundingMode.HALF_UP);
    }
}