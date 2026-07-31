package au.com.nexustech.transporttracker.dto;

import au.com.nexustech.transporttracker.enums.IssuePriority;
import jakarta.validation.constraints.NotNull;

public record UpdatePriorityRequest(

        @NotNull(message = "Priority is required")
        IssuePriority priority
) {
}