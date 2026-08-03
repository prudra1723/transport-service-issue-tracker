package au.com.nexustech.transporttracker.dto;

import au.com.nexustech.transporttracker.entity.IssueAttachment;

import java.time.LocalDateTime;

public record IssueAttachmentResponse(
        Long id,
        String originalFilename,
        String contentType,
        Long fileSize,
        Long uploadedById,
        String uploadedByUsername,
        LocalDateTime uploadedAt
) {

    public static IssueAttachmentResponse from(
            IssueAttachment attachment
    ) {
        return new IssueAttachmentResponse(
                attachment.getId(),
                attachment.getOriginalFilename(),
                attachment.getContentType(),
                attachment.getFileSize(),
                attachment.getUploadedBy().getId(),
                attachment.getUploadedBy().getUsername(),
                attachment.getUploadedAt()
        );
    }
}