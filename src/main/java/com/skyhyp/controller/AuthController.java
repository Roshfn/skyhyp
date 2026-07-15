package com.skyhyp.controller;

import com.skyhyp.dto.auth.*;
import com.skyhyp.service.AuthService;
import com.skyhyp.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Every endpoint under /api/v1/auth/** is listed as permitAll in SecurityConfig -
 * none of these require a JWT, which is the whole point of a login/signup flow.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegistrationService registrationService;
    private final AuthService authService;

    @PostMapping("/register/initiate")
    public ResponseEntity<MessageResponse> initiateRegistration(
            @Valid @RequestBody InitiateRegistrationRequest request) {

        registrationService.initiateRegistration(request.gmail());
        return ResponseEntity.ok(new MessageResponse("Verification code sent to " + request.gmail()));
    }

    @PostMapping("/register/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        registrationService.verifyEmail(request.gmail(), request.otp());
        return ResponseEntity.ok(new MessageResponse("Email verified. You can now choose a username and password"));
    }

    @PostMapping("/register/complete")
    public ResponseEntity<MessageResponse> completeRegistration(
            @Valid @RequestBody CompleteRegistrationRequest request) {

        registrationService.completeRegistration(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("Account created successfully. Please log in"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }
}