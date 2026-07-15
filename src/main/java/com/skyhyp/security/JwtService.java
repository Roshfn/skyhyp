package com.skyhyp.security;

import com.skyhyp.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Handles only the short-lived ACCESS token. Refresh tokens are opaque, DB-stored
 * strings handled separately by RefreshTokenService - they are not JWTs.
 */
@Component
@RequiredArgsConstructor
public class JwtService {

    private static final String CLAIM_GMAIL = "gmail";

    private final JwtProperties jwtProperties;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.secret()));
    }

    public String generateAccessToken(UUID userId, String gmail) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(jwtProperties.accessTokenExpirationMs());

        return Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIM_GMAIL, gmail)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey())
                .compact();
    }

    public long accessTokenExpirySeconds() {
        return jwtProperties.accessTokenExpirationMs() / 1000;
    }

    /**
     * Returns the validated principal, or null if the token is missing, malformed,
     * expired, or signed with the wrong key. Callers treat null as "not authenticated"
     * rather than throwing, so a bad token results in a clean 401 instead of a 500.
     */
    public UserPrincipal parseAndValidate(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            UUID userId = UUID.fromString(claims.getSubject());
            String gmail = claims.get(CLAIM_GMAIL, String.class);
            return new UserPrincipal(userId, gmail);
        } catch (JwtException | IllegalArgumentException ex) {
            return null;
        }
    }
}