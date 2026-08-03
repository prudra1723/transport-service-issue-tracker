package au.com.nexustech.transporttracker.dto;

import org.springframework.core.io.Resource;

public record AttachmentDownload(
        Resource resource,
        String originalFilename,
        String contentType
) {
}