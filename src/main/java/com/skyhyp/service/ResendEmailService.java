package com.skyhyp.service;

import com.skyhyp.config.ResendProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResendEmailService implements EmailService {

    private static final String RESEND_BASE_URL = "https://api.resend.com";

    private final ResendProperties resendProperties;

    private RestClient restClient() {
        return RestClient.builder()
                .baseUrl(RESEND_BASE_URL)
                .defaultHeader("Authorization", "Bearer " + resendProperties.apiKey())
                .build();
    }

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        String html = """
                <p>Your skyhyp verification code is:</p>
                <h2>%s</h2>
                <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
                """.formatted(otp);

        Map<String, Object> payload = Map.of(
                "from", resendProperties.fromEmail(),
                "to", new String[]{toEmail},
                "subject", "Verify your skyhyp account",
                "html", html
        );

        try {
            restClient().post()
                    .uri("/emails")
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            // Don't leak Resend's internal error details to the client - log and surface a generic failure.
            log.error("Failed to send OTP email via Resend to {}", toEmail, ex);
            throw new IllegalStateException("Failed to send verification email. Please try again shortly.");
        }
    }
}