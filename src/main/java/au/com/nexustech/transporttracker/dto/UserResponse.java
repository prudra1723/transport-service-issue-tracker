package au.com.nexustech.transporttracker.dto;

import au.com.nexustech.transporttracker.entity.AppUser;
import au.com.nexustech.transporttracker.enums.UserRole;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        String email,
        UserRole role,
        boolean active
) {

    public static UserResponse from(
            AppUser user
    ) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getActive() != null
                        && user.getActive() == 1
        );
    }
}