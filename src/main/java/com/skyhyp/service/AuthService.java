package com.skyhyp.service;

import com.skyhyp.dto.auth.AuthResponse;
import com.skyhyp.dto.auth.LoginRequest;
import com.skyhyp.entity.User;
import com.skyhyp.exception.InvalidCredentialsException;
import com.skyhyp.repository.UserRepository;
import com.skyhyp.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    // Generic message on purpose - never reveal whether the email or password was the wrong part.
    private static final String INVALID_CREDENTIALS_MESSAGE = "Invalid gmail or password";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByGmail(request.gmail())
                .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE));

        if (!passwordEncoder.matches(request.password(), user.getHashPassword())) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        }

        return issueTokenPair(user);
    }

    public AuthResponse refresh(String rawRefreshToken) {
        User user = refreshTokenService.consumeAndRotate(rawRefreshToken);
        return issueTokenPair(user);
    }

    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    private AuthResponse issueTokenPair(User user) {
        String accessToken = jwtService.generateAccessToken(user.getUserId(), user.getGmail());
        String refreshToken = refreshTokenService.issue(user);

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.accessTokenExpirySeconds()
        );
    }
}