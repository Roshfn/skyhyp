package com.skyhyp.service;

import com.skyhyp.dto.JournalMapper;
import com.skyhyp.dto.JournalRequest;
import com.skyhyp.dto.JournalResponse;
import com.skyhyp.entity.Journal;
import com.skyhyp.entity.User;
import com.skyhyp.exception.AccessDeniedException;
import com.skyhyp.exception.ResourceNotFoundException;
import com.skyhyp.repository.JournalRepository;
import com.skyhyp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class JournalServiceImpl implements JournalService {

    private final JournalRepository journalRepository;
    private final UserRepository userRepository;

    public JournalServiceImpl(JournalRepository journalRepository,
                          UserRepository userRepository) {
        this.journalRepository = journalRepository;
        this.userRepository = userRepository;
    }

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
        // Ensures a 404 (not an empty list) if the userId itself doesn't exist.
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
        // No explicit save() needed - entity is managed within this @Transactional method,
        // so JPA dirty-checking flushes the changes automatically at commit.
        return JournalMapper.toResponse(journal);
    }

    @Override
    public void deleteJournal(UUID userId, UUID journalId) {
        Journal journal = getJournalOwnedByUserOrThrow(userId, journalId);
        journalRepository.delete(journal);
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