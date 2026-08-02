package au.com.nexustech.transporttracker.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserActiveRequest(

        @NotNull(message = "Active status is required")
        Boolean active

) {
}