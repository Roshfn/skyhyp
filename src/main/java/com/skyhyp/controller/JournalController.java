package com.skyhyp.controller;

import com.skyhyp.dto.JournalRequest;
import com.skyhyp.dto.JournalResponse;
import com.skyhyp.service.JournalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * NOTE: userId is taken from the path for now, since JWT auth isn't wired in yet.
 * Once Spring Security + JWT is added, replace the {userId} path variable with
 * a value pulled from the authenticated principal (e.g. @AuthenticationPrincipal),
 * so a user can never pass someone else's userId here.
 */
@RestController
@RequestMapping("/api/v1/users/{userId}/journals")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    @PostMapping
    public ResponseEntity<JournalResponse> createJournal(
            @PathVariable UUID userId,
            @Valid @RequestBody JournalRequest request) {

        JournalResponse response = journalService.createJournal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{journalId}")
    public ResponseEntity<JournalResponse> getJournal(
            @PathVariable UUID userId,
            @PathVariable UUID journalId) {

        return ResponseEntity.ok(journalService.getJournal(userId, journalId));
    }

    @GetMapping
    public ResponseEntity<List<JournalResponse>> getAllJournals(@PathVariable UUID userId) {
        return ResponseEntity.ok(journalService.getAllJournals(userId));
    }

    @PutMapping("/{journalId}")
    public ResponseEntity<JournalResponse> updateJournal(
            @PathVariable UUID userId,
            @PathVariable UUID journalId,
            @Valid @RequestBody JournalRequest request) {

        return ResponseEntity.ok(journalService.updateJournal(userId, journalId, request));
    }

    @DeleteMapping("/{journalId}")
    public ResponseEntity<Void> deleteJournal(
            @PathVariable UUID userId,
            @PathVariable UUID journalId) {

        journalService.deleteJournal(userId, journalId);
        return ResponseEntity.noContent().build();
    }
}