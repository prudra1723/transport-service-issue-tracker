package au.com.nexustech.transporttracker.controller;

import au.com.nexustech.transporttracker.dto.AttachmentDownload;
import au.com.nexustech.transporttracker.dto.IssueAttachmentResponse;
import au.com.nexustech.transporttracker.service.AttachmentService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(
            AttachmentService attachmentService
    ) {
        this.attachmentService = attachmentService;
    }

    @PostMapping(
            value = "/issues/{issueNumber}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(HttpStatus.CREATED)
    public IssueAttachmentResponse uploadAttachment(
            @PathVariable String issueNumber,
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) {
        return attachmentService.uploadAttachment(
                issueNumber,
                file,
                authentication
        );
    }

    @GetMapping(
            "/issues/{issueNumber}/attachments"
    )
    public List<IssueAttachmentResponse> getAttachments(
            @PathVariable String issueNumber
    ) {
        return attachmentService.getAttachments(
                issueNumber
        );
    }

    @GetMapping(
            "/attachments/{attachmentId}/download"
    )
    public ResponseEntity<?> downloadAttachment(
            @PathVariable Long attachmentId
    ) {
        AttachmentDownload download =
                attachmentService.downloadAttachment(
                        attachmentId
                );

        MediaType mediaType =
                MediaType.APPLICATION_OCTET_STREAM;

        if (download.contentType() != null) {
            try {
                mediaType = MediaType.parseMediaType(
                        download.contentType()
                );
            } catch (IllegalArgumentException ignored) {
            }
        }

        ContentDisposition disposition =
                ContentDisposition.attachment()
                        .filename(
                                download.originalFilename(),
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .body(download.resource());
    }

    @DeleteMapping(
            "/attachments/{attachmentId}"
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'MANAGER')"
    )
    public void deleteAttachment(
            @PathVariable Long attachmentId
    ) {
        attachmentService.deleteAttachment(
                attachmentId
        );
    }
}