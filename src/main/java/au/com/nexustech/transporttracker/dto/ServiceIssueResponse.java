package au.com.nexustech.transporttracker.dto;

import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.enums.IssueCategory;
import au.com.nexustech.transporttracker.enums.IssuePriority;
import au.com.nexustech.transporttracker.enums.IssueStatus;

import java.time.LocalDateTime;

public record ServiceIssueResponse(
        Long id,
        String issueNumber,
        String title,
        String description,
        IssueCategory category,
        IssuePriority priority,
        IssueStatus status,
        Long reportedById,
        Long assignedToId,
        String resolutionNotes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt,
        LocalDateTime closedAt
) {
    public static ServiceIssueResponse from(ServiceIssue issue) {
        Long assignedToId = issue.getAssignedTo() == null
                ? null
                : issue.getAssignedTo().getId();

        return new ServiceIssueResponse(
                issue.getId(),
                issue.getIssueNumber(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getCategory(),
                issue.getPriority(),
                issue.getStatus(),
                issue.getReportedBy().getId(),
                assignedToId,
                issue.getResolutionNotes(),
                issue.getCreatedAt(),
                issue.getUpdatedAt(),
                issue.getResolvedAt(),
                issue.getClosedAt()
        );
    }
}