package com.skyhyp.service;

import com.skyhyp.dto.auth.CompleteRegistrationRequest;
import com.skyhyp.entity.PendingRegistration;
import com.skyhyp.entity.User;
import com.skyhyp.exception.EmailAlreadyRegisteredException;
import com.skyhyp.exception.OtpException;
import com.skyhyp.exception.PasswordMismatchException;
import com.skyhyp.repository.PendingRegistrationRepository;
import com.skyhyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class RegistrationService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int OTP_VALIDITY_MINUTES = 10;

    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public void initiateRegistration(String gmail) {
        if (userRepository.existsByGmail(gmail)) {
            throw new EmailAlreadyRegisteredException("An account with this email already exists");
        }

        String otp = generateOtp();

        PendingRegistration pending = pendingRegistrationRepository.findByGmail(gmail)
                .orElseGet(() -> PendingRegistration.builder().gmail(gmail).build());

        pending.setOtpCodeHash(passwordEncoder.encode(otp));
        pending.setOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
        pending.setVerified(false);

        pendingRegistrationRepository.save(pending);
        emailService.sendOtpEmail(gmail, otp);
    }

    public void verifyEmail(String gmail, String otp) {
        PendingRegistration pending = pendingRegistrationRepository.findByGmail(gmail)
                .orElseThrow(() -> new OtpException("No pending registration found for this email"));

        if (pending.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new OtpException("OTP has expired. Please request a new one");
        }

        if (!passwordEncoder.matches(otp, pending.getOtpCodeHash())) {
            throw new OtpException("Incorrect OTP");
        }

        pending.setVerified(true);
    }

    public void completeRegistration(CompleteRegistrationRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new PasswordMismatchException("Password and confirmPassword do not match");
        }

        PendingRegistration pending = pendingRegistrationRepository.findByGmail(request.gmail())
                .orElseThrow(() -> new OtpException("No pending registration found for this email"));

        if (!pending.isVerified()) {
            throw new OtpException("Email has not been verified yet");
        }

        if (userRepository.existsByGmail(request.gmail())) {
            throw new EmailAlreadyRegisteredException("An account with this email already exists");
        }

        User user = User.builder()
                .name(request.name())
                .gmail(request.gmail())
                .hashPassword(passwordEncoder.encode(request.password()))
                .build();

        userRepository.save(user);
        pendingRegistrationRepository.delete(pending);
    }

    private String generateOtp() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000); // 6-digit, no leading zero issues
        return String.valueOf(otp);
    }
}