package au.com.nexustech.transporttracker.dto.auth;

import au.com.nexustech.transporttracker.enums.UserRole;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String username,
        String fullName,
        String email,
        UserRole role
) {
}