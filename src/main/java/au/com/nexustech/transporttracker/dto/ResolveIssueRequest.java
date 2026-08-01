package au.com.nexustech.transporttracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResolveIssueRequest(

        @NotBlank(message = "Resolution notes are required")
        @Size(
                max = 10000,
                message = "Resolution notes must not exceed 10000 characters"
        )
        String resolutionNotes,

        @NotNull(message = "Resolved-by user ID is required")
        Long resolvedById
) {
}