package com.skyhyp.security;

import java.util.UUID;

/**
 * What ends up as Authentication#getPrincipal() once a request's JWT is validated.
 * Deliberately minimal - just enough to identify the caller without another DB hit per request.
 */
public record UserPrincipal(UUID userId, String gmail) {
}