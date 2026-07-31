package au.com.nexustech.transporttracker.dto;

import au.com.nexustech.transporttracker.enums.IssueStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateStatusRequest(

        @NotNull(message = "Status is required")
        IssueStatus status,

        @Size(max = 500, message = "Reason must not exceed 500 characters")
        String reason,

        @NotNull(message = "Changed-by user ID is required")
        Long changedById
) {
}