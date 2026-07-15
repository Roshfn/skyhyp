package com.skyhyp.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyEmailRequest(

        @NotBlank(message = "gmail is required")
        @Email(message = "gmail must be a valid email address")
        String gmail,

        @NotBlank(message = "otp is required")
        @Pattern(regexp = "\\d{6}", message = "otp must be a 6-digit code")
        String otp
) {
}