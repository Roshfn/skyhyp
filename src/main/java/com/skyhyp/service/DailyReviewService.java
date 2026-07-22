package com.skyhyp.service;

import com.skyhyp.dto.DailyReviewRequest;
import com.skyhyp.dto.DailyReviewResponse;
import com.skyhyp.entity.DailyReview;
import com.skyhyp.entity.User;
import com.skyhyp.exception.ResourceNotFoundException;
import com.skyhyp.repository.DailyReviewRepository;
import com.skyhyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DailyReviewService {

    private final DailyReviewRepository dailyReviewRepository;
    private final UserRepository userRepository;

    /**
     * Create-or-update is the natural operation here: from the user's point of view
     * there's exactly one review per day, so "save today's review" should just work
     * whether today already has one or not - no separate create/update endpoints,
     * no 409 for "already exists".
     */
    public DailyReviewResponse upsertReview(UUID userId, LocalDate date, DailyReviewRequest request) {
        DailyReview review = dailyReviewRepository.findByUser_UserIdAndReviewDate(userId, date)
                .orElseGet(() -> DailyReview.builder()
                        .user(getUserOrThrow(userId))
                        .reviewDate(date)
                        .build());

        review.setContent(request.content());
        DailyReview saved = dailyReviewRepository.save(review);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public DailyReviewResponse getReview(UUID userId, LocalDate date) {
        DailyReview review = dailyReviewRepository.findByUser_UserIdAndReviewDate(userId, date)
                .orElseThrow(() -> new ResourceNotFoundException("No review found for " + date));
        return toResponse(review);
    }

    @Transactional(readOnly = true)
    public List<DailyReviewResponse> getReviewsInRange(UUID userId, LocalDate start, LocalDate end) {
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("end date must not be before start date");
        }

        return dailyReviewRepository.findByUser_UserIdAndReviewDateBetweenOrderByReviewDate(userId, start, end)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void deleteReview(UUID userId, LocalDate date) {
        dailyReviewRepository.deleteByUser_UserIdAndReviewDate(userId, date);
        // No existence check first - deleting something that isn't there is a no-op,
        // which is the correct, idempotent behavior for DELETE.
    }

    private User getUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private DailyReviewResponse toResponse(DailyReview review) {
        return new DailyReviewResponse(
                review.getReviewId(),
                review.getReviewDate(),
                review.getContent(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}