package com.skyhyp.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompleteRegistrationRequest(

        @NotBlank(message = "gmail is required")
        @Email(message = "gmail must be a valid email address")
        String gmail,

        @NotBlank(message = "name is required")
        @Size(min = 3, max = 50, message = "name must be between 3 and 50 characters")
        String name,

        @NotBlank(message = "password is required")
        @Size(min = 8, message = "password must be at least 8 characters")
        String password,

        @NotBlank(message = "confirmPassword is required")
        String confirmPassword
) {
}