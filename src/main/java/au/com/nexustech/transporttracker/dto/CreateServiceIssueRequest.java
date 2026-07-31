package au.com.nexustech.transporttracker.dto;

import au.com.nexustech.transporttracker.enums.IssueCategory;
import au.com.nexustech.transporttracker.enums.IssuePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateServiceIssueRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @NotNull(message = "Category is required")
        IssueCategory category,

        @NotNull(message = "Priority is required")
        IssuePriority priority,

        @NotNull(message = "Reporter ID is required")
        Long reportedById
) {
}