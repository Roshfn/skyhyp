package com.skyhyp.dto;

import com.skyhyp.entity.Journal;
import com.skyhyp.entity.User;

public final class JournalMapper {

    private JournalMapper() {
    }

    public static JournalResponse toResponse(Journal journal) {
        return new JournalResponse(
                journal.getJournalId(),
                journal.getUser().getUserId(),
                journal.getSetup(),
                journal.getDate(),
                journal.getDerivative(),
                journal.getEntryPoint(),
                journal.getStopLoss(),
                journal.getTarget(),
                journal.getTakeProfit(),
                journal.getRiskReward(),
                journal.getProfitLoss(),
                journal.getWhyIEntered(),
                journal.getDidIFollowMyPlan(),
                journal.getEmotionBeforeTrade(),
                journal.getEmotionDuringTrade(),
                journal.getMistakesMade(),
                journal.getLessonsLearned(),
                journal.getCreatedAt(),
                journal.getUpdatedAt()
        );
    }

    public static Journal toEntity(JournalRequest request, User user) {
        return Journal.builder()
                .user(user)
                .setup(request.setup())
                .date(request.date())
                .derivative(request.derivative())
                .entryPoint(request.entryPoint())
                .stopLoss(request.stopLoss())
                .target(request.target())
                .takeProfit(request.takeProfit())
                .riskReward(request.riskReward())
                .profitLoss(request.profitLoss())
                .whyIEntered(request.whyIEntered())
                .didIFollowMyPlan(request.didIFollowMyPlan())
                .emotionBeforeTrade(request.emotionBeforeTrade())
                .emotionDuringTrade(request.emotionDuringTrade())
                .mistakesMade(request.mistakesMade())
                .lessonsLearned(request.lessonsLearned())
                .build();
    }

    /**
     * Mutates an existing managed entity in place so JPA dirty-checking
     * picks up the changes without needing an explicit save() call.
     */
    public static void updateEntity(Journal journal, JournalRequest request) {
        journal.setSetup(request.setup());
        journal.setDate(request.date());
        journal.setDerivative(request.derivative());
        journal.setEntryPoint(request.entryPoint());
        journal.setStopLoss(request.stopLoss());
        journal.setTarget(request.target());
        journal.setTakeProfit(request.takeProfit());
        journal.setRiskReward(request.riskReward());
        journal.setProfitLoss(request.profitLoss());
        journal.setWhyIEntered(request.whyIEntered());
        journal.setDidIFollowMyPlan(request.didIFollowMyPlan());
        journal.setEmotionBeforeTrade(request.emotionBeforeTrade());
        journal.setEmotionDuringTrade(request.emotionDuringTrade());
        journal.setMistakesMade(request.mistakesMade());
        journal.setLessonsLearned(request.lessonsLearned());
    }
}