package au.com.nexustech.transporttracker.dto;

import au.com.nexustech.transporttracker.entity.StatusHistory;
import au.com.nexustech.transporttracker.enums.IssueStatus;

import java.time.LocalDateTime;

public record StatusHistoryResponse(
        Long id,
        Long issueId,
        IssueStatus previousStatus,
        IssueStatus newStatus,
        Long changedById,
        String changeReason,
        LocalDateTime changedAt
) {
    public static StatusHistoryResponse from(StatusHistory history) {
        return new StatusHistoryResponse(
                history.getId(),
                history.getIssue().getId(),
                history.getPreviousStatus(),
                history.getNewStatus(),
                history.getChangedBy().getId(),
                history.getChangeReason(),
                history.getChangedAt()
        );
    }
}