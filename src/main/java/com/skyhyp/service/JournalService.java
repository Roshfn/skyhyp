package com.skyhyp.service;

import com.skyhyp.dto.JournalRequest;
import com.skyhyp.dto.JournalResponse;

import java.util.List;
import java.util.UUID;

public interface JournalService {

    JournalResponse createJournal(UUID userId, JournalRequest request);

    JournalResponse getJournal(UUID userId, UUID journalId);

    List<JournalResponse> getAllJournals(UUID userId);

    JournalResponse updateJournal(UUID userId, UUID journalId, JournalRequest request);

    void deleteJournal(UUID userId, UUID journalId);
}