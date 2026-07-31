package au.com.nexustech.transporttracker.dto;

import jakarta.validation.constraints.NotNull;

public record AssignIssueRequest(

        @NotNull(message = "Assigned user ID is required")
        Long assignedToId
) {
}