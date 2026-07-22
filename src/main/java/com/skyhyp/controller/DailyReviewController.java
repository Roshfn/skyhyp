package com.skyhyp.controller;

import com.skyhyp.dto.DailyReviewRequest;
import com.skyhyp.dto.DailyReviewResponse;
import com.skyhyp.security.UserPrincipal;
import com.skyhyp.service.DailyReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class DailyReviewController {

    private final DailyReviewService dailyReviewService;

    /**
     * Create or update the review for this date. Idempotent by design -
     * calling it twice for the same date just overwrites the content.
     *   PUT /api/v1/reviews/2026-07-19
     */
    @PutMapping ("/{date}")
    public ResponseEntity<DailyReviewResponse> upsertReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody DailyReviewRequest request) {

        return ResponseEntity.ok(dailyReviewService.upsertReview(principal.userId(), date, request));
    }

    @GetMapping("/{date}")
    public ResponseEntity<DailyReviewResponse> getReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(dailyReviewService.getReview(principal.userId(), date));
    }

    /**
     * Range fetch for the calendar view, e.g. one calendar month at a time:
     *   GET /api/v1/reviews?start=2026-07-01&end=2026-07-31
     */
    @GetMapping
    public ResponseEntity<List<DailyReviewResponse>> getReviewsInRange(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        return ResponseEntity.ok(dailyReviewService.getReviewsInRange(principal.userId(), start, end));
    }

    @DeleteMapping("/{date}")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        dailyReviewService.deleteReview(principal.userId(), date);
        return ResponseEntity.noContent().build();
    }
}