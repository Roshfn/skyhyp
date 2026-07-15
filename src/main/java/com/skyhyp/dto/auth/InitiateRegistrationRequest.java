package com.skyhyp.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InitiateRegistrationRequest(

        @NotBlank(message = "gmail is required")
        @Email(message = "gmail must be a valid email address")
        String gmail
) {
}