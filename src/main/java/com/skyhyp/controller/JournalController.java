package com.skyhyp.controller;

import com.skyhyp.dto.DailyPnlResponse;
import com.skyhyp.dto.JournalRequest;
import com.skyhyp.dto.JournalResponse;
import com.skyhyp.security.UserPrincipal;
import com.skyhyp.service.JournalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/journals")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    @PostMapping
    public ResponseEntity<JournalResponse> createJournal(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody JournalRequest request) {

        JournalResponse response = journalService.createJournal(principal.userId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{journalId}")
    public ResponseEntity<JournalResponse> getJournal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID journalId) {

        return ResponseEntity.ok(journalService.getJournal(principal.userId(), journalId));
    }

    @GetMapping
    public ResponseEntity<List<JournalResponse>> getAllJournals(
            @AuthenticationPrincipal UserPrincipal principal) {

        return ResponseEntity.ok(journalService.getAllJournals(principal.userId()));
    }

    @PutMapping("/{journalId}")
    public ResponseEntity<JournalResponse> updateJournal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID journalId,
            @Valid @RequestBody JournalRequest request) {

        return ResponseEntity.ok(journalService.updateJournal(principal.userId(), journalId, request));
    }

    @DeleteMapping("/{journalId}")
    public ResponseEntity<Void> deleteJournal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID journalId) {

        journalService.deleteJournal(principal.userId(), journalId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/heatmap")
    public ResponseEntity<List<DailyPnlResponse>> getDailyPnl(
            @AuthenticationPrincipal UserPrincipal principal) {

        int currentYear = Year.now().getValue();
        LocalDate start = LocalDate.of(currentYear, 1, 1);
        LocalDate end = LocalDate.of(currentYear, 12, 31);

        return ResponseEntity.ok(journalService.getDailyPnl(principal.userId(), start, end));
    }
}