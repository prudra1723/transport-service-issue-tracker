package au.com.nexustech.transporttracker.dto;

import au.com.nexustech.transporttracker.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(

        @NotNull(message = "Role is required")
        UserRole role

) {
}