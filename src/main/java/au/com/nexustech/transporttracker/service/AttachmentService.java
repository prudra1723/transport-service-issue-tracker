package au.com.nexustech.transporttracker.service;

import au.com.nexustech.transporttracker.dto.AttachmentDownload;
import au.com.nexustech.transporttracker.dto.IssueAttachmentResponse;
import au.com.nexustech.transporttracker.entity.AppUser;
import au.com.nexustech.transporttracker.entity.IssueAttachment;
import au.com.nexustech.transporttracker.entity.ServiceIssue;
import au.com.nexustech.transporttracker.exception.BusinessRuleException;
import au.com.nexustech.transporttracker.exception.ResourceNotFoundException;
import au.com.nexustech.transporttracker.repository.AppUserRepository;
import au.com.nexustech.transporttracker.repository.IssueAttachmentRepository;
import au.com.nexustech.transporttracker.repository.ServiceIssueRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class AttachmentService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
            "text/plain",
            "text/csv",
            "application/json",
            "application/zip"
    );

    private final IssueAttachmentRepository attachmentRepository;
    private final ServiceIssueRepository serviceIssueRepository;
    private final AppUserRepository appUserRepository;
    private final Path storageRoot;

    public AttachmentService(
        IssueAttachmentRepository attachmentRepository,
        ServiceIssueRepository serviceIssueRepository,
        AppUserRepository appUserRepository,
        @Value("${app.storage.attachments-dir:target/test-uploads/attachments}")
        String storageDirectory
) {
    this.attachmentRepository = attachmentRepository;
    this.serviceIssueRepository = serviceIssueRepository;
    this.appUserRepository = appUserRepository;
    this.storageRoot = Path.of(storageDirectory)
            .toAbsolutePath()
            .normalize();

    try {
        Files.createDirectories(this.storageRoot);
    } catch (IOException exception) {
        throw new IllegalStateException(
                "Unable to initialise attachment storage",
                exception
        );
    }
}

    public IssueAttachmentResponse uploadAttachment(
            String issueNumber,
            MultipartFile file,
            Authentication authentication
    ) {
        validateFile(file);

        ServiceIssue issue = serviceIssueRepository
                .findByIssueNumber(issueNumber)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Issue not found: " + issueNumber
                        )
                );

        AppUser uploadedBy = appUserRepository
                .findByUsername(authentication.getName())
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Authenticated user not found"
                        )
                );

        String originalFilename = sanitizeFilename(
                file.getOriginalFilename()
        );

        String extension = getExtension(originalFilename);

        String storedFilename =
                UUID.randomUUID() + extension;

        Path targetPath = storageRoot
                .resolve(storedFilename)
                .normalize();

        if (!targetPath.startsWith(storageRoot)) {
            throw new BusinessRuleException(
                    "Invalid storage path"
            );
        }

        try {
            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException exception) {
            throw new BusinessRuleException(
                    "Unable to store attachment"
            );
        }

        IssueAttachment attachment = new IssueAttachment(
                issue,
                uploadedBy,
                originalFilename,
                storedFilename,
                file.getContentType(),
                file.getSize(),
                targetPath.toString()
        );

        IssueAttachment savedAttachment;

        try {
            savedAttachment =
                    attachmentRepository.save(attachment);
        } catch (RuntimeException exception) {
            deleteFileQuietly(targetPath);
            throw exception;
        }

        return IssueAttachmentResponse.from(savedAttachment);
    }

    @Transactional(readOnly = true)
    public List<IssueAttachmentResponse> getAttachments(
            String issueNumber
    ) {
        ServiceIssue issue = serviceIssueRepository
                .findByIssueNumber(issueNumber)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Issue not found: " + issueNumber
                        )
                );

        return attachmentRepository
                .findByIssueIdOrderByUploadedAtDesc(
                        issue.getId()
                )
                .stream()
                .map(IssueAttachmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AttachmentDownload downloadAttachment(
            Long attachmentId
    ) {
        IssueAttachment attachment =
                findAttachment(attachmentId);

        Path filePath = Path.of(
                attachment.getStoragePath()
        )
                .toAbsolutePath()
                .normalize();

        if (!filePath.startsWith(storageRoot)) {
            throw new BusinessRuleException(
                    "Invalid attachment storage path"
            );
        }

        try {
            Resource resource =
                    new UrlResource(filePath.toUri());

            if (
                    !resource.exists() ||
                    !resource.isReadable()
            ) {
                throw new ResourceNotFoundException(
                        "Attachment file not found"
                );
            }

            return new AttachmentDownload(
                    resource,
                    attachment.getOriginalFilename(),
                    attachment.getContentType()
            );
        } catch (IOException exception) {
            throw new BusinessRuleException(
                    "Unable to read attachment"
            );
        }
    }

    public void deleteAttachment(
            Long attachmentId
    ) {
        IssueAttachment attachment =
                findAttachment(attachmentId);

        Path filePath = Path.of(
                attachment.getStoragePath()
        )
                .toAbsolutePath()
                .normalize();

        attachmentRepository.delete(attachment);

        deleteFileQuietly(filePath);
    }

    private IssueAttachment findAttachment(
            Long attachmentId
    ) {
        return attachmentRepository
                .findById(attachmentId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Attachment not found with ID: "
                                        + attachmentId
                        )
                );
    }

    private void validateFile(
            MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException(
                    "Please select a file"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessRuleException(
                    "File size must not exceed 10 MB"
            );
        }

        String contentType = file.getContentType();

        if (
                contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(contentType)
        ) {
            throw new BusinessRuleException(
                    "Unsupported file type"
            );
        }
    }

    private String sanitizeFilename(
            String filename
    ) {
        String cleaned = StringUtils.cleanPath(
                filename == null
                        ? "attachment"
                        : filename
        );

        if (
                cleaned.contains("..") ||
                cleaned.contains("/") ||
                cleaned.contains("\\")
        ) {
            throw new BusinessRuleException(
                    "Invalid filename"
            );
        }

        return cleaned;
    }

    private String getExtension(
            String filename
    ) {
        int lastDot = filename.lastIndexOf('.');

        if (
                lastDot < 0 ||
                lastDot == filename.length() - 1
        ) {
            return "";
        }

        return filename.substring(lastDot);
    }

    private void deleteFileQuietly(
            Path path
    ) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
    }
}