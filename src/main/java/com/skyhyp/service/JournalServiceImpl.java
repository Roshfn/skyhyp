package com.skyhyp.service;

import com.skyhyp.dto.DailyPnlResponse;
import com.skyhyp.dto.JournalMapper;
import com.skyhyp.dto.JournalRequest;
import com.skyhyp.dto.JournalResponse;
import com.skyhyp.entity.Journal;
import com.skyhyp.entity.User;
import com.skyhyp.exception.AccessDeniedException;
import com.skyhyp.exception.ResourceNotFoundException;
import com.skyhyp.repository.JournalRepository;
import com.skyhyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class JournalServiceImpl implements JournalService {

    private static final long MAX_RANGE_DAYS = 366;

    private final JournalRepository journalRepository;
    private final UserRepository userRepository;

    @Override
    public JournalResponse createJournal(UUID userId, JournalRequest request) {
        User user = getUserOrThrow(userId);
        Journal journal = JournalMapper.toEntity(request, user);
        Journal saved = journalRepository.save(journal);
        return JournalMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public JournalResponse getJournal(UUID userId, UUID journalId) {
        Journal journal = getJournalOwnedByUserOrThrow(userId, journalId);
        return JournalMapper.toResponse(journal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JournalResponse> getAllJournals(UUID userId) {
        getUserOrThrow(userId);

        return journalRepository.findByUser_UserIdOrderByDateDesc(userId)
                .stream()
                .map(JournalMapper::toResponse)
                .toList();
    }

    @Override
    public JournalResponse updateJournal(UUID userId, UUID journalId, JournalRequest request) {
        Journal journal = getJournalOwnedByUserOrThrow(userId, journalId);
        JournalMapper.updateEntity(journal, request);
        return JournalMapper.toResponse(journal);
    }

    @Override
    public void deleteJournal(UUID userId, UUID journalId) {
        Journal journal = getJournalOwnedByUserOrThrow(userId, journalId);
        journalRepository.delete(journal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyPnlResponse> getDailyPnl(UUID userId, LocalDate start, LocalDate end) {
        getUserOrThrow(userId);

        if (end.isBefore(start)) {
            throw new IllegalArgumentException("end date must not be before start date");
        }
        if (ChronoUnit.DAYS.between(start, end) > MAX_RANGE_DAYS) {
            throw new IllegalArgumentException("date range must not exceed " + MAX_RANGE_DAYS + " days");
        }

        return journalRepository.aggregateDailyPnl(userId, start, end);
    }

    private User getUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private Journal getJournalOwnedByUserOrThrow(UUID userId, UUID journalId) {
        Journal journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found with id: " + journalId));

        if (!journal.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("This journal entry does not belong to the given user");
        }

        return journal;
    }
}