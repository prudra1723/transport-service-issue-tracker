package au.com.nexustech.transporttracker.dto;

import au.com.nexustech.transporttracker.entity.IssueComment;
import au.com.nexustech.transporttracker.enums.CommentType;

import java.time.LocalDateTime;

public record IssueCommentResponse(
        Long id,
        Long issueId,
        Long authorId,
        String commentText,
        CommentType commentType,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static IssueCommentResponse from(IssueComment comment) {
        return new IssueCommentResponse(
                comment.getId(),
                comment.getIssue().getId(),
                comment.getAuthor().getId(),
                comment.getCommentText(),
                comment.getCommentType(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}