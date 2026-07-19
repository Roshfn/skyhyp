package com.skyhyp.service;

import com.skyhyp.dto.dashboard.DashboardResponse;
import com.skyhyp.exception.ResourceNotFoundException;
import com.skyhyp.repository.JournalRepository;
import com.skyhyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final JournalRepository journalRepository;
    private final UserRepository userRepository;
    private final DashboardCalculator calculator;

    public DashboardResponse getDashboard(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        var journals = journalRepository.findByUser_UserIdOrderByDateDesc(userId);
        return calculator.calculate(journals);
    }
}