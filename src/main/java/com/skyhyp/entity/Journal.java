package com.skyhyp.entity;

import com.skyhyp.entity.enums.DidFollowPlan;
import com.skyhyp.entity.enums.Emotion;
import com.skyhyp.entity.enums.RiskReward;
import com.skyhyp.entity.enums.Setup;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "journal_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Journal {

    @Id
    @UuidGenerator
    @Column(name = "journal_id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID journalId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_journal_user"))
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "setup", nullable = false, length = 30)
    private Setup setup;

    @Column(name = "trade_date", nullable = false)
    private LocalDate date;

    @Column(name = "derivative", nullable = false)
    private String derivative;

    @Column(name = "entry_point", nullable = false, precision = 19, scale = 4)
    private BigDecimal entryPoint;

    @Column(name = "stop_loss", nullable = false, precision = 19, scale = 4)
    private BigDecimal stopLoss;

    @Column(name = "target", nullable = false, precision = 19, scale = 4)
    private BigDecimal target;

    @Column(name = "take_profit", precision = 19, scale = 4)
    private BigDecimal takeProfit;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_reward", nullable = false, length = 20)
    private RiskReward riskReward;

    @Column(name = "custom_risk_reward", length = 20)
    private String customRiskReward;

    @Column(name = "profit_loss", precision = 19, scale = 4)
    private BigDecimal profitLoss;

    @Column(name = "why_i_entered", columnDefinition = "TEXT")
    private String whyIEntered;

    @Enumerated(EnumType.STRING)
    @Column(name = "did_i_follow_my_plan", nullable = false, length = 10)
    private DidFollowPlan didIFollowMyPlan;

    @Enumerated(EnumType.STRING)
    @Column(name = "emotion_before_trade", nullable = false, length = 20)
    private Emotion emotionBeforeTrade;

    @Enumerated(EnumType.STRING)
    @Column(name = "emotion_during_trade", nullable = false, length = 20)
    private Emotion emotionDuringTrade;

    @Column(name = "mistakes_made", columnDefinition = "TEXT")
    private String mistakesMade;

    @Column(name = "lessons_learned", columnDefinition = "TEXT")
    private String lessonsLearned;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}